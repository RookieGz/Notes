```javascript
function New(...arg){
    // new操作符的作用
    // 新建一个对象
    const obj = {}
    // 创建原型链 
    obj.__proto__ = Class.prototype
    // 改变构造函数的this指向
    const result = arg[0].apply(obj, arg.slice(1))
    // 返回值这个新对象（如果构造函数有返回值则返回，没有返回this）
    return obj
}
```

