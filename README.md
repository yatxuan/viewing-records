# 我的看房记录

基于 GitHub Pages + GitHub API 的看房记录管理工具。数据存在 GitHub 仓库里，页面上可以增删改查。

## 快速开始

### 1. 创建 GitHub 仓库

1. 在 [github.com](https://github.com) 新建一个 **私有** 仓库（推荐），名字如 `viewing-records`
2. 把本目录下的文件上传到这个仓库：
   - `data.json` — 房源数据
   - `viewing-records.html` — 查看页面
   - `admin.html` — 管理后台

### 2. 创建 GitHub Personal Access Token

1. 访问 [Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens/new)
2. 勾选 **`repo`** 权限（全选 Fine-grained 也行，但至少给 `Contents: read and write`）
3. 点击 Generate token，**复制保存**，后面要用

### 3. 开启 GitHub Pages

1. 进入仓库 Settings → Pages
2. Source 选 `main` 分支，文件夹选 `/ (root)`
3. 保存后等待 1-2 分钟，你会得到一个地址如 `https://yourname.github.io/viewing-records/`

### 4. 配置管理后台

1. 打开 `https://yourname.github.io/viewing-records/admin.html`
2. 默认密码: `admin123`（登录后建议修改）
3. 点击 ⚙️ 设置，填入你的：
   - GitHub 用户名
   - 仓库名
   - Personal Access Token
4. 保存后就能直接管理房源了

## 使用说明

| 页面 | 地址 | 功能 |
|---|---|---|
| 查看页 | `/viewing-records.html` | 浏览所有房源卡片，自动从 GitHub 拉取最新数据 |
| 管理页 | `/admin.html` | 登录后可新增、编辑、删除房源，修改自动同步到 GitHub |

## 数据格式 (data.json)

```json
{
  "id": 1,
  "type": "personal",       // personal = 个人转租, agent = 中介
  "address": "详细地址",
  "price": 1350,             // 月租
  "roomType": "一房一厅",
  "floor": "2",              // 楼层
  "furniture": "包家电",
  "lighting": "一般",
  "lightingNote": "关下半窗 + 开灯",
  "waterElectric": "",
  "electricPrice": "",       // 电费 元/度
  "waterPrice": "",          // 水费 元/吨
  "viewTime": "明天中午",
  "wechat": "微信号",
  "source": "抖音",          // 来源
  "notes": "",
  "satisfaction": 0          // 满意度 1-5 星
}
```

## 安全提醒

- 仓库建议设为 **私有**，避免暴露微信号等隐私信息
- Token 只存在你本地浏览器的 localStorage 中，不会上传到任何服务器
- 建议定期更换 Token
