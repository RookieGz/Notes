# Nginx 的使用

## Nginx命令
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

## Nginx配置ssl
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
