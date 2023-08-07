# 前言

在此之前我的个人网站的构建部署的方式是通过github webhook进行监听仓库，如果发生push事件，就会触发对应的webhook，通过一个post请求通知在服务器上的专门构建的服务。这个方法有一点问题：

- 就是需要使用screen命令重新启动一个窗口，在这个窗口里面开启服务。不太方便
- 除了通过ssh连接服务器再通过进入到screen里查看，没有一个可以实时查看进度和构建错误报告的方式

在研究github的action板块后发现这是一个非常方便的CI/CD工具，下面介绍一下我是如何利用这个工具来对网站进行构建和部署。

# 相关工具

我主要是用的是：

Docker + Github Action

# 开始
## 第一步：使用docker构建项目
这一步不进行展开了，docker的使用有非常多的教程，随便一搜就有。直接跳过下一步。

## 第二部：action 的使用
如果一个项目想要使用github action可以在项目的根目录下新建`.github/workflows/docker-image.yml` 这样的文件。或者根据github 的提示进行下一步。

docker-image.yml文件里是CI/CD的设置。下面我举一个例子例

```yml
name: Docker Image CI/CD

on:
  push:
    branches: [ "main" ]

env:
  DOCKER_USERNAME: ${{ secrets.DOCKERHUB_USERNAME }}
  DOCKER_PASSWORD: ${{ secrets.DOCKERHUB_TOKEN }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      -
        # 导出代码
        name: Checkout
        uses: actions/checkout@v3
      -
        # 登陆docker
        name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      -
        name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      - 
        name: Get package.json version
        run: echo "version=$(jq -r '.version' package.json)" >> $GITHUB_ENV
      -
        # 构建代码并且发不到Docker Hub
        name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/xzgz:${{ env.version }}
      -
        # 通过SSH部署到服务器
        name: Deploy
        uses: appleboy/ssh-action@master
        with:
          host: xx.xxx.xxx.xxx
          port: 1022
          username: ubuntu
          key: ${{ secrets.SERVER_SSH_PRIVATE_KEY }}
          script: |
            # 停止并删除旧的容器
            docker stop xzgz_c || true
            docker rm xzgz_c || true
            
            # 删除以前的镜像
            docker image rm $(docker image ls -q ${{ secrets.DOCKERHUB_USERNAME }}/xzgz)
  
            # 拉取最新的镜像
            docker pull ${{ secrets.DOCKERHUB_USERNAME }}/xzgz:${{ env.version }}
  
            # 运行新的容器
            docker run -d -p 3000:6001 -u 0:1001 -v /home/ubuntu/static:/FILES --name xzgz_c ${{ secrets.DOCKERHUB_USERNAME }}/xzgz:${{ env.version }}
        
```


