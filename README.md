# 盲盒抽奖商城系统 - 前端应用

## 项目简介

这是一个基于 **React + Vite + TailwindCSS** 的盲盒抽奖商城前端应用，实现了类似微信小程序泡泡玛特的盲盒抽奖功能。系统采用组件化设计，支持多用户注册登录、盲盒管理、抽奖、订单管理、玩家秀等完整功能。

## 功能特性

### ✅ 基础功能（8项核心功能）

1. **多用户注册、登录** - 支持用户注册、登录、JWT认证
2. **盲盒管理** - 商家可创建、编辑、上下架盲盒
3. **盲盒抽取** - 基于概率算法的抽奖系统
4. **盲盒订单管理** - 完整的订单创建、支付、开盒流程
5. **盲盒列表查看** - 支持分页、筛选、搜索功能
6. **盲盒详情查看** - 详细的盲盒信息和商品展示
7. **玩家秀** - 用户分享抽奖成果的社区功能
8. **盲盒搜索** - 支持关键词、价格、稀有度等多维度搜索

### 🎯 附加功能

- **支付宝支付集成** - 支持沙盒环境和Docker环境模拟支付
- **地址管理** - 收货地址的增删改查
- **优惠券系统** - 优惠券发放、领取、使用和管理
- **购物车功能** - 商品加入购物车、数量修改、清空
- **充值系统** - 用户余额充值和管理
- **评论系统** - 盲盒评论、点赞、回复功能
- **响应式设计** - 支持移动端和桌面端
- **现代化UI** - 采用TailwindCSS实现美观界面

## 技术栈

### 前端技术
- **框架**: React 19 + Vite 7
- **样式**: TailwindCSS 4.x
- **路由**: React Router 7.x
- **HTTP客户端**: Axios
- **状态管理**: React Hooks + Context
- **UI组件**: 自定义组件库
- **构建工具**: Vite
- **代码规范**: ESLint
- **测试**: Vitest + React Testing Library

### 开发工具
- **IDE**: WebStorm
- **包管理**: npm
- **版本控制**: Git
- **代码格式化**: Prettier

## 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端 (React)   │    │   后端 (Midway)  │    │   数据库 (SQLite) │
│                 │    │                 │    │                 │
│ • 用户界面      │◄──►│ • RESTful API   │◄──►│ • 用户数据      │
│ • 组件化设计    │    │ • 业务逻辑      │    │ • 盲盒数据      │
│ • 响应式布局    │    │ • 数据验证      │    │ • 订单数据      │
│ • 状态管理      │    │ • 认证授权      │    │ • 社区数据      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 项目结构

```
blindboxmall-fronted/
├── src/                    # 源代码
│   ├── components/        # 公共组件
│   │   ├── Navbar.jsx    # 导航栏组件
│   │   ├── BlindBoxFilter.jsx # 盲盒筛选组件
│   │   ├── BlindBoxTabs.jsx   # 盲盒分类标签
│   │   ├── HotKeywords.jsx    # 热门关键词
│   │   ├── AddressManageModal.jsx # 地址管理弹窗
│   │   ├── RechargeModal.jsx  # 充值弹窗
│   │   └── ErrorBoundary.jsx  # 错误边界
│   ├── pages/            # 页面组件
│   │   ├── user/         # 用户相关页面
│   │   │   ├── Login.jsx # 登录页面
│   │   │   ├── Register.jsx # 注册页面
│   │   │   ├── Profile.jsx # 个人中心
│   │   │   └── PrizeList.jsx # 奖品列表
│   │   ├── blindbox/     # 盲盒相关页面
│   │   │   ├── BlindBoxList.jsx # 盲盒列表
│   │   │   └── BlindBoxDetail.jsx # 盲盒详情
│   │   ├── cart/         # 购物车页面
│   │   │   └── Cart.jsx  # 购物车
│   │   ├── order/        # 订单相关页面
│   │   │   ├── OrderList.jsx # 订单列表
│   │   │   ├── OrderDetail.jsx # 订单详情
│   │   │   └── OrderConfirm.jsx # 订单确认
│   │   ├── community/    # 社区相关页面
│   │   │   ├── PlayerShowList.jsx # 玩家秀列表
│   │   │   ├── PlayerShowDetail.jsx # 玩家秀详情
│   │   │   └── PlayerShowCreate.jsx # 创建玩家秀
│   │   ├── coupon/       # 优惠券相关页面
│   │   │   ├── CouponCenter.jsx # 优惠券中心
│   │   │   ├── CouponManage.jsx # 优惠券管理
│   │   │   └── MyCoupons.jsx # 我的优惠券
│   │   ├── seller/       # 商家相关页面
│   │   │   ├── SellerDashboard.jsx # 商家仪表板
│   │   │   ├── CreateBlindBox.jsx # 创建盲盒
│   │   │   ├── ManageBlindBoxes.jsx # 管理盲盒
│   │   │   ├── CreateBoxItem.jsx # 创建商品
│   │   │   ├── ManageBoxItems.jsx # 管理商品
│   │   │   └── SellerStats.jsx # 商家统计
│   │   └── admin/        # 管理员页面
│   │       └── AdminDashboard.jsx # 管理员仪表板
│   ├── router/           # 路由配置
│   │   ├── router.jsx    # 路由定义
│   │   └── routerGuards.jsx # 路由守卫
│   ├── hooks/            # 自定义Hooks
│   │   └── useUser.js    # 用户状态管理
│   ├── utils/            # 工具函数
│   │   └── axios.js      # HTTP客户端配置
│   ├── assets/           # 静态资源
│   ├── App.jsx           # 根组件
│   ├── main.jsx          # 入口文件
│   ├── index.css         # 全局样式
│   └── App.css           # 应用样式
├── test/                 # 测试文件
├── public/               # 公共资源
├── .github/              # GitHub Actions
├── tailwind.config.js    # TailwindCSS配置
├── vite.config.js        # Vite配置
├── eslint.config.js      # ESLint配置
└── package.json          # 项目配置
```

## 页面功能

### 用户相关页面
- **登录页面** (`/login`) - 用户登录界面
- **注册页面** (`/register`) - 用户注册界面
- **个人中心** (`/profile`) - 用户信息管理
- **奖品列表** (`/prizes`) - 用户抽奖获得的奖品

### 盲盒相关页面
- **盲盒列表** (`/blindboxes`) - 盲盒展示和筛选
- **盲盒详情** (`/blindbox/:id`) - 盲盒详细信息

### 购物车页面
- **购物车** (`/cart`) - 购物车商品管理

### 订单相关页面
- **订单列表** (`/orders`) - 用户订单管理
- **订单详情** (`/order/:id`) - 订单详细信息
- **订单确认** (`/order/confirm`) - 订单确认和支付

### 社区相关页面
- **玩家秀列表** (`/shows`) - 玩家秀展示
- **玩家秀详情** (`/shows/:id`) - 玩家秀详细信息
- **创建玩家秀** (`/shows/create`) - 发布玩家秀

### 优惠券相关页面
- **优惠券中心** (`/coupon/center`) - 优惠券领取
- **优惠券管理** (`/coupon/manage`) - 优惠券管理（管理员）
- **我的优惠券** (`/coupon/my`) - 用户优惠券

### 商家相关页面
- **商家仪表板** (`/seller`) - 商家数据统计
- **创建盲盒** (`/seller/blindbox/create`) - 创建新盲盒
- **管理盲盒** (`/seller/blindbox/manage`) - 盲盒管理
- **创建商品** (`/seller/item/create`) - 创建盲盒商品
- **管理商品** (`/seller/item/manage`) - 商品管理
- **商家统计** (`/seller/stats`) - 销售统计

### 管理员页面
- **管理员仪表板** (`/admin`) - 系统管理

## 组件说明

### 公共组件
- **Navbar** - 导航栏组件，支持用户登录状态显示
- **BlindBoxFilter** - 盲盒筛选组件，支持多条件筛选
- **BlindBoxTabs** - 盲盒分类标签组件
- **HotKeywords** - 热门关键词组件
- **AddressManageModal** - 地址管理弹窗组件
- **RechargeModal** - 充值弹窗组件
- **ErrorBoundary** - 错误边界组件

### 自定义Hooks
- **useUser** - 用户状态管理Hook
- **useToken** - Token管理Hook

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 本地开发

1. **克隆项目**
```bash
git clone https://github.com/AdamAmon/blindboxmall-fronted.git
cd blindboxmall-fronted
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm run dev
```

4. **访问应用**
- 主应用: http://localhost:5173

### 构建部署

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 运行测试
npm test

# 代码规范检查
npm run lint
```

## 开发规范

### 代码规范
- 使用ESLint进行代码检查
- 遵循React最佳实践
- 使用函数式组件和Hooks
- 组件采用PascalCase命名
- 文件采用camelCase命名

### 组件设计原则
- 单一职责原则
- 可复用性设计
- 响应式布局
- 无障碍访问支持

### Git提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

## 测试

### 运行测试
```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行测试UI
npm run test:ui

# 监听模式运行测试
npm run test:watch
```

### 测试覆盖率
项目包含完整的单元测试

### 最新测试结果
执行摘要:
```text
Test Files  35 passed (35)
Tests       459 passed (459)
```

覆盖率报告:
```text
 % Coverage report from v8
------------------------------------------|---------|----------|---------|---------|--------------------------------------------
File                                      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
------------------------------------------|---------|----------|---------|---------|--------------------------------------------
All files                                 |   81.75 |    76.88 |   51.82 |   81.75 |                                            
 blindboxmall-fronted                     |       0 |        0 |       0 |       0 |                                            
  test-avatar-fix.js                      |       0 |        0 |       0 |       0 | 1                                          
 blindboxmall-fronted/src                 |   26.41 |       50 |      50 |   26.41 |                                            
  App.jsx                                 |     100 |      100 |     100 |     100 |                                            
  main.jsx                                |       0 |        0 |       0 |       0 | 1-44                                       
 blindboxmall-fronted/src/components      |   88.96 |    87.02 |   94.59 |   88.96 |                                            
  AddressManageModal.jsx                  |   96.18 |    95.83 |     100 |   96.18 | 61-71                                      
  BlindBoxFilter.jsx                      |     100 |      100 |     100 |     100 |                                            
  BlindBoxTabs.jsx                        |     100 |      100 |     100 |     100 |                                            
  ErrorBoundary.jsx                       |   80.95 |       25 |   33.33 |   80.95 | 20,38-45                                   
  HotKeywords.jsx                         |     100 |      100 |     100 |     100 |                                            
  Navbar.jsx                              |   66.12 |       68 |     100 |   66.12 | ...-29,33-34,42-49,51-59,84-90,142,190-219 
  RechargeModal.jsx                       |   90.16 |    69.23 |     100 |   90.16 | 13-15,22,58-65                             
 blindboxmall-fronted/src/hooks           |   93.33 |      100 |      80 |   93.33 |                                            
  useUser.js                              |   93.33 |      100 |      80 |   93.33 | 34,61,79-82                                
 blindboxmall-fronted/src/pages/admin     |   66.25 |    82.14 |    9.09 |   66.25 |                                            
  AdminDashboard.jsx                      |   66.25 |    82.14 |    9.09 |   66.25 | ...128-144,147-163,166-167,415-437,443-554 
 blindboxmall-fronted/src/pages/blindbox  |    82.3 |    71.09 |      50 |    82.3 |                                            
  BlindBoxDetail.jsx                      |   86.12 |    73.63 |      68 |   86.12 | ...229-248,412-415,422-424,571-582,743-768 
  BlindBoxList.jsx                        |   72.17 |    55.55 |    9.09 |   72.17 | ...107,184-185,193,238-240,247-249,261-295 
 blindboxmall-fronted/src/pages/cart      |    98.9 |    66.12 |    92.3 |    98.9 |                                            
  Cart.jsx                                |    98.9 |    66.12 |    92.3 |    98.9 | 43-44,89                                   
 blindboxmall-fronted/src/pages/community |   78.45 |    77.45 |   56.09 |   78.45 |                                            
  PlayerShowCreate.jsx                    |   96.87 |    82.75 |     100 |   96.87 | 51-53,74-76,90-91                          
  PlayerShowDetail.jsx                    |   63.69 |    72.72 |      25 |   63.69 | ...211-214,413-420,573-616,621-650,670-725 
  PlayerShowList.jsx                      |   95.74 |    78.94 |      70 |   95.74 | 53,55,189-191,228-232                      
 blindboxmall-fronted/src/pages/coupon    |   79.56 |    77.44 |   51.28 |   79.56 |                                            
  CouponCenter.jsx                        |   88.78 |    86.11 |      60 |   88.78 | 51-73,118-122,190,196-198,341,346-352      
  CouponManage.jsx                        |   58.16 |    68.75 |   29.41 |   58.16 | ...243,286-287,294-295,306-311,342,376-519 
  MyCoupons.jsx                           |    96.6 |    76.92 |      75 |    96.6 | 110,209,215-217,401-408                    
 blindboxmall-fronted/src/pages/order     |   77.44 |       78 |   42.85 |   77.44 |                                            
  OrderConfirm.jsx                        |   79.95 |    77.77 |   36.36 |   79.95 | ...84,86-89,93-137,221-232,280-291,455-458 
  OrderDetail.jsx                         |   63.08 |    76.31 |      40 |   63.08 | ...374-432,436-456,501-507,511-517,527-566 
  OrderList.jsx                           |   96.11 |       80 |   57.14 |   96.11 | 274-277,302-305,332-335                    
 blindboxmall-fronted/src/pages/seller    |   80.83 |    70.04 |      35 |   80.83 |                                            
  CreateBlindBox.jsx                      |   97.27 |    95.12 |   71.42 |   97.27 | 27-31,94-95,266-267                        
  CreateBoxItem.jsx                       |   96.99 |    80.43 |      80 |   96.99 | 36-37,48-52,110-111,254-255                
  ManageBlindBoxes.jsx                    |   86.15 |    77.41 |   26.66 |   86.15 | ...155-157,162-163,345-346,419-432,438-472 
  ManageBoxItems.jsx                      |   54.53 |     61.7 |      25 |   54.53 | ...226,306-307,318,414-415,481-571,576-683 
  SellerDashboard.jsx                     |   68.96 |    13.63 |   16.66 |   68.96 | 34-35,37-38,65-149,201-218,243-244,254-255 
  SellerStats.jsx                         |   99.01 |     67.5 |   44.44 |   99.01 | 252,265,278                                
 blindboxmall-fronted/src/pages/user      |   86.85 |    78.78 |   59.64 |   86.85 |                                            
  Login.jsx                               |     100 |    95.83 |     100 |     100 | 47                                         
  PrizeList.jsx                           |   84.07 |    80.95 |   23.07 |   84.07 | 74-75,82-84,86-89,91-92,247-248,270-304    
  Profile.jsx                             |   77.95 |       79 |   70.37 |   77.95 | ...242,267,277-320,322-323,335-337,345-346 
  Register.jsx                            |   92.49 |    70.76 |   54.54 |   92.49 | ...118-119,137-144,260-262,304-306,360,389 
 blindboxmall-fronted/src/router          |   99.58 |    95.65 |     100 |   99.58 |                                            
  router.jsx                              |     100 |      100 |     100 |     100 |                                            
  routerGuards.jsx                        |   97.29 |    95.65 |     100 |   97.29 | 15                                         
 blindboxmall-fronted/src/utils           |   92.72 |    83.33 |     100 |   92.72 |                                            
  axios.js                                |   92.72 |    83.33 |     100 |   92.72 | 11-12,35-36                                
------------------------------------------|---------|----------|---------|---------|--------------------------------------------
```


## 部署说明

### 生产环境部署
1. 构建项目：`npm run build`
2. 部署 `dist` 目录到Web服务器
3. 配置反向代理到后端API

### 环境变量配置
- `VITE_API_BASE_URL` - API基础URL
- `VITE_APP_TITLE` - 应用标题

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 项目地址: https://github.com/AdamAmon/blindboxmall-fronted
- 后端地址: https://github.com/AdamAmon/blindboxmall-backside

## 更新日志

### v1.0.0
- ✅ 完成基础8项功能
- ✅ 实现支付宝支付集成
- ✅ 完成响应式设计
- ✅ 配置GitHub Actions CI/CD
- ✅ 完成完整的测试覆盖
- ✅ 实现玩家秀社区功能
- ✅ 支持多平台部署
- ✅ 实现优惠券系统
- ✅ 实现地址管理功能
- ✅ 实现购物车功能
- ✅ 实现充值系统
- ✅ 实现评论系统
- ✅ 实现商家管理功能
- ✅ 实现管理员功能

---

**注意**: 本项目为Web开发大作业，实现了完整的盲盒抽奖商城功能，目前只支持开发环境部署。
