<script setup>
import { computed } from "vue";
import { NCard } from "naive-ui";
import {
  calcTotal,
  formatContacts,
  formatFurniture,
  formatKitchen,
  formatNetwork,
  formatPrice,
  formatRoomType,
  formatScore,
  formatSubsidy,
  formatViewTime,
  hasDisplayOrder,
  viewStatus,
} from "../shared/formatters.js";

const props = defineProps({
  house: { type: Object, required: true },
});

const sections = computed(() => [
  [
    "基本信息",
    [
      ["看房顺序", hasDisplayOrder(props.house) ? `#${props.house.displayOrder}` : ""],
      ["看房状态", viewStatus(props.house)],
      ["楼层", props.house.floor],
      ["朝向", props.house.direction],
      ["面积", props.house.area ? `${props.house.area}㎡` : ""],
      ["房型", formatRoomType(props.house)],
      ["采光", props.house.lighting],
      ["采光备注", props.house.lightingNote],
      ["厨房", formatKitchen(props.house)],
      ["做饭方式", props.house.cookingType],
      ["家电家具", formatFurniture(props.house)],
      ["装修", props.house.decor],
      ["电梯", props.house.elevator],
    ],
  ],
  [
    "费用明细",
    [
      ["月租金", props.house.price ? formatPrice(props.house.price) : ""],
      ["房租补贴", formatSubsidy(props.house)],
      ["到手价", props.house.price ? formatPrice(Math.max(0, Number(props.house.price) - (Number(props.house.subsidyAmount) || 0))) : ""],
      ["月总支出", calcTotal(props.house).total ? formatPrice(calcTotal(props.house).total) : ""],
      ["水电类型", props.house.utility],
      ["网络", formatNetwork(props.house)],
      ["电费", props.house.electricPrice ? `¥${props.house.electricPrice}/度` : ""],
      ["水费", props.house.waterPrice ? `¥${props.house.waterPrice}/吨` : ""],
      ["物业费", props.house.propFee ? `¥${props.house.propFee}/㎡` : ""],
      ["服务费", props.house.serviceFee ? `¥${props.house.serviceFee}/月` : ""],
      ["押金方式", props.house.deposit],
      ["中介费", props.house.agentFee],
      ["租期", props.house.leaseTerm],
    ],
  ],
  [
    "联系信息",
    [
      ["联系方式", formatContacts(props.house)],
      ["看房时间", formatViewTime(props.house.viewTime)],
      ["来源", props.house.source],
      ["备注", props.house.notes],
    ],
  ],
  [
    "评价记录",
    [
      ["综合评分", formatScore(props.house.score)],
      ["满意度", props.house.satisfaction ? "★".repeat(props.house.satisfaction) : ""],
      ["优点", props.house.pros],
      ["缺点", props.house.cons],
    ],
  ],
]);
</script>

<template>
  <div class="section-list">
    <n-card v-if="house.discountStrategy">
      <h2 class="section-title">入住优惠策略</h2>
      <div class="note-box" style="margin-top: 0">{{ house.discountStrategy }}</div>
    </n-card>
    <n-card v-for="[title, rows] in sections" :key="title" v-show="rows.some((row) => row[1])">
      <h2 class="section-title">{{ title }}</h2>
      <div class="detail-rows">
        <template v-for="[label, value] in rows" :key="label">
          <div v-if="value" class="detail-row">
            <span class="detail-label">{{ label }}</span>
            <span class="detail-value">{{ value }}</span>
          </div>
        </template>
      </div>
    </n-card>
  </div>
</template>
