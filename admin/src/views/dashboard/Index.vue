<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon user">
              <el-icon :size="32"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalUsers }}</div>
              <div class="stat-label">总用户数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon online">
              <el-icon :size="32"><Connection /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.onlineUsers }}</div>
              <div class="stat-label">在线用户</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon message">
              <el-icon :size="32"><ChatDotRound /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalMessages }}</div>
              <div class="stat-label">总消息数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon group">
              <el-icon :size="32"><UserFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalGroups }}</div>
              <div class="stat-label">总群组数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>用户活跃度趋势</span>
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @change="loadActivityData"
              />
            </div>
          </template>
          <div ref="activityChart" style="height: 300px"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>消息量统计</span>
              <el-select v-model="messagePeriod" @change="loadMessageData">
                <el-option label="最近7天" value="7d" />
                <el-option label="最近30天" value="30d" />
                <el-option label="最近90天" value="90d" />
              </el-select>
            </div>
          </template>
          <div ref="messageChart" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>系统资源使用情况</span>
              <el-button @click="loadSystemData">刷新</el-button>
            </div>
          </template>
          <div ref="resourceChart" style="height: 200px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { User, Connection, ChatDotRound, UserFilled } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import {
  getUserStats,
  getOnlineUsers,
  getMessageStats,
  getSystemResources,
  getActivityStats,
} from '@/api/user';
import { getGroupStats } from '@/api/system';

const stats = ref({
  totalUsers: 0,
  onlineUsers: 0,
  totalMessages: 0,
  totalGroups: 0,
});

const dateRange = ref<[Date, Date]>([
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  new Date(),
]);
const messagePeriod = ref('7d');

const activityChart = ref<HTMLDivElement>();
const messageChart = ref<HTMLDivElement>();
const resourceChart = ref<HTMLDivElement>();

let activityChartInstance: echarts.ECharts | null = null;
let messageChartInstance: echarts.ECharts | null = null;
let resourceChartInstance: echarts.ECharts | null = null;

const loadStats = async () => {
  try {
    const [userStats, online, groupStats] = await Promise.all([
      getUserStats(),
      getOnlineUsers(),
      getGroupStats(),
    ]);

    stats.value = {
      totalUsers: userStats.data.total || 0,
      onlineUsers: online.data.count || 0,
      totalMessages: userStats.data.totalMessages || 0,
      totalGroups: groupStats.data.total || 0,
    };
  } catch (error) {
    ElMessage.error('加载统计数据失败');
  }
};

const loadActivityData = async () => {
  if (!activityChartInstance) return;

  try {
    const response = await getActivityStats({
      period: '7d',
    });

    const data = response.data;

    activityChartInstance.setOption({
      xAxis: {
        type: 'category',
        data: data.dates,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '活跃用户',
          type: 'line',
          data: data.activeUsers,
          smooth: true,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.05)' },
            ]),
          },
        },
      ],
    });
  } catch (error) {
    ElMessage.error('加载活跃度数据失败');
  }
};

const loadMessageData = async () => {
  if (!messageChartInstance) return;

  try {
    const response = await getMessageStats({
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
    });

    const data = response.data;

    messageChartInstance.setOption({
      xAxis: {
        type: 'category',
        data: data.dates,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '消息量',
          type: 'bar',
          data: data.counts,
          itemStyle: {
            color: '#1890ff',
          },
        },
      ],
    });
  } catch (error) {
    ElMessage.error('加载消息数据失败');
  }
};

const loadSystemData = async () => {
  if (!resourceChartInstance) return;

  try {
    const response = await getSystemResources();
    const data = response.data;

    resourceChartInstance.setOption({
      series: [
        {
          name: 'CPU',
          type: 'gauge',
          min: 0,
          max: 100,
          data: [{ value: data.cpu }],
          center: ['20%', '50%'],
          radius: '70%',
        },
        {
          name: '内存',
          type: 'gauge',
          min: 0,
          max: 100,
          data: [{ value: data.memory }],
          center: ['50%', '50%'],
          radius: '70%',
        },
        {
          name: '磁盘',
          type: 'gauge',
          min: 0,
          max: 100,
          data: [{ value: data.disk }],
          center: ['80%', '50%'],
          radius: '70%',
        },
      ],
    });
  } catch (error) {
    ElMessage.error('加载系统数据失败');
  }
};

const initCharts = () => {
  if (activityChart.value) {
    activityChartInstance = echarts.init(activityChart.value);
    activityChartInstance.setOption({
      title: { text: '活跃用户趋势' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: [{ type: 'line', data: [] }],
    });
  }

  if (messageChart.value) {
    messageChartInstance = echarts.init(messageChart.value);
    messageChartInstance.setOption({
      title: { text: '消息量统计' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: [] }],
    });
  }

  if (resourceChart.value) {
    resourceChartInstance = echarts.init(resourceChart.value);
    resourceChartInstance.setOption({
      series: [
        { type: 'gauge', data: [{ value: 0 }] },
        { type: 'gauge', data: [{ value: 0 }] },
        { type: 'gauge', data: [{ value: 0 }] },
      ],
    });
  }
};

onMounted(async () => {
  await Promise.all([
    loadStats(),
    loadActivityData(),
    loadMessageData(),
    loadSystemData(),
  ]);
  initCharts();
});

onUnmounted(() => {
  activityChartInstance?.dispose();
  messageChartInstance?.dispose();
  resourceChartInstance?.dispose();
});
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.user {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.online {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.message {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.group {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.charts-row {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-card__header) {
  padding: 16px 20px;
}
</style>