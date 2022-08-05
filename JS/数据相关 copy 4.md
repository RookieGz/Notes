1-1. **JS 的数据类型有哪些？**  
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
