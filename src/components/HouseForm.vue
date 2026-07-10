<script setup>
import { computed } from "vue";
import {
  NButton,
  NCard,
  NCheckbox,
  NCheckboxGroup,
  NDatePicker,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NRate,
  NSelect,
  NSpace,
} from "naive-ui";
import {
  applianceOptions,
  balconyOptions,
  balconySizeOptions,
  bedroomOptions,
  completeAppliances,
  contactTypeOptions,
  cookingOptions,
  decorOptions,
  depositOptions,
  directionOptions,
  elevatorOptions,
  houseTypeOptions,
  kitchenOptions,
  kitchenTypeOptions,
  leaseTermOptions,
  lightingOptions,
  livingRoomOptions,
  networkOptions,
  sharedKitchenLocationOptions,
  sourceOptions,
  statusOptions,
  utilityOptions,
} from "../shared/options.js";

const props = defineProps({
  form: { type: Object, required: true },
  saving: { type: Boolean, default: false },
  editId: { type: [String, Number], default: null },
});

defineEmits(["submit"]);

const viewTimeValue = computed({
  get() {
    if (!props.form.viewTime || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(props.form.viewTime)) {
      return null;
    }
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

function toggleFurnitureComplete(value) {
  if (value) props.form.appliances = [...completeAppliances];
}

function toDateTimeLocal(timestamp) {
  const date = new Date(timestamp);
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
</script>

<template>
  <n-form class="form-shell" label-placement="top" @submit.prevent="$emit('submit')">
    <n-card title="排序与状态">
      <div class="form-grid">
        <n-form-item label="类型">
          <n-select v-model:value="form.type" :options="houseTypeOptions" />
        </n-form-item>
        <n-form-item label="状态">
          <n-select v-model:value="form.status" :options="statusOptions" />
        </n-form-item>
      </div>
      <div class="form-grid full">
        <n-form-item label="展示顺序">
          <n-input-number v-model:value="form.displayOrder" clearable placeholder="数字越小越靠前" style="width: 100%" />
        </n-form-item>
      </div>
    </n-card>

    <n-card title="基本信息">
      <div class="form-grid full">
        <n-form-item label="地址" required>
          <n-input v-model:value="form.address" placeholder="小区 / 楼栋 / 房号" />
        </n-form-item>
      </div>
      <div class="form-grid">
        <n-form-item label="靠近地铁站">
          <n-input v-model:value="form.metroStation" placeholder="例如：大运站 / 吉祥站" />
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
        <n-form-item label="房租（元/月）">
          <n-input-number v-model:value="form.price" clearable style="width: 100%" />
        </n-form-item>
        <n-form-item label="房间">
          <n-select v-model:value="form.bedrooms" clearable :options="bedroomOptions" />
        </n-form-item>
        <n-form-item label="客厅">
          <n-select v-model:value="form.livingRooms" clearable :options="livingRoomOptions" />
        </n-form-item>
        <n-form-item label="阳台">
          <n-select v-model:value="form.balconies" clearable :options="balconyOptions" />
        </n-form-item>
        <n-form-item v-if="form.balconies && form.balconies !== '无阳台'" label="阳台大小">
          <n-select v-model:value="form.balconySize" clearable :options="balconySizeOptions" />
        </n-form-item>
        <n-form-item label="厨房">
          <n-select v-model:value="form.hasKitchen" clearable :options="kitchenOptions" />
        </n-form-item>
        <n-form-item v-if="form.hasKitchen === 'yes'" label="厨房类型">
          <n-select v-model:value="form.kitchenType" clearable :options="kitchenTypeOptions" />
        </n-form-item>
        <n-form-item v-if="form.hasKitchen === 'yes' && form.kitchenType === 'shared'" label="公用位置">
          <n-select v-model:value="form.sharedKitchenLocation" clearable :options="sharedKitchenLocationOptions" />
        </n-form-item>
        <n-form-item v-if="form.hasKitchen === 'yes'" label="做饭方式">
          <n-select v-model:value="form.cookingType" clearable :options="cookingOptions" />
        </n-form-item>
        <n-form-item label="楼层">
          <n-input v-model:value="form.floor" />
        </n-form-item>
        <n-form-item label="朝向">
          <n-select v-model:value="form.direction" :options="directionOptions" />
        </n-form-item>
        <n-form-item label="面积（㎡）">
          <n-input-number v-model:value="form.area" clearable :precision="1" style="width: 100%" />
        </n-form-item>
        <n-form-item label="采光">
          <n-select v-model:value="form.lighting" :options="lightingOptions" />
        </n-form-item>
      </div>
      <div class="form-grid full">
        <n-form-item label="采光备注">
          <n-input v-model:value="form.lightingNote" />
        </n-form-item>
        <n-form-item label="家电家具">
          <n-checkbox v-model:checked="form.furnitureComplete" @update:checked="toggleFurnitureComplete">家具齐全</n-checkbox>
          <n-checkbox-group v-model:value="form.appliances">
            <n-space style="margin-top: 10px">
              <n-checkbox v-for="item in applianceOptions" :key="item" :value="item">{{ item }}</n-checkbox>
            </n-space>
          </n-checkbox-group>
        </n-form-item>
      </div>
      <div class="form-grid">
        <n-form-item label="装修">
          <n-select v-model:value="form.decor" clearable :options="decorOptions" />
        </n-form-item>
        <n-form-item label="电梯">
          <n-select v-model:value="form.elevator" :options="elevatorOptions" />
        </n-form-item>
      </div>
    </n-card>

    <n-card title="费用明细">
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
        <n-form-item label="补贴费用（元/月）">
          <n-input-number v-model:value="form.subsidyAmount" clearable :precision="2" style="width: 100%" />
        </n-form-item>
        <n-form-item label="补贴时间（月）">
          <n-input-number v-model:value="form.subsidyMonths" clearable style="width: 100%" />
        </n-form-item>
        <n-form-item label="评分">
          <n-rate v-model:value="form.score" clearable />
        </n-form-item>
      </div>
      <div class="form-grid full">
        <n-form-item label="入住优惠策略">
          <n-input v-model:value="form.discountStrategy" type="textarea" />
        </n-form-item>
      </div>
    </n-card>

    <n-card title="联系与备注">
      <div class="form-grid">
        <n-form-item label="看房时间">
          <n-date-picker v-model:value="viewTimeValue" type="datetime" clearable style="width: 100%" />
        </n-form-item>
        <n-form-item label="来源">
          <n-select v-model:value="form.source" clearable :options="sourceOptions" />
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
    </n-card>

    <n-space justify="end">
      <n-button tag="a" href="./index.html" secondary>取消</n-button>
      <n-button type="primary" :loading="saving" @click="$emit('submit')">
        {{ saving ? "保存中..." : "保存" }}
      </n-button>
    </n-space>
  </n-form>
</template>
