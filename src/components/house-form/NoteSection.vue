<script setup>
import { NFormItem, NInput, NRate } from "naive-ui";

defineProps({
  form: { type: Object, required: true },
});
</script>

<template>
  <div class="form-grid">
    <n-form-item label="评分">
      <n-rate v-model:value="form.score" clearable />
    </n-form-item>
  </div>
  <div class="form-grid full">
    <n-form-item label="优点">
      <n-input v-model:value="form.pros" type="textarea" />
    </n-form-item>
    <n-form-item label="缺点 / 隐忧">
      <n-input v-model:value="form.cons" type="textarea" />
    </n-form-item>
    <n-form-item label="备注">
      <n-input v-model:value="form.notes" type="textarea" />
    </n-form-item>
  </div>
</template>
