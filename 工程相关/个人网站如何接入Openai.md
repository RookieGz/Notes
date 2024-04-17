## Openai API的概念和作用

OpenAI API是一个强大的人工智能API，由OpenAI基金会开发并提供。 它提供了丰富的算法、模型以及先进的人工智能技术，帮助开发者快速搭建人工智能应用，实现人工智能在实际场景中的应用。借助OpenAI API，开发者可以轻松地开发出智能对话机器人、文本生成、语言理解、知识图谱和智能推荐等功能，极大地提高了应用的价值和用户体验，推动了人工智能的发展。对于个人网站的开发者而言，接入OpenAI API能够为网站注入更多的智能元素，增强用户体验和网站的实用性，例如自动生成文章、翻译等功能，提高网站访问量和用户黏性。

## 根据需求以及选择适合的Openai API

在初始阶段，尝试一下Openai API，我推荐使用`POST: /chat/completions`这个接口，这个可以尝试Chatgpt的基础聊天功能，而且相对来说文档更清晰。

## 注册Openai API账号，获取API KEY

下一步就是注册Openai API账号，这个步骤网络上有很多教程，最好使用谷歌邮箱+虚拟号的方式注册，不过最近Openai对注册限制的更严格了，许多接号平台的号码都无法接号，读者也可尝试直接购买成品号。

每一个账号下面有5美元的tokens额度，使用完了就得充钱，可以多备几个号。

在个人中心里获取API Key，及时保存这些Key，这些key只会展示一次。

## 使用API KEY接入Openai API的接口

这里有个比较重要的问题，就是Openai无法直接访问，所以需要梯子，但是作者的个人博客部署在了腾讯云国内的服务器上，如果直接搭梯子有被封禁的风险。所以作者另辟蹊径，找到腾讯云还有云函数服务，可以直接访问外网的云函数。所以思路就有了，在云服务器上部署个人网站，在云函数上部署一个代理服务，代理到Openai API。就实现了Openai API直连，

下面实现一个Chatgp API的代理：
```js
const Koa = require("koa");
const proxy = require("koa-better-http-proxy");

const app = new Koa();

app.use(
  proxy("api.openai.com", {
    headers: {
      Authorization: "Bearer sk-xxxxx",// Openai API key
    },
    https: true,
    proxyReqPathResolver(ctx) {
      return `/v1${ctx.url}`;
    },
  })
);

app.listen(9000, () => {
  console.log("腾讯云函数代理API", new Date());
});

```

一个非常简单的代理服务器。将这端代码部署在北美地区，这是腾讯云函数的[文档](https://cloud.tencent.com/document/product/583)，具体的部署步骤可以根据文档进行，这里就不详细介绍了。

测试一下：

![截屏2023-04-24 16.28.22.png](https://26qgecq9acl2hsew.public.blob.vercel-storage.com/15e206857258b25dc86d54e00.28.22-5plzgTDSkXekGp6yYdNf0Q3BDUxPoN.png)

腾讯云函数会生成一个链接，将链接的路径代理到Openai就可以了。

## /chat/completions参数

Chatgpt有很多API可以调用，这里仅展示一下`/chat/completions`。
[官网文档](https://platform.openai.com/docs/api-reference/chat/create)

下面介绍一下必要的参数

**参数**

`model`: **必填**，选择对话的语言模型，支持的模型列表可以查看[链接](https://platform.openai.com/docs/models/model-endpoint-compatibility)，作者在这里使用的模型和文档一致：`gpt-3.5-turbo`。

`messages`: **必填**，对话列表，这里就是openai比较坑的地方了，要想Chatgpt记住上下文，就需要将对话的历史记录都传给Openai API，这会导致tokens消耗的特别快。

举个例子：
> 用户: 前端的发展趋势是什么，
> 
> Chatgpt：前端框架的不断更新：像Angular、React、Vue.js等前端框架不断推陈出新，大大加速了前端开发的速度。
> balbala
>
> 如果用户说：请根据第一条详细说明，Chatgpt这个时候就不知道你在问什么。要想Chatgpt了解上文说的什么，需要将之前的历史记录都发给Chatgpt。

`role`: **必填**，对话的角色，用户对话是user，将gpt的对话标记成assistant，system暂时不知道是什么角色。

`content`: **必填**，就是聊天内容了。

还有一些可以定制化响应的参数。

完整体验版可以去我的网站上体验，[地址](https://xzgz.top/ai)。

