# 个人笔记本 (Note App)

基于 **FastAPI + React** 的全栈笔记应用，支持用户注册/登录、笔记增删改查。

## 技术栈

| 层 | 技术 |
|---|------|
| 后端 | FastAPI, SQLAlchemy, PyMySQL, JWT + bcrypt |
| 前端 | React 19, Vite, Tailwind CSS v4, Lucide Icons |
| 数据库 | MySQL |

## 项目结构

```
note-app/
├── backend/
│   ├── main.py          # FastAPI 入口 + 路由
│   ├── auth.py          # JWT 认证、密码哈希
│   ├── models.py        # SQLAlchemy 模型 (User, Note)
│   ├── schemas.py       # Pydantic 校验
│   ├── database.py      # 数据库连接 + 表迁移
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.jsx          # 路由配置
    │   ├── AuthContext.jsx  # 认证状态管理
    │   ├── api.js           # API 请求封装
    │   ├── components/
    │   │   └── AuthShell.jsx  # 登录/注册页外壳
    │   └── pages/
    │       ├── Login.jsx      # 登录页
    │       ├── Register.jsx   # 注册页
    │       ├── NotesPage.jsx  # 笔记主页
    │       ├── NoteEdit.jsx   # 笔记编辑页
    │       └── NoteView.jsx   # 笔记查看页（只读）
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 快速开始

### 1. 准备数据库

安装 MySQL，创建数据库：

```sql
CREATE DATABASE note_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 启动后端

```bash
cd backend
pip install -r requirements.txt
MYSQL_USER=root MYSQL_PASSWORD=yourpassword uvicorn main:app --reload --port 8000
```

环境变量（均可选）：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `MYSQL_USER` | `root` | 数据库用户名 |
| `MYSQL_PASSWORD` | `` | 数据库密码 |
| `MYSQL_HOST` | `127.0.0.1` | 数据库地址 |
| `MYSQL_PORT` | `3306` | 数据库端口 |
| `MYSQL_DATABASE` | `note_app` | 数据库名 |
| `JWT_SECRET_KEY` | 内置 dev key | JWT 签名密钥 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` | Token 有效期（默认 7 天） |

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:5173/。

Vite 自动将 `/api` 请求代理到后端 `http://127.0.0.1:8000`。

## API 接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/register` | 注册 | 否 |
| POST | `/api/login` | 登录 | 否 |
| GET | `/api/me` | 当前用户 | 是 |
| GET | `/api/notes` | 笔记列表 | 是 |
| GET | `/api/notes/:id` | 查看笔记 | 是 |
| POST | `/api/notes` | 创建笔记 | 是 |
| PUT | `/api/notes/:id` | 更新笔记 | 是 |
| DELETE | `/api/notes/:id` | 删除笔记 | 是 |

## 前端交互

| 操作 | 行为 |
|------|------|
| 双击笔记卡片 | 跳转只读查看页 `/notes/:id` |
| 点击编辑按钮 | 跳转编辑页 `/notes/:id/edit` |
| 点击新建笔记 | 主页左侧表单创建 |
| 笔记超过 150 字 | 自动折叠，点击"展开"查看全文 |

## 构建生产版本

```bash
cd frontend && npm run build
```

构建产物输出到 `frontend/dist/`，可直接部署到静态服务器或由 FastAPI 托管。
