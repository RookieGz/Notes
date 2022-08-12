# Docker 的使用

仅针对 Dockerfile 的使用 docker

## docker 镜像

### 创建镜像

```shell
docker build .
```

当前路径需要有 Dockerfile 文件

如果想为镜像添加名称使用`-t`命令

```shell
docker build -t xzgz_i .
```

### 查找镜像

```shell
docker images
```

查找所有镜像

```shell
docker images -a
```

### 删除镜像

```shell
docker rmi [镜像名称/id]
```

删除所有镜像

```shell
docker rmi $(docker images -a)
```

## docker 容器

### 创建/运行容器

```shell
docker run [镜像名称]
```

可以加一些参数配置

- -i：以交互模式运行容器
- -t：为容器重新分配一个伪输入终端，通常和-i 一起使用
- -d：后台执行容器
- -p：为容器配置容器和系统的端口映射：eg：`-p 3000:443`
- --name：为容器命名

### 查找镜像

```shell
docker ps
```

查找全部镜像

```shell
docker ps -a
```

## 删除镜像

```shell
docker rm [镜像名称/ID]
```

删除所有镜像

```shell
docker rm -f $(docker ps -a)
```

-f：强制删除
