<script setup>
import { computed } from "vue";
import { NButton, NCard, NDatePicker, NFormItem, NInput, NInputNumber, NSelect } from "naive-ui";
import OptionRadioGroup from "../OptionRadioGroup.vue";
import { contactTypeOptions, houseTypeOptions, sourceOptions, statusOptions } from "../../shared/options.js";

const props = defineProps({
  form: { type: Object, required: true },
});

const viewTimeValue = computed({
  get() {
    if (!props.form.viewTime || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(props.form.viewTime)) return null;
    const time = new Date(props.form.viewTime).getTime();
    return Number.isNaN(time) ? null : time;
  },
  set(value) {
    props.form.viewTime = value ? toDateTimeLocal(value) : "";
  },
});

function addContact() {
  props.form.contacts.push({ type: "微信", value: "" });
}

function removeContact(index) {
  props.form.contacts.splice(index, 1);
  if (!props.form.contacts.length) addContact();
}

function toDateTimeLocal(timestamp) {
  const date = new Date(timestamp);
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
</script>

<template>
  <n-card title="核心信息" class="priority-form-card">
    <div class="form-grid full">
      <n-form-item label="标题名称">
        <n-input v-model:value="form.title" placeholder="例如：大运锦秀花园 / 近地铁南向一房" />
      </n-form-item>
      <n-form-item label="地址" required>
        <n-input v-model:value="form.address" placeholder="小区 / 楼栋 / 房号" />
      </n-form-item>
    </div>
    <div class="form-grid">
      <n-form-item label="类型">
        <OptionRadioGroup v-model:value="form.type" :options="houseTypeOptions" />
      </n-form-item>
      <n-form-item label="状态">
        <OptionRadioGroup v-model:value="form.status" :options="statusOptions" />
      </n-form-item>
      <n-form-item label="房租（元/月）">
        <n-input-number v-model:value="form.price" clearable style="width: 100%" />
      </n-form-item>
      <n-form-item label="补贴费用（元/月）">
        <n-input-number v-model:value="form.subsidyAmount" clearable :precision="2" style="width: 100%" />
      </n-form-item>
      <n-form-item label="补贴时间（月）">
        <n-input-number v-model:value="form.subsidyMonths" clearable style="width: 100%" />
      </n-form-item>
      <n-form-item label="看房时间">
        <n-date-picker v-model:value="viewTimeValue" type="datetime" clearable style="width: 100%" />
      </n-form-item>
      <n-form-item label="来源">
        <OptionRadioGroup v-model:value="form.source" clearable :options="sourceOptions" />
      </n-form-item>
      <n-form-item label="展示顺序">
        <n-input-number v-model:value="form.displayOrder" clearable placeholder="数字越小越靠前" style="width: 100%" />
      </n-form-item>
    </div>
    <n-form-item label="联系方式（可多个）">
      <div style="width: 100%">
        <div v-for="(contact, index) in form.contacts" :key="index" class="contact-row">
          <n-select v-model:value="contact.type" :options="contactTypeOptions" />
          <n-input v-model:value="contact.value" placeholder="账号、手机号、主页链接等" />
          <n-button type="error" secondary @click="removeContact(index)">删除</n-button>
        </div>
        <n-button secondary @click="addContact">添加联系方式</n-button>
      </div>
    </n-form-item>
  </n-card>
</template>
