<template>
  <div class="voice-recorder">
    <button
      v-if="!isRecording"
      class="record-btn"
      @mousedown="startRecording"
      @touchstart.prevent="startRecording"
    >
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
        <path fill="currentColor" d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
      </svg>
      按住说话
    </button>

    <div v-else class="recording-status">
      <div class="wave-animation">
        <span v-for="i in 5" :key="i" class="wave"></span>
      </div>
      <span class="duration">{{ formatDuration(recordingDuration) }}</span>
      <button class="cancel-btn" @click="cancelRecording">取消</button>
    </div>

    <audio
      v-if="audioUrl"
      ref="audioPlayer"
      :src="audioUrl"
      @ended="onPlaybackEnded"
      style="display: none"
    ></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { uploadFile } from '@/api/message';

const emit = defineEmits<{
  (e: 'recorded', audioUrl: string, duration: number): void;
}>();

const isRecording = ref(false);
const recordingDuration = ref(0);
const audioUrl = ref('');
const mediaRecorder = ref<MediaRecorder | null>(null);
const audioChunks = ref<Blob[]>([]);
const recordingStartTime = ref<number>(0);
const timer = ref<number | null>(null);
const audioPlayer = ref<HTMLAudioElement | null>(null);
const maxDuration = 60; // 最大录制时长 60 秒

onMounted(() => {
  // 添加鼠标松开事件监听
  document.addEventListener('mouseup', stopRecording);
  document.addEventListener('touchend', stopRecording);
});

onUnmounted(() => {
  document.removeEventListener('mouseup', stopRecording);
  document.removeEventListener('touchend', stopRecording);
  if (timer.value) {
    clearInterval(timer.value);
  }
  if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
    mediaRecorder.value.stop();
  }
});

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    mediaRecorder.value = new MediaRecorder(stream);
    audioChunks.value = [];
    
    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.value.push(event.data);
      }
    };

    mediaRecorder.value.onstop = async () => {
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' });
      const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
      
      try {
        const response = await uploadFile(audioFile, 'voice');
        const uploadedUrl = response.data.url;
        audioUrl.value = uploadedUrl;
        emit('recorded', uploadedUrl, recordingDuration.value);
      } catch (error) {
        console.error('上传语音失败:', error);
        alert('上传语音失败，请重试');
      }

      // 停止所有音频轨道
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.value.start();
    isRecording.value = true;
    recordingDuration.value = 0;
    recordingStartTime.value = Date.now();
    
    // 开始计时
    timer.value = window.setInterval(() => {
      recordingDuration.value = (Date.now() - recordingStartTime.value) / 1000;
      
      // 超过最大时长自动停止
      if (recordingDuration.value >= maxDuration) {
        stopRecording();
      }
    }, 100);

  } catch (error) {
    console.error('无法访问麦克风:', error);
    alert('无法访问麦克风，请检查权限设置');
  }
};

const stopRecording = () => {
  if (!isRecording.value || !mediaRecorder.value) return;
  
  // 检查录制时长是否太短
  if (recordingDuration.value < 1) {
    alert('说话时间太短，请重新录制');
    cancelRecording();
    return;
  }
  
  mediaRecorder.value.stop();
  isRecording.value = false;
  
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
};

const cancelRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
    mediaRecorder.value.stop();
  }
  
  isRecording.value = false;
  recordingDuration.value = 0;
  audioChunks.value = [];
  
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const onPlaybackEnded = () => {
  console.log('语音播放结束');
};

defineExpose({
  cancelRecording,
  reset: () => {
    audioUrl.value = '';
    isRecording.value = false;
    recordingDuration.value = 0;
  },
});
</script>

<style scoped>
.voice-recorder {
  display: flex;
  align-items: center;
  gap: 10px;
}

.record-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.record-btn:hover {
  background: #40a9ff;
}

.recording-status {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: #fff1f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
}

.wave-animation {
  display: flex;
  align-items: center;
  gap: 3px;
}

.wave {
  width: 3px;
  height: 20px;
  background: #ff4d4f;
  border-radius: 2px;
  animation: wave 0.5s ease-in-out infinite;
}

.wave:nth-child(1) { animation-delay: 0s; }
.wave:nth-child(2) { animation-delay: 0.1s; }
.wave:nth-child(3) { animation-delay: 0.2s; }
.wave:nth-child(4) { animation-delay: 0.3s; }
.wave:nth-child(5) { animation-delay: 0.4s; }

@keyframes wave {
  0%, 100% {
    height: 10px;
  }
  50% {
    height: 20px;
  }
}

.duration {
  font-size: 14px;
  color: #ff4d4f;
  font-weight: 500;
  min-width: 50px;
}

.cancel-btn {
  padding: 4px 12px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.3s;
}

.cancel-btn:hover {
  background: #ff7875;
}
</style>