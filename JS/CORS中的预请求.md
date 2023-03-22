在HTTP请求中有两种请求：**简单请求**和**复杂请求。**
# 简单请求
不会触发CORS预检的请求称为简单请求，满足以下所有条件的才会被视为简单请求，基本上我们日常开发只会关注前面两点

1. 使用GET、POST、HEAD其中一种方法
2. 只使用了如下的安全首部字段，不得人为设置其他首部字段	
   - Accept
   - Accept-Language
   - Content-Language
   - Content-Type 仅限以下三种
      - text/plain
      - multipart/form-data
      - application/x-www-form-urlencoded
   - HTML头部header field字段：DPR、Download、Save-Data、Viewport-Width、WIdth
3. 请求中的任意XMLHttpRequestUpload 对象均没有注册任何事件监听器；XMLHttpRequestUpload 对象可以使用 XMLHttpRequest.upload 属性访问
4. 请求中没有使用 ReadableStream 对象
# 复杂请求（预检请求）
当不满足上面简单请求的条件的时候，发出的请求是预检请求。这种请求在请求的时候会在请求之前发送一个`OPTIONS`的请求，以获知服务器是否允许该实际请求。"预检请求“的使用，可以避免跨域请求对服务器的用户数据产生未预期的影响。<br />用之前的文章里的例子，
```javascript
await axios({
  method: "post",
  url: "http://localhost:6600",
  data: form,
  headers: { "Content-Type": "multipart/form-data" },
  withCredentials: true,
  onUploadProgress: (e) =>
    this.config.onProgress(
      (e.loaded + (this.index - 1) * this.lastSize) / this.file.size
    ),
});
}
```
这是个上传`POST`请求，按照上面的说法应该是简单请求，不会有`OPTIONS`请求，但是为了监听上传进度，添加一个`onUploadProgress`方法，这个方法就是在`XMLHttpRequestUpload`对象添加了事件监听，所以这不是一个简单请求。<br />![截屏2023-03-17 15.30.20.png](https://cdn.nlark.com/yuque/0/2023/png/27969312/1679038225572-6feac2f4-920a-497b-b0a4-9e200cf5563b.png#averageHue=%23fcfcfc&clientId=ua4bfc8ba-3a71-4&from=drop&id=u5479323d&name=%E6%88%AA%E5%B1%8F2023-03-17%2015.30.20.png&originHeight=1022&originWidth=2880&originalType=binary&ratio=2&rotation=0&showTitle=false&size=334116&status=done&style=none&taskId=ub065673c-9364-47c1-95a4-c36868d98ca&title=)<br />尽量使用简单请求，以减少预检请求的次数，减轻服务器压力。
