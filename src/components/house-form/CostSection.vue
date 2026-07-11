<script setup>
import { NFormItem, NInput, NInputNumber } from "naive-ui";
import OptionRadioGroup from "../OptionRadioGroup.vue";
import { depositOptions, leaseTermOptions, networkOptions, utilityOptions } from "../../shared/options.js";

defineProps({
  form: { type: Object, required: true },
});
</script>

<template>
  <div class="form-grid">
    <n-form-item label="水电类型">
      <OptionRadioGroup v-model:value="form.utility" :options="utilityOptions" />
    </n-form-item>
    <n-form-item label="网络">
      <OptionRadioGroup v-model:value="form.networkMode" :options="networkOptions" />
    </n-form-item>
    <n-form-item v-if="form.networkMode === '房东提供'" label="网络费用（元/月）">
      <n-input-number v-model:value="form.networkFee" clearable style="width: 100%" />
    </n-form-item>
    <n-form-item label="电费（元/度）">
      <n-input-number v-model:value="form.electricPrice" clearable :precision="2" style="width: 100%" />
    </n-form-item>
    <n-form-item label="水费（元/吨）">
      <n-input-number v-model:value="form.waterPrice" clearable :precision="2" style="width: 100%" />
    </n-form-item>
    <n-form-item label="物业费（元/㎡/月）">
      <n-input-number v-model:value="form.propFee" clearable :precision="1" style="width: 100%" />
    </n-form-item>
    <n-form-item label="押金方式">
      <OptionRadioGroup v-model:value="form.deposit" clearable :options="depositOptions" />
    </n-form-item>
    <n-form-item label="中介费">
      <n-input v-model:value="form.agentFee" />
    </n-form-item>
    <n-form-item label="租期">
      <OptionRadioGroup v-model:value="form.leaseTerm" clearable :options="leaseTermOptions" />
    </n-form-item>
  </div>
  <div class="form-grid full">
    <n-form-item label="入住优惠策略">
      <n-input v-model:value="form.discountStrategy" type="textarea" />
    </n-form-item>
  </div>
</template>
