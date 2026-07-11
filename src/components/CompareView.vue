<script setup>
import { computed } from "vue";
import { NCard, NTable } from "naive-ui";
import {
  effectiveRent,
  formatCommuteDuration,
  formatNetwork,
  formatPrice,
  displayTitle,
} from "../shared/formatters.js";

const props = defineProps({
  houses: { type: Array, required: true },
});

const activeHouses = computed(() => props.houses.filter((house) => house?.status !== "rejected" && house.price));
const sortedHouses = computed(() =>
  activeHouses.value.slice().sort((a, b) => Number(a.price || 0) - Number(b.price || 0)),
);
const cheapest = computed(() => sortedHouses.value[0]);

const rows = [
  ["房租", (house) => formatPrice(effectiveRent(house))],
  ["水电类型", (house) => house.utility || "-"],
  ["网费", (house) => formatNetwork(house) || "-"],
  ["管理费", (house) => (house.propFee ? `¥${house.propFee}/㎡/月` : "-")],
  ["通勤", (house) => formatCommuteDuration(house) || "-"],
  ["采光", (house) => house.lighting || "-"],
  ["楼层", (house) => (house.floor ? `${house.floor}楼` : "-")],
  ["是否电梯", (house) => house.elevator || "-"],
];
</script>

<template>
  <div>
    <div v-if="activeHouses.length < 2" class="empty-state">
      <strong>需要更多数据</strong>
      <p>至少添加 2 套有价格的房源才能对比。</p>
    </div>
    <template v-else>
      <n-card class="detail-hero">
        <span class="meta-label">最低月租</span>
        <strong class="price-value">{{ formatPrice(cheapest.price) }}/月</strong>
      </n-card>
      <n-card>
        <div class="compare-table-scroll">
          <n-table class="compare-table" :bordered="false" :single-line="false">
            <thead>
              <tr>
                <th>项目</th>
                <th v-for="house in sortedHouses" :key="house.id">{{ displayTitle(house) }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="[label, getter] in rows" :key="label">
                <td>
                  <strong>{{ label }}</strong>
                </td>
                <td v-for="house in sortedHouses" :key="house.id">{{ getter(house) }}</td>
              </tr>
            </tbody>
          </n-table>
        </div>
      </n-card>
    </template>
  </div>
</template>
