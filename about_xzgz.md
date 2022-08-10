# xzgz.top 网站记录

## 主要技术栈

应用主要是由 koa 构建，其中 nextjs 只负责页面构建完成服务端渲染。以下是主要应用的技术

后台

- Koa：网站主题内容
- koa-router：网站后端路由
- koa-session：应用的 session 写入
- nodemailer：发送邮件
- mysql2：数据库操作
- nodemon：开发模式下热更新
- typescript
- ts-node：完成开发模式下运行 ts 文件
- tsconfig-paths：修复开发模式下 tsconfig.json 里路径映射在 ts-node 下不起作用。

前台

- Nextjs：react 的服务端渲染
- mobx：前端应用的全局状态管理
- sass：前端应用的样式

## 遇到的一些问题

### tsconfig.json 里路径映射问题

**开发模式下**：
vscode 读取 tsconfig.json 里的路径映射没有问题，引用不会报错，但是 ts-node 启动脚本时会出现路径映射丢失的问题，解决方法是使用 tsconfig-paths：

```shell
# 使用以下命令开启脚本
npx ts-node -r tsconfig-paths/register --project ./tsconfig.json app_server/index.ts
```

在 nodemon 的配置文件 nodemon.json 里设置

```json
{
  "watch": ["app_server/", "types/"],
  "ext": "js,json,ts",
  "execMap": {
    "ts": "ts-node -r tsconfig-paths/register --project ./tsconfig.json"
  }
}
```

**生产模式下**：
直接使用 ts-node 启动服务器不适合生产模式，使用 tsc 将 ts 文件编译成 js 文件进行运行。

```shell
tsc --project tsconfig.prod.json
```

生成的文件执行时和上面有同样的问题，因为 tsc 编译时不会对路径映射进行编译，直接执行会报错找不到模块。
按照 tsconfig-paths/register 的解决方法，在运行脚本之前对 Module.\_resolveFilename 进行重写，达到解析路径映射的问题。具体代码：

```javascript
const Module = require("module");
const path = require("path");

// 具体的路径映射根据实际情况改动
const replaceUrl = /^@server\//;

function findModel(request, _module) {
  const pathArr = request.replace(replaceUrl, "");

  let i = _module;
  while (i) {
    const filename = path.resolve(i.path, "../");
    if (/app_server$/.test(filename)) {
      break;
    } else {
      i = _module.parent;
    }
  }

  return path.join(i.path, "../", pathArr);
}

function preRunApp() {
  var originalResolveFilename = Module._resolveFilename;

  Module._resolveFilename = function (request, _parent) {
    if (replaceUrl.test(request)) {
      const findModule = findModel(request, _parent);
      return originalResolveFilename.call(this, findModule);
    }
    return originalResolveFilename.call(this, request, _parent);
  };
}

preRunApp();
```

然后在执行脚本时使用命令

```shell
node -r ./preRunApp.js dist/app_server/index.js
```

### 使用 nodemailer 发送 163 邮箱时超时

nodemailer 使用 163 邮箱发邮件时遇到超时的问题，主要是因为使用 163 邮箱发送邮件时必须开启 secure：

```javascript
transporter = nodemailer.createTransport({
  host: "smtp.163.com", // 第三方邮箱的主机地址
  port: 465, // 25/465, secure为true - 465；false - 25
  secure: true, // 163邮箱必须为true，outlook邮箱必须为false
  auth: {
    user: SENDER, // 发送方邮箱的账号
    pass: SMTP_CODE, // 邮箱授权密码
  },
});
```

### 生产环境请求时间数据和开发环境请求同样的数据不一致（docker 容器和系统时区不一致）

应用运行在 docker 容器中，docker 容器的日期和系统的不一致。
在 Dockerfile 里配置将系统使用时区拷贝进 docker 容器中，具体如下：

```shell
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN echo 'Asia/Shanghai' > /etc/timezone
```

### 生产环境请求接口的页面会报错，提示水合失败，开发环境没有这个问题

这个问题也是由上面的问题影响的。docker 容器里 react 的脱水执行生成时间的太平洋时间。而到了客户端注水的时候生成东 8 区时间，导致服务端和客户端渲染不一致，因此报错。

### nextjs 中使用 mobx 服务端和客户端数据无法保持一致

因为 mobx 在服务端初始化时生成的数据没有被传到客户端，所以需要客户端也会完成一次初始化。某些页面需要提前在 store 里调用方法完成服务端渲染。
那么需要手动的完成 mobx 的注水过程（类似于服务端渲染的脱水注水）。使用如下方法解决：

```ts
// pages/_app.ts
function MyApp({
  Component,
  pageProps,
  store, // 重点
}: AppProps & { store: AppStore }) {
  // 注水
  const _defaultStore = initializeStore(store);
  return (
    <MyAppContext.Provider value={_defaultStore}>
      <WithLayout {...pageProps} store={_defaultStore} />
    </MyAppContext.Provider>
  );
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  const { Component, ctx } = appContext;

  // 服务端完成初始化
  const store = initializeStore();
  ctx.store = store;

  let appProps = {};
  if (Component.getInitialProps) {
    appProps = await Component.getInitialProps(ctx);
  }

  return { pageProps: appProps, store };
};

// store/index.ts
class Store {
  this.user = null
  // ...
  // 补水
  hydrate(initState: Store) {
    Object.assign(this, initState);
  }
}


let store: Store;
function initializeStore(initDate?: Store): Store {
  enableStaticRendering(typeof window === "undefined");

  const _store = store ?? new Store();
  if (initDate) {
    _store.hydrate(initDate);
  }
  // 客户端渲染总是new一个新对象
  if (typeof window === "undefined") return _store;
  if (!store) store = _store;

  return _store;
}

export { initializeStore, store };
```

## 剩余问题
