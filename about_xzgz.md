# xzgz.top网站记录

## 主要技术栈
应用主要是由koa构建，其中nextjs只负责页面构建完成服务端渲染。以下是主要应用的技术  

后台
- Koa：网站主题内容
- koa-router：网站后端路由
- koa-session：应用的session写入
- nodemailer：发送邮件
- mysql2：数据库操作
- nodemon：开发模式下热更新
- typescript
- ts-node：完成开发模式下运行ts文件
- tsconfig-paths：修复开发模式下tsconfig.json里路径映射在ts-node下不起作用。

前台
- Nextjs：react的服务端渲染
- mobx：前端应用的全局状态管理
- sass：前端应用的样式

## 遇到的一些问题
### tsconfig.json里路径映射问题
**开发模式下**：
vscode读取tsconfig.json里的路径映射没有问题，引用不会报错，但是ts-node启动脚本时会出现路径映射丢失的问题，解决方法是使用tsconfig-paths：
```shell
# 使用以下命令开启脚本
npx ts-node -r tsconfig-paths/register --project ./tsconfig.json app_server/index.ts
```
在nodemon的配置文件nodemon.json里设置
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
直接使用ts-node启动服务器不适合生产模式，使用tsc将ts文件编译成js文件进行运行。
```shell
tsc --project tsconfig.prod.json
```
生成的文件执行时和上面有同样的问题，因为tsc编译时不会对路径映射进行编译，直接执行会报错找不到模块。
按照tsconfig-paths/register的解决方法，在运行脚本之前对Module._resolveFilename进行重写，达到解析路径映射的问题。具体代码：
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
### 使用nodemailer发送163邮箱时超时
nodemailer使用163邮箱发邮件时遇到超时的问题，主要是因为使用163邮箱发送邮件时必须开启secure：
```javascript
transporter = nodemailer.createTransport({
  host: "smtp.163.com", // 第三方邮箱的主机地址
  port: 465,// 25/465, secure为true - 465；false - 25
  secure: true, // 163邮箱必须为true，outlook邮箱必须为false
  auth: {
    user: SENDER, // 发送方邮箱的账号
    pass: SMTP_CODE, // 邮箱授权密码
  },
});
```
