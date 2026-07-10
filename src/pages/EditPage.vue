<script setup>
import { onMounted, reactive, ref } from "vue";
import { NAlert, NButton, NIcon } from "naive-ui";
import { HomeOutline } from "@vicons/ionicons5";
import HouseForm from "../components/HouseForm.vue";
import { loadAndSaveHouses, loadHouses, nextHouseId } from "../shared/data-service.js";
import { createHouseDraft, normalizeHouse } from "../shared/house-normalizer.js";

const id = new URLSearchParams(location.search).get("id");
const editId = ref(id ? Number(id) || id : null);
const houses = ref([]);
const loading = ref(true);
const saving = ref(false);
const error = ref("");
const status = ref("");
const form = reactive(createHouseDraft());

onMounted(async () => {
  try {
    houses.value = await loadHouses();
    if (!editId.value) return;
    const house = houses.value.find((item) => String(item.id) === String(editId.value));
    if (!house) {
      error.value = "没有找到要编辑的房源";
      return;
    }
    Object.assign(form, createHouseDraft(house));
  } catch (err) {
    error.value = `加载失败: ${err.message}`;
  } finally {
    loading.value = false;
  }
});

async function save() {
  if (!form.address) {
    error.value = "请先填写地址";
    return;
  }
  saving.value = true;
  error.value = "";
  status.value = "保存中...";
  try {
    const house = { ...normalizeHouse(form), id: editId.value || nextHouseId(houses.value) };
    const next = houses.value.slice();
    const index = next.findIndex((item) => String(item.id) === String(house.id));
    if (index >= 0) next[index] = house;
    else next.push(house);
    houses.value = await loadAndSaveHouses(next);
    status.value = "保存成功，正在返回列表...";
    setTimeout(() => {
      window.location.href = "./index.html";
    }, 500);
  } catch (err) {
    error.value = `保存失败: ${err.message}`;
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <main class="app-page narrow">
    <div class="toolbar">
      <n-button tag="a" href="./index.html" secondary>
        <template #icon>
          <n-icon><HomeOutline /></n-icon>
        </template>
        返回列表
      </n-button>
    </div>
    <header class="page-hero">
      <div>
        <h1 class="page-title">{{ editId ? "编辑房源" : "新增房源" }}</h1>
        <p class="page-subtitle">保存后会同步到当前配置的数据源，并重新拉取最新数据。</p>
      </div>
    </header>
    <div class="status-stack">
      <n-alert v-if="loading" type="info" title="加载中">正在读取数据...</n-alert>
      <n-alert v-if="error" type="error" title="出错了">{{ error }}</n-alert>
      <n-alert v-if="status" type="success" :title="status" />
    </div>
    <HouseForm v-if="!loading" :form="form" :saving="saving" :edit-id="editId" @submit="save" />
  </main>
</template>
