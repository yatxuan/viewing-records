<script setup>
import { reactive, watch } from "vue";
import { NButton, NFormItem, NInput, NModal, NSelect, NSpace } from "naive-ui";

const props = defineProps({
  show: { type: Boolean, required: true },
  config: { type: Object, required: true },
});

const emit = defineEmits(["update:show", "save", "copy-json"]);
const draft = reactive({});

const tokenTypeOptions = [
  { label: "Fine-grained token", value: "fine-grained" },
  { label: "Classic token", value: "classic" },
];

const dataSourceOptions = [
  { label: "线上数据", value: "remote" },
  { label: "本地数据", value: "local" },
];

watch(
  () => props.show,
  (show) => {
    if (show) Object.assign(draft, props.config);
    if (show && !draft.dataSourceMode) draft.dataSourceMode = "remote";
  },
  { immediate: true },
);

function save() {
  emit("save", { ...draft });
  emit("update:show", false);
}
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    title="数据设置"
    style="width: min(640px, calc(100vw - 32px))"
    @update:show="$emit('update:show', $event)"
  >
    <div class="form-grid full">
      <n-form-item label="数据来源">
        <n-select v-model:value="draft.dataSourceMode" :options="dataSourceOptions" />
      </n-form-item>
      <n-form-item label="GitHub 用户名">
        <n-input v-model:value="draft.owner" placeholder="yatxuan" />
      </n-form-item>
      <n-form-item label="仓库名">
        <n-input v-model:value="draft.repo" placeholder="viewing-records" />
      </n-form-item>
    </div>
    <div class="form-grid">
      <n-form-item label="分支">
        <n-input v-model:value="draft.branch" placeholder="main" />
      </n-form-item>
      <n-form-item label="文件路径">
        <n-input v-model:value="draft.filepath" placeholder="data.json" />
      </n-form-item>
    </div>
    <div class="form-grid">
      <n-form-item label="Token 类型">
        <n-select v-model:value="draft.tokenType" :options="tokenTypeOptions" />
      </n-form-item>
      <n-form-item label="Personal Access Token">
        <n-input v-model:value="draft.token" type="password" show-password-on="click" placeholder="github_pat_xxx 或 ghp_xxx" />
      </n-form-item>
    </div>
    <template #footer>
      <n-space justify="end">
        <n-button secondary @click="$emit('copy-json')">复制当前 JSON</n-button>
        <n-button secondary @click="$emit('update:show', false)">取消</n-button>
        <n-button type="primary" @click="save">保存设置</n-button>
      </n-space>
    </template>
  </n-modal>
</template>
