<script setup>
import { NButton, NResult, NSpace } from "naive-ui";
</script>

<template>
  <main class="app-page narrow">
    <n-result status="info" title="管理功能已移到展示页" description="现在可以在房源列表直接新增、编辑、删除、筛选和设置数据源。">
      <template #footer>
        <n-space justify="center">
          <n-button tag="a" href="./index.html" type="primary">返回展示页</n-button>
          <n-button tag="a" href="./edit.html" secondary>新增房源</n-button>
        </n-space>
      </template>
    </n-result>
  </main>
</template>
