<script setup>
import { computed, onMounted, ref } from "vue";
import { NAlert, NButton, NCard, NIcon, NSpace, NTag } from "naive-ui";
import { HomeOutline } from "@vicons/ionicons5";
import DetailSections from "../components/DetailSections.vue";
import { loadHouses } from "../shared/data-service.js";
import {
  calcTotal,
  effectiveRent,
  formatHouseType,
  formatPrice,
  formatRoomType,
  formatSubsidy,
  formatViewTime,
  hasDisplayOrder,
  viewStatus,
} from "../shared/formatters.js";

const houses = ref([]);
const loading = ref(true);
const error = ref("");
const id = new URLSearchParams(location.search).get("id");
const house = computed(() => houses.value.find((item) => String(item.id) === String(id)));
const editUrl = computed(() => `./edit.html?id=${encodeURIComponent(id || "")}`);

onMounted(async () => {
  try {
    houses.value = await loadHouses();
  } catch (err) {
    error.value = `加载失败: ${err.message}`;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <main class="app-page narrow">
    <div class="toolbar">
      <n-button tag="a" href="./index.html" secondary>
        <template #icon>
          <n-icon><HomeOutline /></n-icon>
        </template>
        返回列表
      </n-button>
      <n-button tag="a" href="./edit.html" type="primary">新增房源</n-button>
    </div>

    <div v-if="loading" class="empty-state">
      <strong>加载中</strong>
      <p>正在读取房源数据...</p>
    </div>
    <n-alert v-else-if="error" type="error" title="加载失败">{{ error }}</n-alert>
    <div v-else-if="!house" class="empty-state">
      <strong>没有找到房源</strong>
      <p>请从列表页重新进入详情。</p>
    </div>

    <template v-else>
      <n-card class="detail-hero">
        <n-space align="center" justify="space-between">
          <n-space>
            <n-tag :type="house.type === 'agent' ? 'warning' : 'success'">{{ formatHouseType(house.type) }}</n-tag>
            <n-tag v-if="hasDisplayOrder(house)">看房顺序 #{{ house.displayOrder }}</n-tag>
            <n-tag>{{ viewStatus(house) }}</n-tag>
            <n-tag>{{ house.source || "来源未填" }}</n-tag>
          </n-space>
        </n-space>
        <h1 class="detail-title">{{ house.address || "地址未填写" }}</h1>
        <div class="summary-grid" style="margin-top: 18px">
          <div class="summary-tile">
            <span>到手月租</span>
            <strong class="price-value">{{ formatPrice(effectiveRent(house)) }}</strong>
          </div>
          <div class="summary-tile">
            <span>原月租</span>
            <strong>{{ formatPrice(house.price) }}</strong>
          </div>
          <div class="summary-tile">
            <span>房租补贴</span>
            <strong>{{ formatSubsidy(house) || "无" }}</strong>
          </div>
          <div class="summary-tile">
            <span>月总支出</span>
            <strong>{{ calcTotal(house).total ? formatPrice(calcTotal(house).total) : "待估" }}</strong>
          </div>
          <div class="summary-tile">
            <span>房型</span>
            <strong>{{ formatRoomType(house) || "未填写" }}</strong>
          </div>
          <div class="summary-tile">
            <span>看房时间</span>
            <strong>{{ formatViewTime(house.viewTime) || "待定" }}</strong>
          </div>
        </div>
      </n-card>

      <DetailSections :house="house" />

      <n-space justify="end" style="margin-top: 16px">
        <n-button tag="a" :href="editUrl" type="primary">编辑房源</n-button>
        <n-button tag="a" href="./index.html" secondary>返回列表</n-button>
      </n-space>
    </template>
  </main>
</template>
