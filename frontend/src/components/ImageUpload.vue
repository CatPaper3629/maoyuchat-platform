<template>
  <div class="image-upload">
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      @change="handleFileChange"
      style="display: none"
    />
    <button class="upload-btn" @click="triggerUpload">
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
      </svg>
      发送图片
    </button>

    <div v-if="previewImages.length > 0" class="preview-container">
      <div
        v-for="(image, index) in previewImages"
        :key="index"
        class="preview-item"
      >
        <img :src="image.url" :alt="`Preview ${index}`" />
        <button class="remove-btn" @click="removeImage(index)">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { uploadFile } from '@/api/message';

const emit = defineEmits<{
  (e: 'upload', images: Array<{ url: string; file: File }>): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const previewImages = ref<Array<{ url: string; file: File }>>([]);
const uploading = ref(false);

const triggerUpload = () => {
  fileInput.value?.click();
};

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (!files || files.length === 0) return;

  uploading.value = true;

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // 检查文件大小（限制 10MB）
      if (file.size > 10 * 1024 * 1024) {
        alert(`图片 ${file.name} 超过 10MB 限制`);
        continue;
      }

      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} 不是有效的图片文件`);
        continue;
      }

      // 创建预览
      const url = URL.createObjectURL(file);
      previewImages.value.push({ url, file });
    }
  } catch (error) {
    console.error('处理图片失败:', error);
    alert('处理图片失败，请重试');
  } finally {
    uploading.value = false;
    // 清空 input
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
};

const removeImage = (index: number) => {
  URL.revokeObjectURL(previewImages.value[index].url);
  previewImages.value.splice(index, 1);
};

const uploadSelectedImages = async () => {
  if (uploading.value || previewImages.value.length === 0) {
    return [];
  }

  uploading.value = true;
  const uploadedUrls: string[] = [];

  try {
    for (const image of previewImages.value) {
      const response = await uploadFile(image.file, 'image');
      uploadedUrls.push(response.data.url);
    }

    // 清空预览
    previewImages.value.forEach(img => URL.revokeObjectURL(img.url));
    previewImages.value = [];

    return uploadedUrls;
  } catch (error) {
    console.error('上传图片失败:', error);
    alert('上传图片失败，请重试');
    return [];
  } finally {
    uploading.value = false;
  }
};

const sendImages = async () => {
  const urls = await uploadSelectedImages();
  if (urls.length > 0) {
    emit('upload', urls.map((url, index) => ({
      url,
      file: previewImages.value[index]?.file
    })));
  }
};

defineExpose({
  uploadSelectedImages,
  sendImages,
  clearPreview: () => {
    previewImages.value.forEach(img => URL.revokeObjectURL(img.url));
    previewImages.value = [];
  },
  hasImages: () => previewImages.value.length > 0,
});
</script>

<style scoped>
.image-upload {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upload-btn {
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

.upload-btn:hover {
  background: #40a9ff;
}

.upload-btn:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

.preview-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
}

.preview-item {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 4px;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.remove-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}
</style>