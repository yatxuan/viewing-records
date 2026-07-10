<script setup>
import { NButton, NCollapse, NCollapseItem, NForm, NSpace } from "naive-ui";
import BasicInfoSection from "./house-form/BasicInfoSection.vue";
import CostSection from "./house-form/CostSection.vue";
import FacilitySection from "./house-form/FacilitySection.vue";
import LocationSection from "./house-form/LocationSection.vue";
import NoteSection from "./house-form/NoteSection.vue";
import RoomInfoSection from "./house-form/RoomInfoSection.vue";

defineProps({
  form: { type: Object, required: true },
  saving: { type: Boolean, default: false },
  editId: { type: [String, Number], default: null },
});

defineEmits(["submit"]);
</script>

<template>
  <n-form class="form-shell" label-placement="top" @submit.prevent="$emit('submit')">
    <BasicInfoSection :form="form" />

    <n-collapse class="detail-form-collapse" arrow-placement="right">
      <n-collapse-item title="房型与空间" name="room">
        <RoomInfoSection :form="form" />
      </n-collapse-item>
      <n-collapse-item title="位置与通勤" name="location">
        <LocationSection :form="form" />
      </n-collapse-item>
      <n-collapse-item title="费用明细" name="cost">
        <CostSection :form="form" />
      </n-collapse-item>
      <n-collapse-item title="配套与家电" name="facility">
        <FacilitySection :form="form" />
      </n-collapse-item>
      <n-collapse-item title="评价与备注" name="notes">
        <NoteSection :form="form" />
      </n-collapse-item>
    </n-collapse>

    <n-space justify="end" class="form-actions-sticky">
      <n-button tag="a" href="./index.html" secondary>取消</n-button>
      <n-button type="primary" :loading="saving" @click="$emit('submit')">
        {{ saving ? "保存中..." : "保存" }}
      </n-button>
    </n-space>
  </n-form>
</template>
