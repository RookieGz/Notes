instanceof，用于类型判断，实际上是在校验某一个类是否在被测试者的原型链上。所以

```javascript
[] instanceof Array // true
[] instanceof Object // true
```

因为 Object 也在[]的原型链上，有一些局限性

手动实现

```javascript
function Instanceof(obj, cal) {
  let l = obj.__proto__;
  const r = cal.prototype;
  for (;;) {
    if (l === r) return true;
    if (l === null) return false;
    l = l.__proto__;
  }
}
```
