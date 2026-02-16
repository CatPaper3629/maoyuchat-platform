<template>
  <div class="image-preview">
    <img
      v-for="(message, index) in imageMessages"
      :key="index"
      :src="message.content"
      :alt="`Image message ${index}`"
      class="preview-image"
      @click="openImageViewer(message)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Message } from '@/types';

interface Props {
  messages: Message[];
}

const props = defineProps<Props>();

const imageMessages = computed(() => {
  return props.messages.filter(msg => msg.contentType === 'image');
});

const openImageViewer = (message: Message) => {
  // 打开图片查看器
  const imageViewer = document.createElement('div');
  imageViewer.className = 'image-viewer';
  imageViewer.innerHTML = `
    <div class="image-viewer-content">
      <img src="${message.content}" alt="Image" />
      <button class="close-btn">&times;</button>
    </div>
  `;
  
  document.body.appendChild(imageViewer);

  const closeBtn = imageViewer.querySelector('.close-btn') as HTMLButtonElement;
  const content = imageViewer.querySelector('.image-viewer-content') as HTMLDivElement;

  closeBtn?.addEventListener('click', () => {
    document.body.removeChild(imageViewer);
  });

  content?.addEventListener('click', (e) => {
    if (e.target === content) {
      document.body.removeChild(imageViewer);
    }
  });

  // ESC 键关闭
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      document.body.removeChild(imageViewer);
      document.removeEventListener('keydown', handleEscape);
    }
  };

  document.addEventListener('keydown', handleEscape);
};
</script>

<style scoped>
.image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 8px 0;
}

.preview-image {
  max-width: 200px;
  max-height: 200px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.preview-image:hover {
  transform: scale(1.05);
}

/* 全局样式 */
:global(.image-viewer) {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

:global(.image-viewer-content) {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

:global(.image-viewer-content img) {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 4px;
}

:global(.close-btn) {
  position: absolute;
  top: -40px;
  right: 0;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

:global(.close-btn:hover) {
  background: rgba(255, 255, 255, 0.3);
}
</style>