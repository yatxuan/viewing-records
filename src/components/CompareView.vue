<script setup>
import { computed } from "vue";
import { NCard, NTable } from "naive-ui";
import { calcTotal, effectiveRent, formatPrice, formatRoomType, shortAddress } from "../shared/formatters.js";

const props = defineProps({
  houses: { type: Array, required: true },
});

const activeHouses = computed(() => props.houses.filter((house) => house?.status !== "rejected" && house.price));
const sortedHouses = computed(() =>
  activeHouses.value.slice().sort((a, b) => Number(a.price || 0) - Number(b.price || 0)),
);
const cheapest = computed(() => sortedHouses.value[0]);

const rows = [
  ["原月租", (house) => formatPrice(house.price)],
  ["到手价", (house) => formatPrice(effectiveRent(house))],
  ["总月支出", (house) => (calcTotal(house).total ? formatPrice(calcTotal(house).total) : "-")],
  ["房型", (house) => formatRoomType(house) || "-"],
  ["楼层", (house) => (house.floor ? `${house.floor}楼` : "-")],
  ["朝向", (house) => house.direction || "-"],
  ["面积", (house) => (house.area ? `${house.area}㎡` : "-")],
  ["采光", (house) => house.lighting || "-"],
  ["水电类型", (house) => house.utility || "-"],
  ["电费", (house) => (house.electricPrice ? `¥${house.electricPrice}/度` : "-")],
  ["水费", (house) => (house.waterPrice ? `¥${house.waterPrice}/吨` : "-")],
  ["物业费", (house) => (house.propFee ? `¥${house.propFee}/㎡` : "-")],
  ["押金", (house) => house.deposit || "-"],
  ["装修", (house) => house.decor || "-"],
  ["电梯", (house) => house.elevator || "-"],
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
        <n-table :bordered="false" :single-line="false">
          <thead>
            <tr>
              <th>项目</th>
              <th v-for="house in sortedHouses" :key="house.id">{{ shortAddress(house) }}</th>
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
      </n-card>
    </template>
  </div>
</template>
