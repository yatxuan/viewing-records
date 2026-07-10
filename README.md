# 我的看房记录

一个部署在 GitHub Pages 上的 Vue 3 看房记录工具。页面负责展示、筛选、对比、编辑房源；数据可以优先从 GitHub 仓库读取，远程不可用时自动回退到当前页面同级目录下的本地 `data.json`。

当前项目使用 Vite + Vue 3 + Naive UI。页面入口仍然是多 HTML 文件，实际业务代码已拆到 `src/`，方便后续按单一职责继续维护。

线上访问地址示例：

```text
https://yatxuan.github.io/viewing-records/
https://yatxuan.github.io/viewing-records/detail.html?id=2
https://yatxuan.github.io/viewing-records/edit.html?id=2
```

## 页面入口

| 页面 | 地址 | 说明 |
|---|---|---|
| 展示页 | `/` 或 `/index.html` | 房源卡片/列表展示、筛选、排序、对比、删除、数据设置 |
| 详情页 | `/detail.html?id=房源ID` | 单套房源详情 |
| 编辑页 | `/edit.html`、`/edit.html?id=房源ID` | 新增或编辑房源 |
| 兼容入口 | `/admin.html` | 管理功能已迁移，会引导回展示页 |

管理后台密码验证已临时隐藏，新增、编辑、删除入口都在展示页和编辑页中。

## 项目结构

```text
index.html              # 展示页入口
detail.html             # 详情页入口
edit.html               # 编辑页入口
admin.html              # 兼容入口
src/pages/*.vue         # 页面编排层
src/components/*.vue    # 单一职责 UI 组件
src/shared/             # 数据服务、默认值、格式化、公共样式
data.json               # 本地兜底数据
```

## 本地开发

项目已经改为 Vite 构建，不再依赖 CDN 里的 Vue。直接打开 HTML 文件不会解析 `import "vue"`，本地请使用开发服务器。

```bash
pnpm install
pnpm run dev
```

打开终端输出的本地地址，例如：

```text
http://localhost:5173/
```

构建生产产物：

```bash
pnpm run build
```

构建后会生成 `dist/`，并复制根目录的 `data.json` 到 `dist/data.json`，作为远程不可用时的本地兜底数据。

## GitHub Pages 自动部署

本项目使用 GitHub Actions 自动部署，工作流文件在：

```text
.github/workflows/deploy.yml
```

触发方式：

- 推送到 `main` 分支自动部署
- 在 GitHub Actions 页面手动触发 `workflow_dispatch`

GitHub Pages 设置：

1. 进入仓库 `Settings -> Pages`
2. `Build and deployment` 的 `Source` 选择 `GitHub Actions`
3. 推送到 `main` 后等待 Actions 完成

资源路径由 `vite.config.js` 自动处理：

- GitHub Actions 构建时使用 `/<仓库名>/`，例如 `/viewing-records/`
- 本地构建时使用 `./`

因此当前公开页面地址 `https://yatxuan.github.io/viewing-records/edit.html?id=2` 会继续可用。

## 数据加载优先级

页面读取数据的顺序是：

设置里的“数据来源”可以切换：

- `线上数据`: GitHub API 远程数据优先；远程不可用时使用本地数据兜底
- `本地数据`: 跳过 GitHub API，直接读取当前页面同级目录下的本地文件，例如 `./data.json`

本地读取顺序：

1. 当前页面同级目录下的配置文件，例如 `./data.json`
2. 浏览器 `localStorage` 中的临时本地数据
3. 空列表

如果你在设置里把数据路径配置成 `viewing-records/json.data`，页面也会优先尝试同级文件名 `./json.data`，再尝试 `./viewing-records/json.data`。

## 私有数据仓库配置

页面仓库和数据仓库可以分开：

- 页面仓库：公开仓库，用来部署 GitHub Pages
- 数据仓库：私有仓库，只保存 `data.json`

在展示页点击 `设置`，填写：

| 字段 | 示例 |
|---|---|
| GitHub 用户名 | `yatxuan` |
| 仓库名 | `jsonData` |
| 分支 | `main` |
| 文件路径 | `viewing-records/json.data` 或 `data.json` |
| Token 类型 | Fine-grained 或 Classic |
| Personal Access Token | `github_pat_...` 或 `ghp_...` |

私有仓库必须配置 Token，否则浏览器访问 GitHub API 会返回 404 或 401，页面就只能显示本地兜底数据。

设置弹窗里的“复制当前 JSON”会复制页面当前正在使用的数据，方便手动备份或粘贴回数据仓库。

### Token 选择

两种 GitHub Token 都可以用：

- Fine-grained personal access token：推荐。只授权给数据仓库，并给 `Contents` 开启 `Read and write`。
- Personal access token (classic)：也可以。需要勾选 `repo` 权限，权限范围更大。

页面里的 Token 类型只是帮助你记录当前使用方式，请求 GitHub API 时都会使用 `Authorization: Bearer <token>`。

Token 只保存在当前浏览器的 `localStorage`，不会提交到仓库。不要把 Token 写进 `data.json`、HTML 或 README。

## 数据字段

`data.json` 是一个数组，每一项是一套房源。当前字段以新版编辑页为准，不再兼容旧的单个 `wechat` 字段。

```json
[
  {
    "id": 1,
    "type": "personal",
    "status": "unviewed",
    "displayOrder": 1,
    "address": "小区 / 楼栋 / 房号",
    "metroStation": "大运站",
    "commuteDurationMinutes": 35,
    "price": 1800,
    "subsidyAmount": 70,
    "subsidyMonths": 3,
    "bedrooms": "一房",
    "livingRooms": "0厅",
    "balconies": "一阳台",
    "balconySize": "中阳台",
    "hasKitchen": "yes",
    "kitchenType": "independent",
    "sharedKitchenLocation": "",
    "toilets": "一厕",
    "cookingType": "天然气",
    "floor": "8",
    "direction": "未知",
    "area": 35,
    "lighting": "未知",
    "furnitureComplete": true,
    "appliances": ["床", "空调", "洗衣机"],
    "utility": "民水民电",
    "networkMode": "未知",
    "networkFee": "",
    "viewTime": "2026-07-10T14:30",
    "source": "小红书",
    "contacts": [
      { "type": "微信", "value": "example" },
      { "type": "电话", "value": "13800000000" }
    ],
    "discountStrategy": "首月减免 300",
    "score": 4,
    "pros": "通勤近",
    "cons": "楼下略吵",
    "notes": "二次确认水电费"
  }
]
```

常用默认值：

- `status`: `unviewed`，展示为“未看”；其他状态展示为“已看”
- `utility`: `民水民电`
- `elevator`: `未知`
- `networkMode`: `未知`
- `lighting`: `未知`
- `direction`: `未知`
- `toilets`: `一厕`

补贴字段说明：

- `subsidyAmount`: 每月补贴金额。例如月租 `1570`、补贴 `70`，展示到手价为 `1500`
- `subsidyMonths`: 补贴持续月份

厨房字段说明：

- `kitchenType`: `independent` 表示独立厨房，`shared` 表示公用厨房
- `sharedKitchenLocation`: 公用厨房位置，可选“和阳台共用”“门口玄关共用”“挨着厕所”

家电字段说明：

- `furnitureComplete`: `true` 时展示为“家电齐全”，保存时默认包含床、冰箱、空调、洗衣机、热水器

## 常见问题

### 为什么访问私有仓库数据失败？

常见原因：

- 没有填写 Token
- Token 没有授权到目标私有仓库
- Fine-grained Token 没有给 `Contents: Read and write`
- 仓库名、分支、文件路径填错
- 使用了 GitHub 页面地址，而不是 API 所需的仓库路径配置

比如浏览器页面地址：

```text
https://github.com/yatxuan/jsonData/blob/main/viewing-records/json.data
```

设置里应拆成：

```text
owner: yatxuan
repo: jsonData
branch: main
filepath: viewing-records/json.data
```

### 保存时报 HTTP 409 怎么办？

409 通常表示远程文件已变化，本地保存时带的 `sha` 旧了。当前代码会重新拉取最新 `sha` 后再保存一次，并在保存后重新拉取数据。

### 页面白屏或资源 404 怎么办？

确认 GitHub Pages 的 Source 是 `GitHub Actions`，并检查 Actions 是否构建成功。不要把 Pages 配成 root 目录直接发布源码，因为当前源码需要 Vite 先构建。
