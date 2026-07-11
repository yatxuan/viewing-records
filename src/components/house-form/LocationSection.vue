<script setup>
import { NFormItem, NInput, NInputNumber } from "naive-ui";
import OptionRadioGroup from "../OptionRadioGroup.vue";
import { directionOptions, lightingOptions } from "../../shared/options.js";

defineProps({
  form: { type: Object, required: true },
});
</script>

<template>
  <div class="form-grid">
    <n-form-item label="靠近地铁站">
      <n-input v-model:value="form.metroStation" placeholder="例如：大运站 / 吉祥站" />
    </n-form-item>
    <n-form-item label="距离地铁站通行时长">
      <n-input-number
        v-model:value="form.metroStationDurationMinutes"
        clearable
        :min="0"
        :step="1"
        placeholder="单位：分钟"
        style="width: 100%"
      />
    </n-form-item>
    <n-form-item label="上班坐车时长">
      <n-input-number
        v-model:value="form.commuteDurationMinutes"
        clearable
        :min="0"
        :step="5"
        placeholder="单位：分钟"
        style="width: 100%"
      />
    </n-form-item>
    <n-form-item label="楼层">
      <n-input v-model:value="form.floor" />
    </n-form-item>
    <n-form-item label="朝向">
      <OptionRadioGroup v-model:value="form.direction" :options="directionOptions" />
    </n-form-item>
    <n-form-item label="面积（㎡）">
      <n-input-number v-model:value="form.area" clearable :precision="1" style="width: 100%" />
    </n-form-item>
    <n-form-item label="采光">
      <OptionRadioGroup v-model:value="form.lighting" :options="lightingOptions" />
    </n-form-item>
  </div>
  <div class="form-grid full">
    <n-form-item label="采光备注">
      <n-input v-model:value="form.lightingNote" />
    </n-form-item>
  </div>
</template>
