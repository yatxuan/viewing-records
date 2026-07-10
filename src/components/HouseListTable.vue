<script setup>
import { NDataTable } from "naive-ui";
import {
  formatHouseType,
  formatCommuteDuration,
  formatPrice,
  formatRoomType,
  formatViewTime,
  hasDisplayOrder,
  viewStatus,
} from "../shared/formatters.js";

defineProps({
  houses: { type: Array, required: true },
});

const emit = defineEmits(["open"]);

const columns = [
  {
    title: "顺序",
    key: "displayOrder",
    width: 80,
    render(row) {
      return hasDisplayOrder(row) ? `#${row.displayOrder}` : "-";
    },
  },
  { title: "地址", key: "address", ellipsis: { tooltip: true } },
  {
    title: "类型",
    key: "type",
    width: 100,
    render(row) {
      return formatHouseType(row.type);
    },
  },
  {
    title: "房型",
    key: "roomType",
    width: 180,
    render(row) {
      return formatRoomType(row) || "-";
    },
  },
  {
    title: "地铁站",
    key: "metroStation",
    width: 130,
    render(row) {
      return row.metroStation || "-";
    },
  },
  {
    title: "通勤",
    key: "commuteDurationMinutes",
    width: 120,
    render(row) {
      return formatCommuteDuration(row) || "-";
    },
  },
  {
    title: "采光",
    key: "lighting",
    width: 100,
    render(row) {
      return row.lighting || "-";
    },
  },
  {
    title: "月租",
    key: "price",
    width: 110,
    render(row) {
      return formatPrice(row.price);
    },
  },
  {
    title: "看房时间",
    key: "viewTime",
    width: 150,
    render(row) {
      return formatViewTime(row.viewTime) || "-";
    },
  },
  {
    title: "状态",
    key: "status",
    width: 90,
    render(row) {
      return viewStatus(row);
    },
  },
];

function rowProps(row) {
  return {
    style: "cursor: pointer",
    onClick: () => emit("open", row),
  };
}
</script>

<template>
  <n-data-table
    :columns="columns"
    :data="houses"
    :row-key="(row) => row.id"
    :row-props="rowProps"
    :bordered="false"
    :single-line="false"
  />
</template>
