在css中的定位`position: absolute`可以让元素绝对定位。
> **absolute**
> 元素会被移出正常文档流，并不为元素预留空间，通过指定元素相对于最近的非 static 定位祖先元素的偏移，来确定元素位置。绝对定位的元素可以设置外边距（margins），且不会与其他边距合并。
> **fixed**
> 元素会被移出正常文档流，并不为元素预留空间，而是通过指定元素相对于屏幕视口（viewport）的位置来指定元素位置。元素的位置在屏幕滚动时不会改变。打印时，元素会出现在的每页的固定位置。fixed 属性会创建新的层叠上下文。当元素祖先的 transform、perspective、filter 或 backdrop-filter 属性非 none 时，容器由视口改为该祖先。

写一个测试用例：
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <style>
    .parent {
      width: 500px;
      height: 500px;
      border: 50px solid #000;
      padding: 50px;
      margin: 50px;
      background-color: blue;
      position: relative;
    }

    .child {
      width: 300px;
      height: 300px;
      border: 50px solid #000;
      padding: 50px;
      margin: 50px;
      background-color: red;
      position: absolute;
      top: 20px;
      left: 20px;
    }

    .grandchild {
      width: 100px;
      height: 100px;
      border: 50px solid #000;
      padding: 50px;
      margin: 50px;
      background-color: yellow;
      position: absolute;
      top: 20px;
      left: 20px;
    }
  </style>
  <body>
    <div class="parent">
      <div class="child">
        <div class="grandchild"></div>
      </div>
    </div>
  </body>
</html>
```
可以看到浏览器里显示<br />![截屏2023-03-21 14.43.09.png](https://cdn.nlark.com/yuque/0/2023/png/27969312/1679380995325-831ffc27-8260-405f-85c0-4307cb80bda4.png#averageHue=%23f17a34&clientId=u0466cce3-0a21-4&from=drop&id=ud0185a16&name=%E6%88%AA%E5%B1%8F2023-03-21%2014.43.09.png&originHeight=920&originWidth=1660&originalType=binary&ratio=2&rotation=0&showTitle=false&size=56677&status=done&style=none&taskId=u37122f79-dd78-4575-ae02-f1a76ce4c5f&title=)<br />可以看到**父元素的的定位原点在border的范围内，子元素的定位原点在margin的最外面。**<br />那么父元素的定位原点和`box-sizing`有关系吗？<br />验证一下：
```css
.parent {
  width: 500px;
  height: 500px;
  border: 50px solid #000;
  padding: 50px;
  margin: 50px;
  background-color: blue;
  position: relative;
  box-sizing: border-content;
}
```
会发现定位没有变化：<br />![截屏2023-03-21 14.52.15.png](https://cdn.nlark.com/yuque/0/2023/png/27969312/1679381540503-a371d3d4-348c-42d6-b161-2e93e8f5bea9.png#averageHue=%238c6f5f&clientId=u0466cce3-0a21-4&from=drop&id=u2a84b802&name=%E6%88%AA%E5%B1%8F2023-03-21%2014.52.15.png&originHeight=886&originWidth=1470&originalType=binary&ratio=2&rotation=0&showTitle=false&size=46100&status=done&style=none&taskId=ua73c330c-3368-4c1f-ada5-8a81acdebb1&title=)
