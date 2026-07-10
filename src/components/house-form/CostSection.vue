<script setup>
import { NFormItem, NInput, NInputNumber, NSelect } from "naive-ui";
import { depositOptions, leaseTermOptions, networkOptions, utilityOptions } from "../../shared/options.js";

defineProps({
  form: { type: Object, required: true },
});
</script>

<template>
  <div class="form-grid">
    <n-form-item label="水电网情况">
      <n-input v-model:value="form.waterElectric" />
    </n-form-item>
    <n-form-item label="水电类型">
      <n-select v-model:value="form.utility" :options="utilityOptions" />
    </n-form-item>
    <n-form-item label="网络">
      <n-select v-model:value="form.networkMode" :options="networkOptions" />
    </n-form-item>
    <n-form-item v-if="form.networkMode === '房东提供'" label="网络费用（元/月）">
      <n-input-number v-model:value="form.networkFee" clearable style="width: 100%" />
    </n-form-item>
    <n-form-item label="电费（元/度）">
      <n-input-number v-model:value="form.electricPrice" clearable :precision="2" style="width: 100%" />
    </n-form-item>
    <n-form-item label="每月用电量（度）">
      <n-input-number v-model:value="form.elecUsage" clearable style="width: 100%" />
    </n-form-item>
    <n-form-item label="水费（元/吨）">
      <n-input-number v-model:value="form.waterPrice" clearable :precision="2" style="width: 100%" />
    </n-form-item>
    <n-form-item label="每月用水量（吨）">
      <n-input-number v-model:value="form.waterUsage" clearable :precision="1" style="width: 100%" />
    </n-form-item>
    <n-form-item label="物业费（元/㎡/月）">
      <n-input-number v-model:value="form.propFee" clearable :precision="1" style="width: 100%" />
    </n-form-item>
    <n-form-item label="服务费（元/月）">
      <n-input-number v-model:value="form.serviceFee" clearable style="width: 100%" />
    </n-form-item>
    <n-form-item label="押金方式">
      <n-select v-model:value="form.deposit" clearable :options="depositOptions" />
    </n-form-item>
    <n-form-item label="中介费">
      <n-input v-model:value="form.agentFee" />
    </n-form-item>
    <n-form-item label="租期">
      <n-select v-model:value="form.leaseTerm" clearable :options="leaseTermOptions" />
    </n-form-item>
  </div>
  <div class="form-grid full">
    <n-form-item label="入住优惠策略">
      <n-input v-model:value="form.discountStrategy" type="textarea" />
    </n-form-item>
  </div>
</template>
