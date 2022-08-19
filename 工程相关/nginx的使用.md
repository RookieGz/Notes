# Nginx
Nginx（发音同「engine X」）是异步框架的網頁伺服器，也可以用作反向代理、负载平衡器和HTTP缓存。

# Nginx 的使用

## Nginx 命令

```nginx
nginx # 开启
nginx -s reload # 重启
nginx -s stop # 停止
nginx -t # 查看nginx命令配置是否正确，并会显示正在使用的配置文件
```

## 如何使用 Nginx 配置静态文件服务器

```nginx
server {
  ...
  location /FILES/ {
    # 文件根目录
    root /root/file_store;# 和上面连在一起/root/file_store/FILES/
    autoindex on;# 开启目录浏览
    autoindex_exact_size off;# off，已可读的方式限制文件大小，mb，g
  }
}
```

## 如何使用 Nginx 实现反向代理

在本地服务里配置

```nginx
server {
  ...
  location /api/ {
    rewrite ^.+api/?(.*)$ /$1 break;
    proxy_pass http://localhost:1894# 任意地址
  }
}
```

## Nginx 配置 ssl

```nginx
server {
  listen 443 ssl;
  server_name xzgz.top;

  ssl_certificate /root/xxx/xxx.pem;
  ssl_certificate_key /root/xxx/xxx.key;
  ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
  ssl_ciphers ECDHE-RSA-AES128-GCM-SMA256:HIGH:!aNull:!MD5:!RC4:!DHE;
}
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
