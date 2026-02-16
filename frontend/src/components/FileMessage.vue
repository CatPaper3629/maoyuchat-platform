<template>
  <div class="file-message">
    <div class="file-icon" :class="fileTypeClass">
      <svg v-if="isImage" viewBox="0 0 24 24" width="32" height="32">
        <path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
      </svg>
      <svg v-else-if="isVideo" viewBox="0 0 24 24" width="32" height="32">
        <path fill="currentColor" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
      </svg>
      <svg v-else-if="isAudio" viewBox="0 0 24 24" width="32" height="32">
        <path fill="currentColor" d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
      </svg>
      <svg v-else-if="isPDF" viewBox="0 0 24 24" width="32" height="32">
        <path fill="currentColor" d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" width="32" height="32">
        <path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
      </svg>
    </div>

    <div class="file-info">
      <div class="file-name">{{ fileName }}</div>
      <div class="file-meta">
        <span class="file-size">{{ formatSize(fileSize) }}</span>
        <span v-if="status === 'uploading'" class="upload-progress">
          上传中 {{ progress }}%
        </span>
        <span v-else-if="status === 'success'" class="upload-success">
          上传成功
        </span>
        <span v-else-if="status === 'error'" class="upload-error">
          上传失败
        </span>
      </div>
    </div>

    <div v-if="status === 'uploading'" class="upload-bar">
      <div class="upload-progress-bar" :style="{ width: `${progress}%` }"></div>
    </div>

    <button
      v-if="status === 'success'"
      class="download-btn"
      @click="downloadFile"
    >
      下载
    </button>

    <button
      v-if="status === 'error'"
      class="retry-btn"
      @click="retryUpload"
    >
      重试
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { uploadFile } from '@/api/message';

interface Props {
  file?: File;
  content?: string;
  extraData?: {
    fileName?: string;
    fileSize?: number;
  };
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'uploaded', url: string): void;
}>();

const status = ref<'idle' | 'uploading' | 'success' | 'error'>('idle');
const progress = ref(0);

const fileName = computed(() => {
  return props.extraData?.fileName || props.file?.name || '未知文件';
});

const fileSize = computed(() => {
  return props.extraData?.fileSize || props.file?.size || 0;
});

const isImage = computed(() => {
  const name = fileName.value.toLowerCase();
  return name.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/);
});

const isVideo = computed(() => {
  const name = fileName.value.toLowerCase();
  return name.match(/\.(mp4|webm|ogg|mov|avi)$/);
});

const isAudio = computed(() => {
  const name = fileName.value.toLowerCase();
  return name.match(/\.(mp3|wav|ogg|flac|m4a)$/);
});

const isPDF = computed(() => {
  const name = fileName.value.toLowerCase();
  return name.match(/\.pdf$/);
});

const fileTypeClass = computed(() => {
  if (isImage.value) return 'image';
  if (isVideo.value) return 'video';
  if (isAudio.value) return 'audio';
  if (isPDF.value) return 'pdf';
  return 'default';
});

const uploadFileData = async () => {
  if (!props.file) return;

  status.value = 'uploading';
  progress.value = 0;

  try {
    const response = await uploadFile(props.file, 'file');
    status.value = 'success';
    emit('uploaded', response.data.url);
  } catch (error) {
    console.error('上传文件失败:', error);
    status.value = 'error';
  }
};

const retryUpload = () => {
  uploadFileData();
};

const downloadFile = () => {
  if (props.content) {
    const link = document.createElement('a');
    link.href = props.content;
    link.download = fileName.value;
    link.click();
  }
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes}B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)}KB`;
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  } else {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
  }
};

// 如果有文件，自动上传
if (props.file) {
  uploadFileData();
}
</script>

<style scoped>
.file-message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  max-width: 320px;
  position: relative;
}

.file-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: white;
}

.file-icon.image {
  background: #52c41a;
}

.file-icon.video {
  background: #1890ff;
}

.file-icon.audio {
  background: #722ed1;
}

.file-icon.pdf {
  background: #f5222d;
}

.file-icon.default {
  background: #8c8c8c;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.file-meta {
  font-size: 12px;
  color: #666;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.upload-progress,
.upload-success,
.upload-error {
  font-weight: 500;
}

.upload-progress {
  color: #1890ff;
}

.upload-success {
  color: #52c41a;
}

.upload-error {
  color: #ff4d4f;
}

.upload-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #e8e8e8;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}

.upload-progress-bar {
  height: 100%;
  background: #1890ff;
  transition: width 0.3s;
}

.download-btn,
.retry-btn {
  padding: 4px 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.3s;
  flex-shrink: 0;
}

.download-btn:hover,
.retry-btn:hover {
  background: #40a9ff;
}

.retry-btn {
  background: #ff4d4f;
}

.retry-btn:hover {
  background: #ff7875;
}
</style>