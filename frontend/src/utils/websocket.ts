import { io, Socket } from 'socket.io-client';
import { useUserStore } from '@/stores/user';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;

  connect() {
    const userStore = useUserStore();
    const token = userStore.token;

    if (!token) {
      console.error('No token available');
      return;
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
    
    this.socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectInterval,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // 服务器主动断开，需要手动重连
        this.reconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('message', (data) => {
      console.log('Received message:', data);
      this.handleMessage(data);
    });

    this.socket.on('status', (data) => {
      console.log('Received status update:', data);
      this.handleStatusUpdate(data);
    });

    this.socket.on('typing', (data) => {
      console.log('Received typing indicator:', data);
      this.handleTyping(data);
    });

    this.socket.on('notification', (data) => {
      console.log('Received notification:', data);
      this.handleNotification(data);
    });
  }

  private handleMessage(data: any) {
    // 使用 Pinia store 处理新消息
    const { useChatStore } = require('@/stores/chat');
    const chatStore = useChatStore();
    chatStore.receiveMessage(data.data);
  }

  private handleStatusUpdate(data: any) {
    // 处理用户状态更新
    console.log('Status update:', data);
  }

  private handleTyping(data: any) {
    // 处理输入状态指示器
    console.log('Typing:', data);
  }

  private handleNotification(data: any) {
    // 处理通知
    console.log('Notification:', data);
  }

  sendMessage(data: {
    receiverType: 'user' | 'group';
    receiverId: number;
    contentType: string;
    content: string;
    extraData?: any;
    replyToId?: number;
  }) {
    if (!this.socket?.connected) {
      console.error('WebSocket not connected');
      return false;
    }

    this.socket.emit('message', data);
    return true;
  }

  sendTyping(data: {
    receiverType: 'user' | 'group';
    receiverId: number;
    isTyping: boolean;
  }) {
    if (!this.socket?.connected) {
      return false;
    }

    this.socket.emit('typing', data);
    return true;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  reconnect() {
    console.log('Attempting to reconnect...');
    this.disconnect();
    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// 导出单例
export const wsService = new WebSocketService();