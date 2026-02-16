<template>
  <div class="voice-message">
    <button class="play-btn" @click="togglePlay" :disabled="isLoading">
      <svg v-if="!isPlaying" viewBox="0 0 24 24" width="24" height="24">
        <path fill="currentColor" d="M8 5v14l11-7z"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" width="24" height="24">
        <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
      </svg>
    </button>

    <div class="waveform">
      <div
        v-for="(amplitude, index) in waveform"
        :key="index"
        class="wave-bar"
        :style="{ height: `${amplitude}%` }"
      ></div>
    </div>

    <span class="duration">{{ formatDuration(duration) }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';

interface Props {
  src: string;
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  duration: 0,
});

const isPlaying = ref(false);
const isLoading = ref(false);
const duration = ref(props.duration);
const currentTime = ref(0);
const audio = ref<HTMLAudioElement | null>(null);
const waveform = ref<number[]>([]);

onMounted(() => {
  audio.value = new Audio(props.src);
  
  audio.value.addEventListener('loadedmetadata', () => {
    if (!props.duration) {
      duration.value = audio.value?.duration || 0;
    }
    generateWaveform();
  });

  audio.value.addEventListener('timeupdate', () => {
    if (audio.value) {
      currentTime.value = audio.value.currentTime;
      updateWaveform();
    }
  });

  audio.value.addEventListener('ended', () => {
    isPlaying.value = false;
    currentTime.value = 0;
  });

  audio.value.addEventListener('error', () => {
    console.error('加载语音失败');
    isLoading.value = false;
  });
});

onUnmounted(() => {
  if (audio.value) {
    audio.value.pause();
    audio.value = null;
  }
});

const togglePlay = async () => {
  if (!audio.value) return;

  if (isPlaying.value) {
    audio.value.pause();
    isPlaying.value = false;
  } else {
    isLoading.value = true;
    try {
      await audio.value.play();
      isPlaying.value = true;
    } catch (error) {
      console.error('播放失败:', error);
    } finally {
      isLoading.value = false;
    }
  }
};

const generateWaveform = () => {
  // 生成模拟波形数据
  const bars = 30;
  const waveformData: number[] = [];
  
  for (let i = 0; i < bars; i++) {
    // 生成随机波形
    const amplitude = Math.random() * 60 + 40; // 40% - 100%
    waveformData.push(amplitude);
  }
  
  waveform.value = waveformData;
};

const updateWaveform = () => {
  if (!audio.value || waveform.value.length === 0) return;
  
  const progress = currentTime.value / duration.value;
  const activeBars = Math.floor(progress * waveform.value.length);
  
  waveform.value = waveform.value.map((amplitude, index) => {
    if (index < activeBars) {
      return amplitude; // 已播放部分
    }
    return Math.random() * 40 + 20; // 未播放部分降低高度
  });
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 监听 src 变化
watch(() => props.src, (newSrc) => {
  if (audio.value && newSrc !== audio.value.src) {
    audio.value.src = newSrc;
    audio.value.load();
  }
});
</script>

<style scoped>
.voice-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 12px;
  max-width: 280px;
}

.play-btn {
  width: 36px;
  height: 36px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s, transform 0.2s;
  flex-shrink: 0;
}

.play-btn:hover {
  background: #40a9ff;
  transform: scale(1.1);
}

.play-btn:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
  transform: none;
}

.play-btn:active {
  transform: scale(0.95);
}

.waveform {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 2px;
  height: 30px;
}

.wave-bar {
  width: 3px;
  background: #1890ff;
  border-radius: 2px;
  transition: height 0.1s ease-out;
  min-height: 6px;
}

.duration {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  min-width: 45px;
}
</style>