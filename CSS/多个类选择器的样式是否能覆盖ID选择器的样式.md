# 多个类选择器的样式是否能覆盖ID选择器的样式

先来看一看各个选择器的权重

权重的五个等级及其权重

- !important;
- 行内样式;
- ID选择器, 权重:100;
- class,属性选择器和伪类选择器，权重:10;
- 标签选择器和伪元素选择器，权重:1;

等级关系:
> !important>行内样式>ID选择器 > 类选择器 | 属性选择器 | 伪类选择器 > 元素选择器

## 如果有很多个类选择器是否能覆盖id选择器

不能覆盖，但是在低版本浏览器里是会被覆盖的。

具体的解释原因参照张鑫旭的文章：[有趣：256个class选择器可以干掉1个id选择器](https://www.zhangxinxu.com/wordpress/2012/08/256-class-selector-beat-id-selector/)里面有测试链接可以在IE低版本浏览器里打开。（mac推荐IE Tab）

在最新的Chrome、Firefox等现代浏览器不会出现这种问题。

我的理解：

**上面的权重不是具体的数字，而是位数，相同选择器的权重相加并不会造成数位升级，比如256个class选择的相加只在10这一位上相加，始终不会比id选择器100大。**
