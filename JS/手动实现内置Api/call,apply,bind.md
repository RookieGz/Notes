### call

```javascript
Function.prototype.newCall=function(...arg){
	// 获取执行环境
    const context = arg[0] || window
    context.fn = this
    // 借用隐式绑定
    const result = context.fn(...arg.slice(1))
    // 删除中间属性
    delete context.fn
    // 返回执行结果
    return result
}
```

### apply

```javascript
Function.prototype.newApply=function(...arg){
    // 与call相似，只有传参不同
    const context = arg[0] || window
    context.fn = this
    const result = context.fn(...arg[1])
    delete context.fn
    return result
}
```

### bind

```javascript
Function.prototype.newBind=function(...arg){
    const context = arg[0] || window
    const fn = this
    // 支持柯里化
    return (...ar)=>fn.apply(context, arg.concat(ar))
}
```

