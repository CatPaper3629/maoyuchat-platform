<template>
  <div class="chat-container">
    <!-- 左侧边栏 - 联系人列表 -->
    <el-aside width="300px" class="sidebar">
      <div class="user-info">
        <el-avatar :size="50" :src="userStore.currentUser?.avatarUrl">
          {{ userStore.currentUser?.nickname?.[0] || 'U' }}
        </el-avatar>
        <div class="user-details">
          <div class="username">{{ userStore.currentUser?.nickname || userStore.currentUser?.username }}</div>
          <div class="status">{{ getStatusText(userStore.currentUser?.status) }}</div>
        </div>
        <el-dropdown trigger="click">
          <el-button circle icon="MoreFilled" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="router.push('/profile')">个人资料</el-dropdown-item>
              <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <el-tabs v-model="activeTab" class="tabs">
        <el-tab-pane label="会话" name="conversations">
          <div class="conversation-list">
            <div
              v-for="conv in chatStore.conversations"
              :key="conv.id"
              class="conversation-item"
              :class="{ active: chatStore.currentConversation?.id === conv.id }"
              @click="selectConversation(conv)"
            >
              <el-badge :is-dot="conv.unreadCount > 0" class="item">
                <el-avatar :size="48" :src="getAvatar(conv)">
                  {{ getAvatarText(conv) }}
                </el-avatar>
              </el-badge>
              <div class="conversation-info">
                <div class="conversation-name">{{ getConversationName(conv) }}</div>
                <div class="conversation-preview">{{ getLastMessage(conv) }}</div>
              </div>
              <div class="conversation-meta">
                <div class="time">{{ formatTime(conv.updatedAt) }}</div>
                <div v-if="conv.unreadCount > 0" class="unread-count">{{ conv.unreadCount }}</div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="联系人" name="contacts">
          <div class="contact-list">
            <div class="contact-item">
              <el-avatar :size="48">?</el-avatar>
              <div class="contact-info">
                <div class="contact-name">功能开发中</div>
                <div class="contact-status">即将上线</div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-aside>

    <!-- 中间 - 聊天区域 -->
    <el-main class="chat-main">
      <div v-if="chatStore.currentConversation" class="chat-area">
        <!-- 聊天头部 -->
        <div class="chat-header">
          <h3>{{ getConversationName(chatStore.currentConversation) }}</h3>
        </div>

        <!-- 消息列表 -->
        <div class="message-list" ref="messageListRef">
          <div
            v-for="msg in currentMessages"
            :key="msg.id"
            class="message-item"
            :class="{ 'message-self': msg.senderId === userStore.currentUser?.id }"
          >
            <el-avatar :size="40" :src="getAvatarByUserId(msg.senderId)">
              {{ getAvatarTextById(msg.senderId) }}
            </el-avatar>
            <div class="message-content">
              <div class="message-sender">{{ getSenderName(msg.senderId) }}</div>
              <div class="message-bubble">
                {{ msg.content }}
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input">
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="3"
            placeholder="输入消息..."
            @keyup.ctrl.enter="sendMessage"
          />
          <div class="input-actions">
            <el-button-group>
              <el-button icon="Picture">图片</el-button>
              <el-button icon="Microphone">语音</el-button>
              <el-button icon="Folder">文件</el-button>
            </el-button-group>
            <el-button type="primary" @click="sendMessage">发送 (Ctrl+Enter)</el-button>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <el-empty description="选择一个会话开始聊天" />
      </div>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { useChatStore } from '@/stores/chat';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const router = useRouter();
const userStore = useUserStore();
const chatStore = useChatStore();

const activeTab = ref('conversations');
const inputMessage = ref('');
const messageListRef = ref<HTMLElement>();

const currentMessages = computed(() => {
  if (!chatStore.currentConversation) return [];
  const key = `${chatStore.currentConversation.type}-${chatStore.currentConversation.targetId}`;
  return chatStore.messages.get(key) || [];
});

const getStatusText = (status?: string) => {
  const statusMap: Record<string, string> = {
    online: '在线',
    offline: '离线',
    away: '离开',
    busy: '忙碌',
  };
  return statusMap[status || 'offline'] || '离线';
};

const getConversationName = (conv: any) => {
  return conv.type === 'group' ? '群组名称' : '用户名称';
};

const getAvatar = (conv: any) => {
  return undefined;
};

const getAvatarText = (conv: any) => {
  return conv.type === 'group' ? '群' : 'U';
};

const getLastMessage = (conv: any) => {
  return conv.lastMessageId ? '最后一条消息...' : '暂无消息';
};

const getAvatarByUserId = (userId: number) => {
  return undefined;
};

const getAvatarTextById = (userId: number) => {
  return 'U';
};

const getSenderName = (userId: number) => {
  return userId === userStore.currentUser?.id ? '我' : '对方';
};

const formatTime = (time: Date) => {
  return dayjs(time).fromNow();
};

const selectConversation = async (conv: any) => {
  chatStore.setCurrentConversation(conv);
  await chatStore.fetchMessages(conv.type, conv.targetId);
  scrollToBottom();
};

const sendMessage = async () => {
  if (!inputMessage.value.trim() || !chatStore.currentConversation) return;

  try {
    await chatStore.sendNewMessage({
      receiverType: chatStore.currentConversation.type,
      receiverId: chatStore.currentConversation.targetId,
      contentType: 'text',
      content: inputMessage.value,
    });
    inputMessage.value = '';
    scrollToBottom();
  } catch (error) {
    ElMessage.error('发送失败');
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
    }
  });
};

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    userStore.logout();
    router.push('/login');
  });
};

onMounted(async () => {
  await chatStore.fetchConversations();
});
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100vh;
  background: #f5f5f5;
}

.sidebar {
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.user-details {
  flex: 1;
  margin-left: 12px;
}

.username {
  font-weight: bold;
  font-size: 16px;
}

.status {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.conversation-list,
.contact-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item,
.contact-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.conversation-item:hover,
.contact-item:hover {
  background: #f5f5f5;
}

.conversation-item.active {
  background: #e6f7ff;
}

.conversation-info,
.contact-info {
  flex: 1;
  margin-left: 12px;
}

.conversation-name,
.contact-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.conversation-preview,
.contact-status {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.time {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.unread-count {
  background: #ff4d4f;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 12px;
  min-width: 18px;
  text-align: center;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

.chat-area {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.chat-header h3 {
  margin: 0;
  font-size: 18px;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f5f5f5;
}

.message-item {
  display: flex;
  margin-bottom: 16px;
}

.message-item.message-self {
  flex-direction: row-reverse;
}

.message-content {
  margin: 0 12px;
  max-width: 60%;
}

.message-sender {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.message-item.message-self .message-sender {
  text-align: right;
}

.message-bubble {
  padding: 10px 14px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
}

.message-item.message-self .message-bubble {
  background: #95ec69;
}

.chat-input {
  padding: 16px 20px;
  border-top: 1px solid #e0e0e0;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>