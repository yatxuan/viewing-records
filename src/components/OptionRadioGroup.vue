<script setup>
import { computed } from "vue";
import { NRadio, NRadioGroup, NSpace } from "naive-ui";

const props = defineProps({
  value: { type: [String, Number, Boolean, null], default: "" },
  options: { type: Array, required: true },
  clearable: { type: Boolean, default: false },
  emptyLabel: { type: String, default: "未填" },
});

const emit = defineEmits(["update:value"]);

const radioOptions = computed(() => {
  const items = props.options.map((option) => (typeof option === "string" ? { label: option, value: option } : option));
  return props.clearable ? [{ label: props.emptyLabel, value: "" }, ...items] : items;
});
</script>

<template>
  <n-radio-group class="option-radio-group" :value="value ?? ''" @update:value="(next) => emit('update:value', next)">
    <n-space size="small">
      <n-radio v-for="option in radioOptions" :key="String(option.value)" :value="option.value">
        {{ option.label }}
      </n-radio>
    </n-space>
  </n-radio-group>
</template>
