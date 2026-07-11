<script setup>
import { reactive, watch } from "vue";
import { NButton, NFormItem, NInput, NModal, NSpace } from "naive-ui";
import { buildGitHubFileUrl, parseGitHubFileUrl } from "../shared/data-service.js";

const props = defineProps({
  show: { type: Boolean, required: true },
  config: { type: Object, required: true },
});

const emit = defineEmits(["update:show", "save", "copy-json", "test-config"]);
const draft = reactive({});

watch(
  () => props.show,
  (show) => {
    if (!show) return;
    Object.keys(draft).forEach((key) => delete draft[key]);
    Object.assign(draft, props.config);
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
      <p class="settings-hint">
        页面默认使用浏览器本地缓存；只有点击“刷新数据”时才会从这里配置的 GitHub 文件拉取远程数据。
      </p>
      <n-form-item label="数据文件地址">
        <n-input
          v-model:value="draft.githubFileUrl"
          placeholder="https://github.com/yatxuan/jsonData/blob/main/viewing-records/json.data"
          @blur="applyGithubFileUrl"
        />
      </n-form-item>
      <p class="settings-hint">
        可以直接粘贴 GitHub 页面地址、Raw 地址或 GitHub API 地址；私有仓库需要填写 Token。
      </p>
      <n-form-item label="Personal Access Token">
        <n-input v-model:value="draft.token" type="password" show-password-on="click" placeholder="github_pat_xxx 或 ghp_xxx" />
      </n-form-item>
    </div>
    <template #footer>
      <n-space justify="end">
        <n-button secondary @click="$emit('copy-json')">复制当前 JSON</n-button>
        <n-button secondary @click="testDraft">
          测试连接
        </n-button>
        <n-button secondary @click="$emit('update:show', false)">取消</n-button>
        <n-button type="primary" @click="save">保存设置</n-button>
      </n-space>
    </template>
  </n-modal>
</template>
