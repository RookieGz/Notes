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
由此可以推断出在autorun里完成了依赖收集，实际上autorun做了三件事：
```javascript
function autorun(handler) {
  dependencer.beginCollect(handler);// 开始收集依赖
  handler(); // 触发Observable的get，以便依赖收集
  dependencer.endCollect();// 结束依赖收集
}
```
对于如何将一个对象变成可观察的`Observable`呢？
```javascript
// 循环递归执行new Observable
function _createObservable(_target) {
  if (typeof _target === "object") {
    const _val = Array.isArray(_target) ? [] : {};
    const keys = Object.keys(_target);

    for (let i of keys) {
      const item = _createObservable(_target[i]);
      _val[i] = item;
      Object.defineProperty(_val, i, {
        get() {
          return item.get();
        },
        set(newVal) {
          item.set(_createObservable(newVal).get());
        },
      });
    }

    return new Observable(_val);
  }
  return new Observable(_target);
}

function observable(_target) {
  const target = _createObservable(_target);
  return target.get();
}
```
至此全部Mobx的基本功能完成。
全部代码：
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

let globalObId = 0;
/** 被观察者 */
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

function autorun(handler) {
  dependencer.beginCollect(handler);
  handler(); // 触发Observable的get，以便依赖收集
  dependencer.endCollect();
}

function _createObservable(_target) {
  if (typeof _target === "object") {
    const _val = {};
    const keys = Object.keys(_target);

    for (let i of keys) {
      const item = _createObservable(_target[i]);
      _val[i] = item;
      Object.defineProperty(_val, i, {
        get() {
          return item.get();
        },
        set(newVal) {
          item.set(_createObservable(newVal).get());
        },
      });
    }

    return new Observable(_val);
  }
  return new Observable(_target);
}

function observable(_target) {
  const target = _createObservable(_target);
  return target.get();
}
let test = observable({ a: 1, b: { c: 2 } });
autorun(() => {
  console.log("test-a", test.a);
});
autorun(() => {
  console.log("test-b", test.b.c);
});

test.a = 3;
test.b.c = 4;
```

