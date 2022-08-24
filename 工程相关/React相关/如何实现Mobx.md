# Mobx

Mobx是一个非常流行的状态管理的库，Mobx也可以不完全依赖React运行。如何实现一个简单的Mobx，mobx的有两个核心的功能：
- `observable`：将普通对象变成可观察的对象，针对对象的操作执行方法。
- `autorun`：针对`observable`的变化，会执行此函数，并会完成自动依赖收集。

## 如何让一个对象变成可观察的对象（observable）
写一个类似观察者模式的类，在此之前需要完成一个全局ID与对应依赖的类，用于保存被观察的值和相关依赖的映射：

```javascript
/** 依赖管理 */
class DependenceManager {
  static Dep = null; // 存放依赖
  _store = {}; // 存放obid和依赖操作的映射关系

  beginCollect(handler) {
    DependenceManager.Dep = handler;
  }
  collect(obid) {
    if (DependenceManager.Dep) {
      this._store[obid] = this._store[obid] || [];
      this._store[obid].push(DependenceManager.Dep);
    }
  }
  endCollect() {
    DependenceManager.Dep = null;
  }

  tigger(obid) {
    if (this._store[obid]) {
      this._store[obid].forEach((watcher) => {
        watcher();
      });
    }
  }
}

const dependencer = new DependenceManager();
```
下面完成一个被观察者的类
```javascript
let globalObId = 0;
class Observable {
  /** 全局Observable唯一ID */
  _obId = 0;
  /** 被观察的值 */
  _val = null;
  constructor(val) {
    this._obId = globalObId++;
    this._val = val;
  }

  set(newVal) {
    this._val = newVal;
    // 在赋值的时候触发依赖
    dependencer.tigger(this._obId);
  }

  get() {
    // 在取值的时候收集依赖
    dependencer.collect(this._obId);
    return this._val;
  }
}
```
## 如何完成依赖的收集（autorun）
autorun在运行的时候将依赖函数传进去
```javascript
autorun(() => {
  console.log(test.b)
})
```
由此可以推断出在autorun里完成了依赖收集，实际上autorun

