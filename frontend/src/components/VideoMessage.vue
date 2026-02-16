<template>
  <div class="video-message">
    <div class="video-container" @click="playVideo">
      <video
        ref="videoPlayer"
        :src="videoSrc"
        :poster="thumbnail"
        preload="metadata"
        @click.stop
      ></video>
      
      <div v-if="!isPlaying" class="play-overlay">
        <div class="play-icon">
          <svg viewBox="0 0 24 24" width="48" height="48">
            <path fill="currentColor" d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
    </div>

    <div class="video-info">
      <div class="duration">{{ formatDuration(duration) }}</div>
      <div class="size">{{ formatSize(fileSize) }}</div>
    </div>

    <video-player
      v-if="showPlayer"
      :src="videoSrc"
      :poster="thumbnail"
      @close="showPlayer = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import VideoPlayer from './VideoPlayer.vue';

interface Props {
  content: string;
  extraData?: {
    duration?: number;
    fileSize?: number;
    thumbnail?: string;
  };
}

const props = withDefaults(defineProps<Props>(), {
  extraData: () => ({}),
});

const videoPlayer = ref<HTMLVideoElement | null>(null);
const isPlaying = ref(false);
const showPlayer = ref(false);

const videoSrc = computed(() => props.content);
const duration = computed(() => props.extraData?.duration || 0);
const fileSize = computed(() => props.extraData?.fileSize || 0);
const thumbnail = computed(() => props.extraData?.thumbnail || '');

onMounted(() => {
  if (videoPlayer.value) {
    videoPlayer.value.addEventListener('play', () => {
      isPlaying.value = true;
    });

    videoPlayer.value.addEventListener('pause', () => {
      isPlaying.value = false;
    });

    videoPlayer.value.addEventListener('ended', () => {
      isPlaying.value = false;
    });
  }
});

const playVideo = () => {
  showPlayer.value = true;
};

const formatDuration = (seconds: number) => {
  if (seconds < 60) {
    return `${Math.floor(seconds)}秒`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}分${secs}秒`;
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
</script>

<style scoped>
.video-message {
  max-width: 320px;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.video-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  cursor: pointer;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
}

.video-container video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.video-container:hover .play-overlay {
  background: rgba(0, 0, 0, 0.6);
}

.play-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.video-container:hover .play-icon {
  transform: scale(1.1);
}

.play-icon svg {
  color: #1890ff;
}

.video-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  font-size: 12px;
  color: #666;
  background: #fafafa;
}
</style>