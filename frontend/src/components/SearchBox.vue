<template>
  <div class="search-box">
    <div class="search-input-container">
      <svg class="search-icon" viewBox="0 0 24 24" width="20" height="20">
        <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
      </svg>
      <input
        ref="searchInput"
        v-model="searchKeyword"
        type="text"
        :placeholder="placeholder"
        @focus="showDropdown = true"
        @input="handleSearch"
        @keydown="handleKeydown"
      />
      <button v-if="searchKeyword" class="clear-btn" @click="clearSearch">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>

    <div v-if="showDropdown" class="search-dropdown" ref="dropdown">
      <!-- 搜索历史 -->
      <div v-if="!searchKeyword && searchHistory.length > 0" class="search-section">
        <div class="section-header">
          <span>搜索历史</span>
          <button class="clear-history-btn" @click="clearHistory">清空</button>
        </div>
        <div class="history-list">
          <div
            v-for="(item, index) in searchHistory"
            :key="index"
            class="history-item"
            @click="selectHistory(item)"
          >
            <svg class="history-icon" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
            </svg>
            <span>{{ item }}</span>
          </div>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div v-if="searchKeyword && !isLoading" class="search-section">
        <!-- 用户结果 -->
        <div v-if="searchResults.users.length > 0" class="result-group">
          <div class="group-title">用户</div>
          <div
            v-for="user in searchResults.users"
            :key="user.id"
            class="result-item"
            @click="selectUser(user)"
          >
            <img :src="user.avatar || '/default-avatar.png'" :alt="user.username" class="avatar" />
            <div class="user-info">
              <div class="name">{{ user.username }}</div>
              <div v-if="user.bio" class="bio">{{ user.bio }}</div>
            </div>
          </div>
        </div>

        <!-- 群组结果 -->
        <div v-if="searchResults.groups.length > 0" class="result-group">
          <div class="group-title">群组</div>
          <div
            v-for="group in searchResults.groups"
            :key="group.id"
            class="result-item"
            @click="selectGroup(group)"
          >
            <img :src="group.avatar || '/default-group.png'" :alt="group.name" class="avatar" />
            <div class="group-info">
              <div class="name">{{ group.name }}</div>
              <div class="member-count">{{ group.memberCount }} 成员</div>
            </div>
          </div>
        </div>

        <!-- 无结果 -->
        <div v-if="searchResults.users.length === 0 && searchResults.groups.length === 0" class="no-results">
          <svg viewBox="0 0 24 24" width="48" height="48">
            <path fill="#ccc" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <p>未找到相关结果</p>
        </div>
      </div>

      <!-- 加载中 -->
      <div v-if="isLoading" class="loading">
        <svg class="spinner" viewBox="0 0 50 50" width="30" height="30">
          <circle cx="25" cy="25" r="20" fill="none" stroke="#1890ff" stroke-width="4">
            <animate attributeName="stroke-dasharray" from="0 120" to="120 0" dur="1s" repeatCount="indefinite"/>
          </circle>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { searchUsers } from '@/api/search';
import { getSearchHistory, clearSearchHistory as clearHistoryAPI, addSearchHistory } from '@/api/search';

interface Props {
  placeholder?: string;
  searchType?: 'all' | 'user' | 'group' | 'message';
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜索用户、群组...',
  searchType: 'all',
});

const emit = defineEmits<{
  (e: 'search', keyword: string): void;
  (e: 'selectUser', user: any): void;
  (e: 'selectGroup', group: any): void;
}>();

const searchKeyword = ref('');
const searchHistory = ref<string[]>([]);
const searchResults = ref<{
  users: any[];
  groups: any[];
}>({ users: [], groups: [] });
const showDropdown = ref(false);
const isLoading = ref(false);
const searchInput = ref<HTMLInputElement | null>(null);
const dropdown = ref<HTMLDivElement | null>(null);
let searchTimer: number | null = null;

// 加载搜索历史
onMounted(async () => {
  try {
    const response = await getSearchHistory();
    searchHistory.value = response.data.history;
  } catch (error) {
    console.error('加载搜索历史失败:', error);
  }
  
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
});

const handleSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }

  if (!searchKeyword.value.trim()) {
    searchResults.value = { users: [], groups: [] };
    return;
  }

  searchTimer = window.setTimeout(async () => {
    isLoading.value = true;
    try {
      const response = await searchUsers(searchKeyword.value);
      searchResults.value = response.data;
      emit('search', searchKeyword.value);
    } catch (error) {
      console.error('搜索失败:', error);
      searchResults.value = { users: [], groups: [] };
    } finally {
      isLoading.value = false;
    }
  }, 300);
};

const selectHistory = (keyword: string) => {
  searchKeyword.value = keyword;
  handleSearch();
  showDropdown.value = false;
};

const selectUser = (user: any) => {
  emit('selectUser', user);
  addToHistory(searchKeyword.value);
  showDropdown.value = false;
  searchKeyword.value = '';
};

const selectGroup = (group: any) => {
  emit('selectGroup', group);
  addToHistory(searchKeyword.value);
  showDropdown.value = false;
  searchKeyword.value = '';
};

const clearSearch = () => {
  searchKeyword.value = '';
  searchResults.value = { users: [], groups: [] };
  searchInput.value?.focus();
};

const clearHistory = async () => {
  try {
    await clearHistoryAPI();
    searchHistory.value = [];
  } catch (error) {
    console.error('清空搜索历史失败:', error);
  }
};

const addToHistory = async (keyword: string) => {
  try {
    // 移除重复项
    const index = searchHistory.value.indexOf(keyword);
    if (index > -1) {
      searchHistory.value.splice(index, 1);
    }
    
    // 添加到开头
    searchHistory.value.unshift(keyword);
    
    // 限制历史记录数量
    if (searchHistory.value.length > 10) {
      searchHistory.value.pop();
    }
    
    // 保存到服务器
    await addSearchHistory(keyword);
  } catch (error) {
    console.error('保存搜索历史失败:', error);
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && searchKeyword.value.trim()) {
    emit('search', searchKeyword.value);
    showDropdown.value = false;
  } else if (event.key === 'Escape') {
    showDropdown.value = false;
  }
};

const handleClickOutside = (event: MouseEvent) => {
  if (dropdown.value && !dropdown.value.contains(event.target as Node)) {
    showDropdown.value = false;
  }
};

watch(searchKeyword, (newVal) => {
  if (!newVal) {
    searchResults.value = { users: [], groups: [] };
  }
});
</script>

<style scoped>
.search-box {
  position: relative;
  width: 100%;
}

.search-input-container {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 20px;
  transition: background 0.3s;
}

.search-input-container:focus-within {
  background: white;
  box-shadow: 0 0 0 2px #1890ff;
}

.search-icon {
  color: #999;
  flex-shrink: 0;
}

.search-input-container input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  margin: 0 8px;
  font-size: 14px;
}

.clear-btn {
  padding: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.clear-btn:hover {
  color: #666;
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
}

.search-section {
  padding: 8px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  font-size: 12px;
  color: #999;
}

.clear-history-btn {
  background: transparent;
  border: none;
  color: #1890ff;
  cursor: pointer;
  font-size: 12px;
}

.clear-history-btn:hover {
  text-decoration: underline;
}

.history-list {
  display: flex;
  flex-direction: column;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.history-item:hover {
  background: #f5f5f5;
}

.history-icon {
  color: #999;
  flex-shrink: 0;
}

.result-group {
  padding: 8px 0;
}

.group-title {
  padding: 8px 16px;
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.result-item:hover {
  background: #f5f5f5;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.user-info,
.group-info {
  flex: 1;
  min-width: 0;
}

.name {
  font-size: 14px;
  color: #333;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bio,
.member-count {
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #999;
}

.no-results p {
  margin-top: 12px;
  font-size: 14px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>