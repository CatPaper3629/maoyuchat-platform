import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Message, Conversation } from '@/types';
import { getConversations, getMessages, sendMessage } from '@/api/message';
import { wsService } from '@/utils/websocket';

export const useChatStore = defineStore('chat', () => {
  const conversations = ref<Conversation[]>([]);
  const currentConversation = ref<Conversation | null>(null);
  const messages = ref<Map<number, Message[]>>(new Map());
  const unreadCount = ref<number>(0);
  const typingUsers = ref<number[]>([]);
  const isConnected = ref<boolean>(false);

  // 获取会话列表
  const fetchConversations = async () => {
    try {
      const response = await getConversations();
      conversations.value = response.data;
      unreadCount.value = conversations.value.reduce((sum, conv) => sum + conv.unreadCount, 0);
    } catch (error) {
      console.error('获取会话列表失败:', error);
    }
  };

  // 获取消息历史
  const fetchMessages = async (receiverType: 'user' | 'group', receiverId: number) => {
    try {
      const response = await getMessages(receiverType, receiverId);
      const key = `${receiverType}-${receiverId}`;
      messages.value.set(key, response.data.messages);
      return response.data.messages;
    } catch (error) {
      console.error('获取消息历史失败:', error);
      return [];
    }
  };

  // 发送消息
  const sendNewMessage = async (data: {
    receiverType: 'user' | 'group';
    receiverId: number;
    contentType: string;
    content: string;
    extraData?: any;
    replyToId?: number;
  }) => {
    try {
      // 优先使用 WebSocket 发送
      const wsSent = wsService.sendMessage(data);
      
      let messageData;
      if (wsSent) {
        // WebSocket 发送成功，等待服务器确认
        messageData = {
          id: Date.now(),
          ...data,
          senderId: 0, // 从 user store 获取
          senderName: '我',
          status: 'sent' as const,
          createdAt: new Date().toISOString(),
        };
      } else {
        // WebSocket 发送失败，使用 HTTP 备用
        const response = await sendMessage(data);
        messageData = response.data;
      }

      const key = `${data.receiverType}-${data.receiverId}`;
      const msgList = messages.value.get(key) || [];
      msgList.push(messageData);
      messages.value.set(key, msgList);

      // 更新会话列表
      updateConversationLastMessage(messageData);

      return messageData;
    } catch (error) {
      console.error('发送消息失败:', error);
      throw error;
    }
  };

  // 接收新消息
  const receiveMessage = (message: Message) => {
    const key = `${message.receiverType}-${message.receiverId}`;
    const msgList = messages.value.get(key) || [];
    msgList.push(message);
    messages.value.set(key, msgList);

    // 如果不是当前会话，增加未读数
    if (currentConversation.value) {
      const isCurrent =
        message.receiverType === currentConversation.value.receiverType &&
        message.receiverId === currentConversation.value.receiverId;
      
      if (!isCurrent) {
        incrementUnreadCount(message);
      }
    } else {
      incrementUnreadCount(message);
    }

    // 更新会话列表顺序
    bringConversationToTop(message);
  };

  // 更新会话最后一条消息
  const updateConversationLastMessage = (message: Message) => {
    const conv = conversations.value.find(
      c =>
        c.receiverType === message.receiverType &&
        c.receiverId === message.receiverId
    );
    if (conv) {
      conv.lastMessage = message;
      conv.updatedAt = new Date().toISOString();
    }
  };

  // 增加未读数
  const incrementUnreadCount = (message: Message) => {
    const conv = conversations.value.find(
      c =>
        c.receiverType === message.receiverType &&
        c.receiverId === message.receiverId
    );
    if (conv) {
      conv.unreadCount++;
      unreadCount.value++;
    }
  };

  // 将会话移到顶部
  const bringConversationToTop = (message: Message) => {
    const index = conversations.value.findIndex(
      c =>
        c.receiverType === message.receiverType &&
        c.receiverId === message.receiverId
    );
    if (index > -1) {
      const conv = conversations.value.splice(index, 1)[0];
      conversations.value.unshift(conv);
    }
  };

  // 标记消息已读
  const markAsRead = (conversationId: number) => {
    const conv = conversations.value.find(c => c.id === conversationId);
    if (conv) {
      unreadCount.value -= conv.unreadCount;
      conv.unreadCount = 0;
    }
  };

  // 设置当前会话
  const setCurrentConversation = (conv: Conversation | null) => {
    currentConversation.value = conv;
    if (conv) {
      markAsRead(conv.id);
    }
  };

  // 发送输入状态
  const sendTyping = (isTyping: boolean) => {
    if (currentConversation.value) {
      wsService.sendTyping({
        receiverType: currentConversation.value.receiverType,
        receiverId: currentConversation.value.receiverId,
        isTyping,
      });
    }
  };

  // 更新输入状态
  const updateTyping = (userId: number, isTyping: boolean) => {
    if (isTyping) {
      if (!typingUsers.value.includes(userId)) {
        typingUsers.value.push(userId);
      }
    } else {
      const index = typingUsers.value.indexOf(userId);
      if (index > -1) {
        typingUsers.value.splice(index, 1);
      }
    }
  };

  // 置顶会话
  const pinConversation = (conversationId: number) => {
    const conv = conversations.value.find(c => c.id === conversationId);
    if (conv) {
      conv.isPinned = !conv.isPinned;
    }
  };

  // 免打扰
  const muteConversation = (conversationId: number) => {
    const conv = conversations.value.find(c => c.id === conversationId);
    if (conv) {
      conv.isMuted = !conv.isMuted;
    }
  };

  // 连接 WebSocket
  const connectWebSocket = () => {
    wsService.connect();
    isConnected.value = wsService.isConnected();
  };

  // 断开 WebSocket
  const disconnectWebSocket = () => {
    wsService.disconnect();
    isConnected.value = false;
  };

  return {
    conversations,
    currentConversation,
    messages,
    unreadCount,
    typingUsers,
    isConnected,
    fetchConversations,
    fetchMessages,
    sendNewMessage,
    receiveMessage,
    markAsRead,
    setCurrentConversation,
    sendTyping,
    updateTyping,
    pinConversation,
    muteConversation,
    connectWebSocket,
    disconnectWebSocket,
  };
});