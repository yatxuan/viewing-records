<script setup>
import { NCheckbox, NCheckboxGroup, NFormItem, NSpace } from "naive-ui";
import OptionRadioGroup from "../OptionRadioGroup.vue";
import { applianceOptions, completeAppliances, decorOptions, elevatorOptions } from "../../shared/options.js";

const props = defineProps({
  form: { type: Object, required: true },
});

function toggleFurnitureComplete(value) {
  if (value) props.form.appliances = [...completeAppliances];
}
</script>

<template>
  <div class="form-grid">
    <n-form-item label="装修">
      <OptionRadioGroup v-model:value="form.decor" clearable :options="decorOptions" />
    </n-form-item>
    <n-form-item label="电梯">
      <OptionRadioGroup v-model:value="form.elevator" :options="elevatorOptions" />
    </n-form-item>
  </div>
  <div class="form-grid full">
    <n-form-item label="家电家具">
      <n-checkbox v-model:checked="form.furnitureComplete" @update:checked="toggleFurnitureComplete">家具齐全</n-checkbox>
      <n-checkbox-group v-model:value="form.appliances">
        <n-space style="margin-top: 10px">
          <n-checkbox v-for="item in applianceOptions" :key="item" :value="item">{{ item }}</n-checkbox>
        </n-space>
      </n-checkbox-group>
    </n-form-item>
  </div>
</template>
