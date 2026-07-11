<script setup>
import { NButton, NCard, NIcon, NSpace, NTag } from "naive-ui";
import { CreateOutline, TrashOutline } from "@vicons/ionicons5";
import {
  calcTotal,
  displayTitle,
  effectiveRent,
  formatCommuteDuration,
  formatContacts,
  formatFurniture,
  formatHouseType,
  formatMetroStationDuration,
  formatPrice,
  formatRoomType,
  formatScore,
  formatSubsidy,
  formatViewTime,
  hasDisplayOrder,
  viewStatus,
} from "../shared/formatters.js";

defineProps({
  house: { type: Object, required: true },
});

defineEmits(["open", "delete"]);
</script>

<template>
  <n-card class="house-card" hoverable @click="$emit('open', house)">
    <template #header>
      <div class="house-card-title">{{ displayTitle(house) }}</div>
    </template>
    <template #header-extra>
      <n-space size="small">
        <n-tag :type="house.type === 'agent' ? 'warning' : 'success'" size="small">
          {{ formatHouseType(house.type) }}
        </n-tag>
        <n-tag v-if="hasDisplayOrder(house)" size="small">#{{ house.displayOrder }}</n-tag>
        <n-tag size="small">{{ viewStatus(house) }}</n-tag>
      </n-space>
    </template>

    <div class="meta-grid">
      <div v-if="house.address" class="meta-item meta-item-wide">
        <span class="meta-label">地址</span>
        <span class="meta-value">{{ house.address }}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">月租</span>
        <span class="price-value">{{ formatPrice(effectiveRent(house)) }}</span>
        <span v-if="formatSubsidy(house)" class="meta-label">
          原价 {{ formatPrice(house.price) }} · {{ formatSubsidy(house) }}
        </span>
      </div>
      <div class="meta-item">
        <span class="meta-label">总支出</span>
        <span class="meta-value">
          {{ calcTotal(house).total ? formatPrice(calcTotal(house).total) : "待估" }}
        </span>
      </div>
      <div v-if="formatRoomType(house)" class="meta-item">
        <span class="meta-label">房型</span>
        <span class="meta-value">{{ formatRoomType(house) }}</span>
      </div>
      <div v-if="house.metroStation" class="meta-item">
        <span class="meta-label">地铁站</span>
        <span class="meta-value">{{ house.metroStation }}</span>
      </div>
      <div v-if="formatMetroStationDuration(house)" class="meta-item">
        <span class="meta-label">距地铁站</span>
        <span class="meta-value">{{ formatMetroStationDuration(house) }}</span>
      </div>
      <div v-if="formatCommuteDuration(house)" class="meta-item">
        <span class="meta-label">通勤时长</span>
        <span class="meta-value">{{ formatCommuteDuration(house) }}</span>
      </div>
      <div v-if="house.lighting" class="meta-item">
        <span class="meta-label">采光</span>
        <span class="meta-value">{{ house.lighting }}</span>
      </div>
      <div v-if="formatFurniture(house)" class="meta-item">
        <span class="meta-label">家电家具</span>
        <span class="meta-value">{{ formatFurniture(house) }}</span>
      </div>
      <div v-if="house.viewTime" class="meta-item">
        <span class="meta-label">看房时间</span>
        <span class="meta-value">{{ formatViewTime(house.viewTime) }}</span>
      </div>
      <div v-if="formatScore(house.score)" class="meta-item">
        <span class="meta-label">评分</span>
        <span class="meta-value">{{ formatScore(house.score) }}</span>
      </div>
      <div v-if="formatContacts(house)" class="meta-item">
        <span class="meta-label">联系</span>
        <span class="meta-value">{{ formatContacts(house) }}</span>
      </div>
    </div>

    <div v-if="house.discountStrategy || formatSubsidy(house) || house.pros || house.cons || house.notes" class="note-box">
      <div v-if="house.discountStrategy">入住优惠：{{ house.discountStrategy }}</div>
      <div v-if="formatSubsidy(house)">房租补贴：{{ formatSubsidy(house) }}</div>
      <div v-if="house.pros">优点：{{ house.pros }}</div>
      <div v-if="house.cons">缺点：{{ house.cons }}</div>
      <div v-if="house.notes">备注：{{ house.notes }}</div>
    </div>

    <template #footer>
      <n-space justify="space-between" align="center" @click.stop>
        <span class="page-subtitle">{{ house.source || "来源未填" }}</span>
        <n-space size="small">
          <n-button size="small" secondary tag="a" :href="'./edit.html?id=' + encodeURIComponent(house.id)">
            <template #icon>
              <n-icon><CreateOutline /></n-icon>
            </template>
            编辑
          </n-button>
          <n-button size="small" type="error" secondary @click="$emit('delete', house)">
            <template #icon>
              <n-icon><TrashOutline /></n-icon>
            </template>
            删除
          </n-button>
        </n-space>
      </n-space>
    </template>
  </n-card>
</template>
