# 1. 数据类型相关

**1-1. JS 的数据类型有哪些？**  
基础数据类型

> number 数字类型  
> string 字符类型  
> boolean 布尔类型  
> null  
> undefined  
> symbol  
> bigInt

引用数据类型

> object

1-2. **基础数据类型和引用数据类型有什么区别**？

> - 基础数据类型的声明存储在栈（stack）中的简单数据段，也就是说，它们的值直接存储在变量访问的位置。  
>   这是因为这些原始类型占据的空间是固定的，所以可将他们存储在较小的内存区域 – 栈中。这样存储便于迅速查寻变量的值。
> - 存储在堆（heap）中的对象，也就是说，存储在变量处的值是一个指针（point），指向存储对象的内存地址。  
>   这是因为：引用值的大小会改变，所以不能把它放在栈中，否则会降低变量查寻的速度。相反，放在变量的栈空间中的值是该对象存储在堆中的地址。

1-3. **null 和 undefined 的区别**

> null 指的是一个空对象  
> undefined 指的是没有定义

1-4. **如何判断数据类型**

> 1. **typeof**  
>    只可以判断基础数据类型，所有引用数据类型返回的都是 object
> 2. instanceof  
>    利用 instanceof 来判断 A 是否为 B 的实例，表达为 A instanceof B，返回一个布尔值。instanceof 的原理是通过检测对象的原型链上是否含有类型的原型。
> 3. constructor  
>    判断构造函数是否相等，这种方法也有局限性 undefined， null 识别不出来，而且如果 undefined 或 null 会报错。
> 4. Object.prototype.toString.call()

1-5. **如何解决引用数据类型的 copy 问题（深拷贝）**

```javascript
function getType(obj) {
  var str = Object.prototype.toString.call(obj);
  var map = {
    "[object Boolean]": "boolean",
    "[object Number]": "number",
    "[object String]": "string",
    "[object Function]": "function",
    "[object Array]": "array",
    "[object Date]": "date",
    "[object RegExp]": "regExp",
    "[object Undefined]": "undefined",
    "[object Null]": "null",
    "[object Object]": "object",
  };
  // if(obj instanceof Element){ //判断是否是dom元素，如div等
  //  return "element";
  // }
  return map[str];
}

function deepCopy(p) {
  var obj;
  var str = getType(p);
  if (str == "array") {
    obj = [];
    for (var i = 0; i < p.length; i++) {
      obj.push(deepCopy(p[i])); //回调自己
    }
  } else if (str == "object") {
    obj = {};
    // 会遍历原型上的属性，方法
    for (var i in p) {
      obj[i] = deepCopy(p[i]);
    }
  } else if (str === "function") {
    obj = eval(`(${p.toString()})`);
  } else {
    return p;
  }
  return obj;
}

export default deepCopy;
```

# 2. 为什么 JS 计算会出现精度问题

> 因为在 JS 当中表示数字的方法是双精度浮点型，浮点数的运算精度丢失问题就是因为，浮点数转化为该标准的二进制的过程中出现的丢失。[详细说明](https://www.cnblogs.com/zm-blogs/p/12909096.html)

解决办法

> 转成整数进行计算  
> 使用第三方库 math

# 3. this 指的是什么

> **什么是 this？**
> this 实际上是在函数被调用时发生的绑定，它指向什么完全取决于函数在哪里被调用。
> **this 绑定方式**
>
> - 默认绑定
> - 隐示绑定
> - 显示绑定
> - new 绑定
>
> **绑定优先级：**
> new 绑定>显示绑定>隐式绑定>默认绑定
>
> 1. 函数是否在 new 中调用（new 绑定）？  
>    如果是的话 > this 绑定的是新创建的对象
> 2. 函数是否通过 call、apply（显式绑定）或者硬绑定调用？  
>    如果是的话，this 绑定的是 指定的对象。
> 3. 函数是否在某个上下文对象中调用（隐式绑定）？  
>    如果是的话，this 绑定的是那个上 下文对象。
> 4. 如果都不是的话，使用默认绑定。如果在严格模式下，就绑定到 undefined，否则绑定到 全局对象。
>
> **箭头函数的 this**  
> 箭头函数执行时的上下文
>
> **特殊情况（出自《你不知道的 Javascript》）**

> 如果你把 null 或者 undefined 作为 this 的绑定对象传入 call、apply 或者 bind，这些值在调用时会被忽略，实际应用的是默认绑定规则

# 4. 作用域相关

4-1. **什么是作用域**

> 作用域分为全局作用域和局部作用域  
> 变量或函数的上下文决定 了它们可以访问哪些数据。

4-2. **如何访问其他作用域的变量（闭包）**

> 闭包指的是那些引用了另一个函数作用域中变量的函数，> 通常是在嵌套函数中实现的。  
> 4-3. 闭包会带来哪些问题  
> 内存泄漏
>
> **为什么？**  
> 由于 IE 在 IE9 之前对 JScript 对象和 COM 对象使用了不同的垃圾回收机制，所以 闭包在这些旧版本 IE 中可能会导致问题。
>
> - 在 IE 浏览器中，由于 BOM 和 DOM 中的对象是使用 C++以 COM 对象的方式实现的，而 COM 对象的垃圾收集机制采用的是引用计数策略。在基于引用计数策略的垃圾回收机制中，如果两个对象之间形成了循环引用，那么这两个对象都无法被回收，但循环引用造成的内存泄露在本质上也不是闭包造成的。

> **什么是内存泄漏？**  
>  内存泄漏是指程序中己动态分配的堆内存由于某种原因程序未释放或无法释放，造成系统内存的浪费，导致程序运行速度减慢甚至系统崩溃等严重后果。

> 用 JS 的话来说：内存泄露是指你用不到（访问不到）的变量，依然占居着内存空间，不能被再次利用起来。

# 5. new 操作符做了什么

> 1. 创建一个新对象
> 2. 将该对象添加一个名为**proto**的新属性，并且指向构造函数的原型(prototype)；
> 3. 将 this 绑定到该对象
> 4. 构造函数如果有返回值，返回，如果没有返回该对象（返回 this）。

# 6. Even loop

6-1. JS 的时间循环机制  
[链接](https://www.cnblogs.com/cangqinglang/p/8967268.html)

6-2. 浏览器和 node 的时间循环有什么区别  
[链接](https://www.cnblogs.com/cangqinglang/p/8967268.html)

# 7. ES\*

7-1. ES6

> class  
> 模块化  
> 箭头函数  
> 函数参数默认值  
> 模板字符串  
> 解构赋值  
> 延展操作符（...）  
> 对象属性简写  
> Promise  
> let 和 const

7-2. ES7

> Array.prototype.includes()  
> 指数操作符

7-2. ES8

> async/await  
> Object.values()  
> Object.entries()  
> String.prototype.padStart() / padEnd()  
> Object.getOwnPropertyDescriptors()  
> SharedArrayBuffer 对象  
> Atomics 对象

7-3. ES9

> Promise.finally()

7-4 ES10

> Array.flat()和 Array.flatMap()  
> String.trimStart()和 String.trimEnd()  
> String.prototype.matchAll

[链接](https://segmentfault.com/a/1190000039272641)

# 8. 垃圾回收机制

[链接](https://segmentfault.com/a/1190000018605776)

# 9. 浏览器储存

cookie、sessionStorage、localStorage

> **生命周期**：
> cookie：可设置失效时间，没有设置的话，默认是关闭浏览器后失效
> localStorage：除非被手动清除，否则将会永久保存。
> sessionStorage： 仅在当前网页会话下有效，关闭页面或浏览器后就会被清除。

> **存放数据大小**：
> cookie：4KB 左右
> localStorage 和 sessionStorage：可以保存 5MB 的信息。

> **http 请求**：
> cookie：每次都会携带在 HTTP 头中，如果使用 cookie 保存过多数据会带来性能问题
> localStorage 和 sessionStorage：仅在客户端（即浏览器）中保存，不参与和服务器的通信

> 易用性：
> cookie：需要程序员自己封装，源生的 Cookie 接口不友好
> localStorage 和 sessionStorage：源生接口可以接受，亦可再次封装来对 Object 和 Array 有更好的支持

> **应用场景**：
> 从安全性来说，因为每次 http 请求都会携带 cookie 信息，这样无形中浪费了带宽，所以 cookie 应该尽可能少的使用，另外 cookie 还需要指定作用域，不可以跨域调用，限制比较多。但是用来识别用户登录来说，cookie 还是比 stprage 更好用的。其他情况下，可以使用 storage，就用 storage。
> storage 在存储数据的大小上面秒杀了 cookie，现在基本上很少使用 cookie 了，因为更大总是更好的，哈哈哈你们懂得。
> localStorage 和 sessionStorage 唯一的差别一个是永久保存在浏览器里面，一个是关闭网页就清除了信息。localStorage 可以用来夸页面传递参数，sessionStorage 用来保存一些临时的数据，防止用户刷新页面之后丢失了一些参数。

> **浏览器支持情况**：
> localStorage 和 sessionStorage 是 html5 才应用的新特性，可能有些浏览器并不支持，这里要注意。

# 
