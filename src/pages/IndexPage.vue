<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import {
  NAlert,
  NButton,
  NIcon,
  NMessageProvider,
  NSpace,
} from "naive-ui";
import { Add, FunnelOutline, RefreshOutline, SettingsOutline } from "@vicons/ionicons5";
import CompareView from "../components/CompareView.vue";
import FilterDialog from "../components/FilterDialog.vue";
import HouseCard from "../components/HouseCard.vue";
import HouseListTable from "../components/HouseListTable.vue";
import SettingsDialog from "../components/SettingsDialog.vue";
import {
  getRemoteConfig,
  loadAndSaveHouses,
  loadHouses,
  normalizeDataConfig,
  saveStoredConfig,
  testDataConnection,
} from "../shared/data-service.js";
import { formatRoomType, sortableDisplayOrder, sortablePrice, sortableTime } from "../shared/formatters.js";

const houses = ref([]);
const loading = ref(false);
const error = ref("");
const status = ref("");
const tab = ref("list");
const viewMode = ref("card");
const showFilter = ref(false);
const showSettings = ref(false);
const config = reactive(getRemoteConfig());
const filters = reactive({
  type: "all",
  roomType: "all",
  lighting: "all",
  sortBy: "displayOrder",
});

const today = new Date().toLocaleDateString("zh-CN");
const tabs = [
  { name: "list", tab: "房源列表" },
  { name: "compare", tab: "对比分析" },
];
const viewOptions = [
  { label: "卡片", value: "card" },
  { label: "列表", value: "table" },
];

const roomTypeOptions = computed(() => [
  { label: "全部房型", value: "all" },
  ...uniqueDisplayValues(formatRoomType).map((value) => ({ label: value, value })),
]);
const lightingOptions = computed(() => [
  { label: "全部采光", value: "all" },
  ...uniqueValues("lighting").map((value) => ({ label: value, value })),
]);
const displayHouses = computed(() => {
  const list = houses.value.filter((house) => {
    if (!house) return false;
    if (filters.type !== "all" && house.type !== filters.type) return false;
    if (filters.roomType !== "all" && formatRoomType(house) !== filters.roomType) return false;
    if (filters.lighting !== "all" && (house.lighting || "") !== filters.lighting) return false;
    return true;
  });

  return list.slice().sort((a, b) => {
    if (filters.sortBy === "displayOrder") return sortableDisplayOrder(a) - sortableDisplayOrder(b);
    if (filters.sortBy === "priceAsc") return sortablePrice(a, 1) - sortablePrice(b, 1);
    if (filters.sortBy === "priceDesc") return sortablePrice(b, -1) - sortablePrice(a, -1);
    if (filters.sortBy === "viewTimeDesc") return sortableTime(b.viewTime) - sortableTime(a.viewTime);
    return sortableTime(a.viewTime) - sortableTime(b.viewTime);
  });
});

const filterSummary = computed(() => {
  const parts = [];
  if (filters.type !== "all") parts.push(filters.type === "personal" ? "个人转租" : "中介");
  if (filters.roomType !== "all") parts.push(filters.roomType);
  if (filters.lighting !== "all") parts.push(`${filters.lighting}采光`);
  const sortMap = {
    displayOrder: "展示顺序",
    viewTimeAsc: "看房时间近到远",
    viewTimeDesc: "看房时间远到近",
    priceAsc: "房价低到高",
    priceDesc: "房价高到低",
  };
  parts.push(sortMap[filters.sortBy] || "默认排序");
  return parts.join(" / ");
});

async function reloadData() {
  loading.value = true;
  error.value = "";
  try {
    houses.value = await loadHouses();
    status.value = `已加载 ${houses.value.length} 套房源`;
  } catch (err) {
    error.value = `加载失败: ${err.message}`;
  } finally {
    loading.value = false;
  }
}

async function deleteHouse(house) {
  if (!confirm(`确定删除「${house.address || "这套房源"}」吗？`)) return;
  error.value = "";
  status.value = "同步中...";
  try {
    houses.value = await loadAndSaveHouses(houses.value.filter((item) => item.id !== house.id));
    status.value = "已删除并重新拉取最新数据";
  } catch (err) {
    error.value = `删除失败: ${err.message}`;
  }
}

function openDetail(house) {
  window.location.href = `./detail.html?id=${encodeURIComponent(house.id)}`;
}

function saveSettings(nextConfig) {
  const normalizedConfig = normalizeDataConfig(nextConfig);
  Object.assign(config, normalizedConfig);
  saveStoredConfig(normalizedConfig);
  reloadData();
}

async function copyCurrentJson() {
  const json = JSON.stringify(houses.value, null, 2);
  try {
    await copyText(json);
    status.value = `已复制 ${houses.value.length} 条 JSON 数据`;
  } catch (err) {
    error.value = `复制失败: ${err.message}`;
  }
}

async function testConfig(nextConfig) {
  error.value = "";
  status.value = "正在测试连接...";
  try {
    const result = await testDataConnection(nextConfig);
    const sourceMap = { github: "GitHub", localStorage: "浏览器本地数据", localFile: "本地文件" };
    status.value = `连接成功，读取到 ${result.count} 条数据（${sourceMap[result.source] || result.source}）`;
  } catch (err) {
    error.value = `连接失败: ${err.message}`;
    status.value = "";
  }
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function resetFilters() {
  filters.type = "all";
  filters.roomType = "all";
  filters.lighting = "all";
  filters.sortBy = "displayOrder";
}

function uniqueValues(field) {
  return [...new Set(houses.value.map((house) => (house?.[field] || "").trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "zh-CN"),
  );
}

function uniqueDisplayValues(formatter) {
  return [...new Set(houses.value.map((house) => formatter(house).trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "zh-CN"),
  );
}

onMounted(reloadData);
</script>

<template>
  <n-message-provider>
    <main class="app-page">
      <header class="page-hero">
        <div>
          <h1 class="page-title">🏠 我的看房记录</h1>
          <p class="page-subtitle">{{ houses.length }} 套房源 · {{ today }}</p>
        </div>
        <n-space>
          <n-button tag="a" href="./edit.html" type="primary">
            <template #icon>
              <n-icon><Add /></n-icon>
            </template>
            新增房源
          </n-button>
          <n-button secondary @click="showSettings = true">
            <template #icon>
              <n-icon><SettingsOutline /></n-icon>
            </template>
            设置
          </n-button>
        </n-space>
      </header>

      <div class="tabs">
        <button class="tab" :class="{ active: tab === 'list' }" type="button" @click="tab = 'list'">
          房源列表
        </button>
        <button class="tab" type="button" @click="showFilter = true">
          筛选
        </button>
        <button class="tab" :class="{ active: tab === 'compare' }" type="button" @click="tab = 'compare'">
          对比分析
        </button>
      </div>

      <div class="toolbar">
        <div class="toolbar-group">
          <n-button secondary @click="reloadData">
            <template #icon>
              <n-icon><RefreshOutline /></n-icon>
            </template>
            刷新数据
          </n-button>
        </div>
        <div v-if="tab === 'list'" class="view-switch">
          <button
            v-for="item in viewOptions"
            :key="item.value"
            class="view-btn"
            :class="{ active: viewMode === item.value }"
            type="button"
            @click="viewMode = item.value"
          >
              {{ item.label }}
          </button>
        </div>
      </div>

      <div class="status-stack">
        <n-alert v-if="loading" type="info" title="加载中">正在读取房源数据...</n-alert>
        <n-alert v-if="error" type="error" title="出错了">{{ error }}</n-alert>
        <n-alert v-if="status && !loading && !error" type="success" :title="status">
          当前显示 {{ displayHouses.length }} / {{ houses.length }} 套 · {{ filterSummary }}
        </n-alert>
      </div>

      <section v-if="tab === 'list'">
        <div v-if="!loading && !error && !houses.length" class="empty-state">
          <strong>还没有房源记录</strong>
          <p>添加第一套看房信息吧。</p>
        </div>
        <div v-else-if="!loading && !error && !displayHouses.length" class="empty-state">
          <strong>没有符合条件的房源</strong>
          <p>换个类型、房型或采光条件试试。</p>
        </div>
        <div v-else-if="viewMode === 'card'" class="card-grid">
          <HouseCard
            v-for="house in displayHouses"
            :key="house.id"
            :house="house"
            @open="openDetail"
            @delete="deleteHouse"
          />
        </div>
        <HouseListTable v-else :houses="displayHouses" @open="openDetail" />
      </section>

      <CompareView v-else :houses="houses" />

      <FilterDialog
        v-model:show="showFilter"
        :filters="filters"
        :room-type-options="roomTypeOptions"
        :lighting-options="lightingOptions"
        :shown="displayHouses.length"
        :total="houses.length"
        @reset="resetFilters"
      />
      <SettingsDialog
        v-model:show="showSettings"
        :config="config"
        @save="saveSettings"
        @copy-json="copyCurrentJson"
        @test-config="testConfig"
      />
    </main>
  </n-message-provider>
</template>
