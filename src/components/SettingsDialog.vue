<script setup>
import { reactive, watch } from "vue";
import { NButton, NFormItem, NInput, NModal, NSelect, NSpace } from "naive-ui";
import { buildGitHubFileUrl, parseGitHubFileUrl } from "../shared/data-service.js";

const props = defineProps({
  show: { type: Boolean, required: true },
  config: { type: Object, required: true },
});

const emit = defineEmits(["update:show", "save", "copy-json", "test-config"]);
const draft = reactive({});

const dataSourceOptions = [
  { label: "线上数据", value: "remote" },
  { label: "本地数据", value: "local" },
];

watch(
  () => props.show,
  (show) => {
    if (!show) return;
    Object.keys(draft).forEach((key) => delete draft[key]);
    Object.assign(draft, props.config);
    if (!draft.dataSourceMode) draft.dataSourceMode = "remote";
    if (!draft.githubFileUrl) draft.githubFileUrl = buildGitHubFileUrl(draft);
  },
  { immediate: true },
);

function save() {
  applyGithubFileUrl();
  emit("save", { ...draft });
  emit("update:show", false);
}

function applyGithubFileUrl() {
  const parsed = parseGitHubFileUrl(draft.githubFileUrl);
  if (parsed) Object.assign(draft, parsed);
}

function testDraft() {
  applyGithubFileUrl();
  emit("test-config", { ...draft });
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
    <div class="settings-simple">
      <n-form-item label="数据来源">
        <n-select v-model:value="draft.dataSourceMode" :options="dataSourceOptions" />
      </n-form-item>
      <p v-if="draft.dataSourceMode === 'local'" class="settings-hint">
        本地数据会优先使用当前浏览器保存的数据；没有本地缓存时，再读取页面同级目录下的文件。
      </p>
      <n-form-item v-if="draft.dataSourceMode === 'local'" label="本地文件名">
        <n-input v-model:value="draft.filepath" placeholder="data.json" />
      </n-form-item>
      <n-form-item v-if="draft.dataSourceMode !== 'local'" label="数据文件地址">
        <n-input
          v-model:value="draft.githubFileUrl"
          placeholder="https://github.com/yatxuan/jsonData/blob/main/viewing-records/json.data"
          @blur="applyGithubFileUrl"
        />
      </n-form-item>
      <p v-if="draft.dataSourceMode !== 'local'" class="settings-hint">
        可以直接粘贴 GitHub 页面地址、Raw 地址或 GitHub API 地址；私有仓库需要填写 Token。
      </p>
      <n-form-item v-if="draft.dataSourceMode !== 'local'" label="Personal Access Token">
        <n-input v-model:value="draft.token" type="password" show-password-on="click" placeholder="github_pat_xxx 或 ghp_xxx" />
      </n-form-item>
    </div>
    <details v-if="draft.dataSourceMode !== 'local'" class="advanced-settings">
      <summary>高级设置</summary>
      <div class="form-grid full">
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
    </details>
    <template #footer>
      <n-space justify="end">
        <n-button secondary @click="$emit('copy-json')">复制当前 JSON</n-button>
        <n-button v-if="draft.dataSourceMode !== 'local'" secondary @click="testDraft">
          测试连接
        </n-button>
        <n-button secondary @click="$emit('update:show', false)">取消</n-button>
        <n-button type="primary" @click="save">保存设置</n-button>
      </n-space>
    </template>
  </n-modal>
</template>
