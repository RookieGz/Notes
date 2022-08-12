# 性能呢优化：利用 link 标签实现预解析或加载

主要使用的是 link 标签 rel 属性实现 dns 或者链接的预加载。

先来介绍一下 link 标签的作用：

> HTML 外部资源链接元素 (<link>) 规定了当前文档与外部资源的关系。

比较常见的比如加载一个外部样式文件

```html
<link href="style.css" rel="stylesheet" />
```

还可以指定[可替换的样式表](https://developer.mozilla.org/en-US/docs/Web/CSS/Alternative_style_sheets)

```html
<link href="default.css" rel="stylesheet" title="Default Style" />
<link href="fancy.css" rel="alternate stylesheet" title="Fancy" />
<link href="basic.css" rel="alternate stylesheet" title="Basic" />
```

等等其他的内容，查看[MDN 相关页面](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/link)  
下面主要介绍 link 标签的 rel 属性

## prefetch

提示浏览器提前加载链接的资源，因为它可能会被用户请求。
告诉浏览器在空闲时才开始加载资源。

```html
<link rel="prefetch" href="/prefetch.css?t=1000" as="style" />
<link rel="prefetch" href="/prefetch.js?t=1000" as="script" />
```

## preload

告诉浏览器下载资源，因为在当前导航期间稍后将需要该资源。
告诉浏览器立即加载资源

```html
<link rel="preload" href="/style.css?t=2000" as="style" />
<link rel="preload" href="/main.js?t=2000" as="script" />
```
