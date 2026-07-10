<script setup>
import { onMounted, reactive, ref } from "vue";
import { NAlert, NButton, NIcon, NModal, NSpace } from "naive-ui";
import { HomeOutline } from "@vicons/ionicons5";
import HouseForm from "../components/HouseForm.vue";
import {
  getRemoteConfig,
  loadAndSaveHouses,
  loadHouses,
  nextHouseId,
  saveHousesToLocal,
  saveStoredConfig,
} from "../shared/data-service.js";
import { createHouseDraft, normalizeHouse } from "../shared/house-normalizer.js";

const id = new URLSearchParams(location.search).get("id");
const editId = ref(id ? Number(id) || id : null);
const houses = ref([]);
const loading = ref(true);
const saving = ref(false);
const error = ref("");
const status = ref("");
const form = reactive(createHouseDraft());
const showSaveFallback = ref(false);
const pendingSaveData = ref(null);

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
    pendingSaveData.value = next;
    houses.value = await loadAndSaveHouses(next);
    pendingSaveData.value = null;
    status.value = "保存成功，正在返回列表...";
    setTimeout(() => {
      window.location.href = "./index.html";
    }, 500);
  } catch (err) {
    error.value = `保存失败: ${err.message}`;
    showSaveFallback.value = true;
  } finally {
    saving.value = false;
  }
}

async function retrySave() {
  if (!pendingSaveData.value) return;
  saving.value = true;
  error.value = "";
  status.value = "正在重试保存...";
  try {
    houses.value = await loadAndSaveHouses(pendingSaveData.value);
    pendingSaveData.value = null;
    showSaveFallback.value = false;
    status.value = "保存成功，正在返回列表...";
    setTimeout(() => {
      window.location.href = "./index.html";
    }, 500);
  } catch (err) {
    error.value = `重试失败: ${err.message}`;
  } finally {
    saving.value = false;
  }
}

function saveToLocalAndReturn() {
  if (!pendingSaveData.value) return;
  saveHousesToLocal(pendingSaveData.value);
  saveStoredConfig({ ...getRemoteConfig(), dataSourceMode: "local" });
  houses.value = pendingSaveData.value;
  pendingSaveData.value = null;
  showSaveFallback.value = false;
  status.value = "已保存到本地浏览器，正在返回列表...";
  setTimeout(() => {
    window.location.href = "./index.html";
  }, 500);
}

async function copyPendingJson() {
  if (!pendingSaveData.value) return;
  try {
    await copyText(JSON.stringify(pendingSaveData.value, null, 2));
    status.value = "已复制 JSON，可手动粘贴到数据文件";
  } catch (err) {
    error.value = `复制失败: ${err.message}`;
  }
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
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
    <n-modal v-model:show="showSaveFallback" preset="card" title="保存没有成功" style="width: min(520px, calc(100vw - 32px))">
      <p class="page-subtitle" style="margin-top: 0">
        GitHub 保存失败时，可以重试，也可以先保存到当前浏览器，或者复制完整 JSON 手动提交。
      </p>
      <template #footer>
        <n-space justify="end">
          <n-button secondary @click="copyPendingJson">复制 JSON</n-button>
          <n-button secondary @click="saveToLocalAndReturn">保存到本地</n-button>
          <n-button type="primary" :loading="saving" @click="retrySave">重试 GitHub</n-button>
        </n-space>
      </template>
    </n-modal>
  </main>
</template>
