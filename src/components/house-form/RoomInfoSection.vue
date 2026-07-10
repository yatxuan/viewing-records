<script setup>
import { NFormItem, NSelect } from "naive-ui";
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
  </div>
</template>
