`for of` 循环主要是要是会请求对象的迭代器对象，如果没有迭代器对象就会报错，所以这是`for of`不能循环对象的原因。

数组因为内置了这个迭代器所以`for of`可以循环数组。

如果想要`for of`支持循环对象，我们需要手写一个迭代器。

```js
const a ={ name: 'monsoon', age: 30, work: 'fe'}

a[Symbol.iterator] = function () {
  const keys = Object.keys(this)
  let i = 0
  const that = this
  return {
    next() {
      return {
        value: that[keys[i++]],
        done: i > keys.length
      }
    }
  }
}

for(let i of a) {
  console.log(i)
}

// 'monsoon'
// 30
// 'fe'
```