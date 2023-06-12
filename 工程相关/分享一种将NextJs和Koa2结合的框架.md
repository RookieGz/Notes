作者利用空余时间建了一个网站（[xzgz.top](https://xzgz.top)），在开发的过程中需要同时管理前后端的项目，连调的时候需要频繁的切换项目，会让人很烦躁，稍微不注意就不知道自己在干什么了。。。对于独立的开发者来说同时维护前后端两个项目着实让人烦躁。

为了解决这个痛点（算作痛点吧）就想到将Nextjs和koa组合在一起，就能很方便的组合项目，使用一个项目管理，同时也不舍弃前后端分离的逻辑。下面详细的介绍一下这个框架，并且完成网站登录流程的前后端示例。

## 准备工作

需要安装的包：
```shell
nextjs
styled-components
mobx
mobx-react-lite
koa全家桶
mysql2
typescript
webpack相关
```

## 安装
使用yarn安装上述的包

```shell
yarn add next styled-components mobx mobx-react-lite koa koa-body koa-router koa-session mysql2
```
因为现在全面拥抱Typescript，所以还得安装

```shell
yarn add -D typescript ts-loader webpack webpack-cli
```

安装完成后创建`server`和`client`文件夹分别存放服务端代码和客户端代码。

## 开始

先创建一个koa项目的入口文件`server/index.ts`，（在此之前需要在项目根目录下创建一个tsconfig.json，具体配置可以根据nextjs官方配置做参考。）创建一个基础的koa应用。
```typescript
import koa from "koa";
import koaBody from "koa-body";

const server = new koa();

server.use(koaBody());

server.use(async (ctx) => {
  ctx.body = "success";
});

server.listen(6001, () => {
  console.log("Koa server 已启动:", "http://localhost:6001");
});
server.on("error", (e) => {
  console.log("Koa server 错误:", e);
});

```

node无法直接执行ts文件，尽管有ts-node这类的包可以直接运行，但是打包出来的项目路径映射会丢失（这个问题我也解决过可以查看文章：[网站开发日志](https://xzgz.top/blog/38#%E9%81%87%E5%88%B0%E7%9A%84%E4%B8%80%E4%BA%9B%E9%97%AE%E9%A2%9855)）。所以还是选择比较稳定的方法：webpack打包成JS运行。

创建
```js
/** @type {import('webpack').Configuration} */
// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");

const isProduction = process.env.NODE_ENV == "production";

const config = {
  entry: path.resolve(__dirname, "./server/index.ts"),
  output: {
    path: path.resolve(__dirname, "./.server"),
  },
  target: "node",
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", "..."],
    alias: {
      server: path.resolve(__dirname, "./server"),
    },
    mainFields: ["main", "module", "browser"],// 变更webpack的文件查找顺序
  },
  externalsType: "commonjs",
};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";
  } else {
    config.mode = "development";
  }
  return config;
};
```
值得注意的是resolve.mainFields这个字段，默认情况下，Webpack 会按照以下顺序查找 main 字段：
- module
- jsnext:main
- browser
- main

在这个基础项目中有一个第三方包使用了`hexoid`这个包，这个包里面有`.mjs`文件，所以直接运行会报错`hexoid is not a function`，所以改变一下变更webpack的文件引入优先级就可以避免这个错误。

运行`npx webpack --config webpack.server.config.js && node .server/main.js`，可以看到项目已经运行起来了。
![截屏2023-06-12 16.37.09.png](/FILES/2e9864a0233d7196d7f616400.37.09.png)

现在先写一部分，可以关注我的网站（[xzgz.top](https://xzgz.top)）或者关注我已获取后续内容，完整版代码已上传到[开源仓库](https://github.com/RookieGz/monsoon)。

目前这个框架被应用到[xzgz.top](https://xzgz.top)网站。




