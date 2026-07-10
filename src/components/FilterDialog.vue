<script setup>
import { computed } from "vue";
import { NButton, NFormItem, NModal, NSelect, NSpace } from "naive-ui";

const props = defineProps({
  show: { type: Boolean, required: true },
  filters: { type: Object, required: true },
  roomTypeOptions: { type: Array, required: true },
  lightingOptions: { type: Array, required: true },
  shown: { type: Number, required: true },
  total: { type: Number, required: true },
});

const emit = defineEmits(["update:show", "reset"]);

const showModel = computed({
  get: () => props.show,
  set: (value) => emit("update:show", value),
});

const typeOptions = [
  { label: "全部类型", value: "all" },
  { label: "个人转租", value: "personal" },
  { label: "中介", value: "agent" },
];

const sortOptions = [
  { label: "展示顺序", value: "displayOrder" },
  { label: "看房时间从近到远", value: "viewTimeAsc" },
  { label: "看房时间从远到近", value: "viewTimeDesc" },
  { label: "房价从低到高", value: "priceAsc" },
  { label: "房价从高到低", value: "priceDesc" },
];
</script>

<template>
  <n-modal v-model:show="showModel" preset="card" title="筛选与排序" style="width: min(640px, calc(100vw - 32px))">
    <div class="form-grid">
      <n-form-item label="类型">
        <n-select v-model:value="filters.type" :options="typeOptions" />
      </n-form-item>
      <n-form-item label="房型">
        <n-select v-model:value="filters.roomType" :options="roomTypeOptions" />
      </n-form-item>
      <n-form-item label="采光">
        <n-select v-model:value="filters.lighting" :options="lightingOptions" />
      </n-form-item>
      <n-form-item label="排序">
        <n-select v-model:value="filters.sortBy" :options="sortOptions" />
      </n-form-item>
    </div>
    <template #footer>
      <n-space justify="space-between" align="center">
        <span class="page-subtitle">当前显示 {{ shown }} / {{ total }} 套</span>
        <n-space>
          <n-button secondary @click="$emit('reset')">重置筛选</n-button>
          <n-button type="primary" @click="showModel = false">完成</n-button>
        </n-space>
      </n-space>
    </template>
  </n-modal>
</template>
