<script setup>
import { NFormItem } from "naive-ui";
import OptionRadioGroup from "../OptionRadioGroup.vue";
import {
  balconyOptions,
  balconySizeOptions,
  bedroomOptions,
  cookingOptions,
  kitchenOptions,
  kitchenTypeOptions,
  livingRoomOptions,
  sharedKitchenLocationOptions,
} from "../../shared/options.js";

defineProps({
  form: { type: Object, required: true },
});
</script>

<template>
  <div class="form-grid">
    <n-form-item label="房间">
      <OptionRadioGroup v-model:value="form.bedrooms" clearable :options="bedroomOptions" />
    </n-form-item>
    <n-form-item label="客厅">
      <OptionRadioGroup v-model:value="form.livingRooms" clearable :options="livingRoomOptions" />
    </n-form-item>
    <n-form-item label="阳台">
      <OptionRadioGroup v-model:value="form.balconies" :options="balconyOptions" />
    </n-form-item>
    <n-form-item v-if="form.balconies === 'yes'" label="阳台大小">
      <OptionRadioGroup v-model:value="form.balconySize" clearable :options="balconySizeOptions" />
    </n-form-item>
    <n-form-item label="厨房">
      <OptionRadioGroup v-model:value="form.hasKitchen" :options="kitchenOptions" />
    </n-form-item>
    <n-form-item v-if="form.hasKitchen === 'yes'" label="厨房类型">
      <OptionRadioGroup v-model:value="form.kitchenType" clearable :options="kitchenTypeOptions" />
    </n-form-item>
    <n-form-item v-if="form.hasKitchen === 'yes' && form.kitchenType === 'shared'" label="公用位置">
      <OptionRadioGroup v-model:value="form.sharedKitchenLocation" clearable :options="sharedKitchenLocationOptions" />
    </n-form-item>
    <n-form-item v-if="form.hasKitchen === 'yes'" label="做饭方式">
      <OptionRadioGroup v-model:value="form.cookingType" clearable :options="cookingOptions" />
    </n-form-item>
  </div>
</template>
