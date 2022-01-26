## 启动 nginx

```sh
nginx -c <配置文件地址>
```

## 停止 nginx

```sh
nginx -s stop
```

## 重启 nginx

```sh
nginx -s reload
```

## 配置单页应用

当配置 try_files 找不到某个页面资源，这时，nginx 会尝试加载 index.html，加载 index.html 之后，react-router 就能起作用并匹配我们输入的/home 路由，从而显示正确的 home 页面。

```sh
server {
  location / {
    try_file $uri $uri/ /index.html
  }
}
```
