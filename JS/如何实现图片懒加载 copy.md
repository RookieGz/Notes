懒加载是针对图片加载时机的优化，在一些大量使用图片的网站，如果在首屏加载全部的资源会出现首屏白屏的现象，所以现在有一系列的操作来实现首屏优化，路由懒加载，图片懒加载。
懒加载实现目的
懒加载的目的是当页面的图片进入到用户的可是范围之内再加载图片的一种优化方式。

可以层架首屏的加载速度，当用户打开页面的瞬间，呈现出来的只是首屏，只需要把首屏的资源图片加载出来就可以了，至于没有出现再可是区域的图片就可以暂时不用加载，只有当出现在用户的可视范围的时候再加载，这样对于性能的压力也小，可以提高用户体验。

实现  

在页面初始化的时候，
<img>图片的 src 实际上是放在 data-src 属性上的，当元素处于可视范围内的时候，就把 data-src 赋值给 src 属性，完成图片加载。

```javascript
// 在一开始加载的时候
<img data-src="http://xx.com/xx.png" src="" />
// 在进入可视范围内时
<img data-src="http://xx.com/xx.png" src="http://xx.com/xx.png" />
```

<div>使用背景图来实现，原理也是一样的，把background-image放在，在可视范围时，就把data-src赋值给src属性，完成图片加载。

```javascript

// 在一开始加载的时候

<div
  data-src="http://xx.com/xx.png"
  style="background-image: none;background-size: cover;"
></div>

// 在进入可视范围内时

<div
  data-src="http://xx.com/xx.png"
  style="background-image: url(http://xx.com/xx.png);background-size: cover;"
></div>

```

实现一个懒加载
基于上面的原理来实现一个图片懒加载

```js
/**
 *实现思路:
 *浏览器窗口滚动时,如果图片距离视口顶部的距离小于视口的可视高
 *度说明图片已经出现的用户的可视范围内了,这是就要显示正确的图
 *片路径.
 *注意:
 *浏览器的滚动会频繁触发,这里要注意 js 的抖动,以下示例是使用的 js \*的防抖实现的
 **/

let images = document.getElementsByTagName("img");
let currentinnerHeight = window.innerHeight;
let timer = null;
function getsrc() {
  for (let i = 0; i < images.length; i++) {
    const element = images[i];
    if (element.getBoundingClientRect().top < currentinnerHeight) {
      element.src = element.getAttribute("data-src");
    }
  }
}
function aa() {
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(() => {
    getsrc();
  }, 100);
}
window.onscroll = aa;
```

```

```
