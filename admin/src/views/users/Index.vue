<template>
  <div class="users-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
        </div>
      </template>

      <div class="toolbar">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索用户名"
          clearable
          style="width: 200px"
          @change="loadUsers"
        />
        <el-select
          v-model="searchForm.status"
          placeholder="用户状态"
          clearable
          style="width: 150px"
          @change="loadUsers"
        >
          <el-option label="正常" value="normal" />
          <el-option label="封禁" value="banned" />
        </el-select>
        <el-button type="primary" @click="loadUsers">搜索</el-button>
      </div>

      <el-table
        :data="users"
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar" />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'normal' ? 'success' : 'danger'">
              {{ row.status === 'normal' ? '正常' : '封禁' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="180" />
        <el-table-column prop="lastOnlineAt" label="最后在线" width="180" />
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewUser(row)">查看</el-button>
            <el-button
              v-if="row.status === 'normal'"
              link
              type="danger"
              @click="handleBan(row)"
            >
              封禁
            </el-button>
            <el-button
              v-else
              link
              type="success"
              @click="handleUnban(row)"
            >
              解封
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadUsers"
          @current-change="loadUsers"
        />
      </div>
    </el-card>

    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="用户详情"
      width="600px"
    >
      <el-descriptions v-if="currentUser" :column="2" border>
        <el-descriptions-item label="ID">{{ currentUser.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentUser.email }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentUser.phone }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentUser.status === 'normal' ? 'success' : 'danger'">
            {{ currentUser.status === 'normal' ? '正常' : '封禁' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ currentUser.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="最后在线">{{ currentUser.lastOnlineAt }}</el-descriptions-item>
        <el-descriptions-item label="消息数">{{ currentUser.messageCount }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 封禁对话框 -->
    <el-dialog
      v-model="banVisible"
      title="封禁用户"
      width="400px"
    >
      <el-form :model="banForm" label-width="80px">
        <el-form-item label="封禁原因">
          <el-input
            v-model="banForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入封禁原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="banVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmBan">确认封禁</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getUserList, banUser, unbanUser } from '@/api/user';

const users = ref<any[]>([]);
const loading = ref(false);
const detailVisible = ref(false);
const banVisible = ref(false);
const currentUser = ref<any>(null);

const searchForm = ref({
  keyword: '',
  status: '',
});

const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
});

const banForm = ref({
  reason: '',
});

const loadUsers = async () => {
  loading.value = true;
  try {
    const response = await getUserList({
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      keyword: searchForm.value.keyword,
      status: searchForm.value.status,
    });

    users.value = response.data.users;
    pagination.value.total = response.data.total;
  } catch (error) {
    ElMessage.error('加载用户列表失败');
  } finally {
    loading.value = false;
  }
};

const viewUser = async (user: any) => {
  currentUser.value = user;
  detailVisible.value = true;
};

const handleBan = (user: any) => {
  currentUser.value = user;
  banForm.value.reason = '';
  banVisible.value = true;
};

const confirmBan = async () => {
  if (!banForm.value.reason) {
    ElMessage.warning('请输入封禁原因');
    return;
  }

  try {
    await banUser(currentUser.value.id, banForm.value.reason);
    ElMessage.success('封禁成功');
    banVisible.value = false;
    loadUsers();
  } catch (error) {
    ElMessage.error('封禁失败');
  }
};

const handleUnban = async (user: any) => {
  try {
    await ElMessageBox.confirm('确定要解封该用户吗？', '提示', {
      type: 'warning',
    });

    await unbanUser(user.id);
    ElMessage.success('解封成功');
    loadUsers();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('解封失败');
    }
  }
};

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.users-page {
  padding: 20px;
}

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>