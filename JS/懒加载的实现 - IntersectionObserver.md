# 懒加载的实现 - IntersectionObserver

常见的懒加载的解决方案是在window上添加滚动事件，通过需要观察的元素的offsetTop和容器的scrollTop + clientHeight进行比较，如果offsetTop < scrollTop + clientHeight，则证明元素已经滚动到可视区域。或者是在window上添加滚动事件，在滚动的过程中使用getBoundingClientRect()方法判断被观察的元素top与clientHeight进行比较，如果getBoundingClientRect().top < clientHeight 则证明元素已经滚动到可视区域。但是这两种方法都有一个共同的问题，都需要监听window的滚动事件，这会导致该事件频繁触发造成性能问题。IntersectionObserver比较好的解决了这个问题：

## 使用方法

```javascript
const observer = new InersectionObserver(callback[, options])
observer.observe(Element)
```

### callback

此回调函数接受两个参数：

**entries**

一个IntersectionObserverEntry对象的数组，每个被触发的阈值，都或多或少与指定阈值有偏差。

**observer**

被调用的IntersectionObserver实例。

callback会被两种情况触发：
- 元素不在屏幕上
- 元素出现在屏幕上

所以页面刷新，当被观察的元素不在屏幕上，也会触发回调函数。

### options

**root**

监听元素的祖先元素Element对象，其边界盒将被视作视口。目标在根的可见区域的的任何不可见部分都会被视为不可见。

**rootMargin**

一个在计算交叉值时添加至根的边界盒 (bounding_box (en-US)) 中的一组偏移量，类型为字符串 (string) ，可以有效的缩小或扩大根的判定范围从而满足计算需要。语法大致和 CSS 中的margin 属性等同; 

**threshold**

规定了一个监听目标与边界盒交叉区域的比例值，可以是一个具体的数值或是一组 0.0 到 1.0 之间的数组。若指定值为 0.0，则意味着监听元素即使与根有 1 像素交叉，此元素也会被视为可见。若指定值为 1.0，则意味着整个元素都在可见范围内时才算可见。

详情：
- [MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver/IntersectionObserver)
- [阮一峰阮一峰的网络日志](https://www.ruanyifeng.com/blog/2016/11/intersectionobserver_api.html)


