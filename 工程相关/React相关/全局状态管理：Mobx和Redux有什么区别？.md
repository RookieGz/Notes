React的全局状态管理方案常见的有Mobx和Redux，他们两者的区别是很大的，下面来讨论一下。

# Redux
## Redux是什么

Redux 是一个使用叫做“action”的事件来管理和更新应用状态的模式和工具库 它以集中式Store（centralized store）的方式对整个应用中使用的状态进行集中管理，其规则确保状态只能以可预测的方式更新。

### Redux的设计思想
1. **单一数据源**，应用程序的全局状态作为对象存储在单个 store 中。任何给定的数据片段都应仅存在于一个位置，而不是在许多位置重复。
2. **State 是只读的**，更改状态的唯一方法是 dispatch 一个 action，这是一个描述所发生情况的对象。这样，UI 就不会意外覆盖数据，并且更容易跟踪发生状态更新的原因。由于 actions 是普通的 JS 对象，因此可以记录、序列化、存储这些操作，并在以后重放这些操作以进行调试或测试。
3. **reducer是纯函数**，若要指定如何基于 action 更新状态树，请编写 reducer 函数。Reducers 是纯函数，它们采用旧 state 和 action，并返回新 state。

## Redux的概念
- **state**：State (也称为 state tree) 是一个宽泛的概念，但是在 Redux API 中，通常是指一个唯一的 state 值，由 store 管理且由 getState() 方法获得。它表示了 Redux 应用的全部状态，通常为一个多层嵌套的对象。约定俗成，顶层 state 或为一个对象，或像 Map 那样的键-值集合，也可以是任意的数据类型。然而你应尽可能确保 state 可以被序列化，而且不要把什么数据都放进去，导致无法轻松地把 state 转换成 JSON。  
- **action**：Action 是一个普通对象，用来表示即将改变 state 的意图。它是将数据放入 store 的唯一途径。无论是从 UI 事件、网络回调，还是其他诸如 WebSocket 之类的数据源所获得的数据，最终都会被 dispatch 成 action。  
- **Reducer**：Reducer函数接受两个参数：之前累积运算的结果和当前被累积的值，返回的是一个新的累积结果。该函数把一个集合归并成一个单值。在 Redux 中，累计运算的结果是 state 对象，而被累积的值是 action。Reducer 由上次累积的结果 state 与当前被累积的 action 计算得到一个新 state。这些 Reducer 必须是纯函数，而且当输入相同时返回的结果也会相同。它们不应该产生任何副作用。  
- **dispatch**：dispatch 函数是一个接收 action 或者异步 action的函数，用于将action和reducer联系起来。  
- **Middleware**：Middleware 是一个组合 dispatch 函数 的高阶函数，返回一个新的 dispatch 函数，通常将异步 action 转换成 action。  
## Redux的注意事项
### Reducer为什么不能是异步函数
因为Reducer被设计成纯函数，纯函数的概念就是不能修改传入的参数，不能出现副作用（比如调用API，实现路由跳转），相同的输入有相同的输出。如果改成异步函数，那么返回的结果不能预测。
同时源码里也描述了为什么不能用异步操作，因为reducer都是通过dispatch传入action触发的，所以查看dispatch的源码
```javascript
function Dispatch(action) {
  try {
    currentState = currentReducer(currentState, action)// 这里是直接赋值，如果是Promise函数返回的就是Promise<pending>，不是state
  }
  
  ... // 触发listener
}
```
### Reducer不能是异步函数，那么redux如何使用异步函数修改state
使用redux-thunk，redux-promise等异步处理插件，可以就可以在dispatch函数中直接执行api请求等异步操作了。
### 对于过大的Sate如何处理
`replaceReducer`函数使用新的 root reducer 替代当前活动的 root reducer。调用该函数将替换内部 reducer 的引用，并 dispatch 一个 action 以初始化新加入的 reducer，[详细使用情况](https://cn.redux.js.org/usage/code-splitting)

# Mobx
## Mobx是什么
简单，可扩展的状态管理

## Mobx的设计思想
将一个数据变成可观察的，根据这个数据的变化做出相应的反应（操作）。
## Mobx的概念
- **Observable state**，属性，完整的对象，数组，Maps 和 Sets 都可以被转化为可观察对象。
- **Actions**，所有的应用程序都有 actions。action 就是任意一段修改 state 的代码。原则上，actions 总会为了对一个事件做出响应而发生。例如，点击了一个按钮，一些输入被改变了，一个 websocket 消息被送达了，等等。尽管如此，MobX 还是提供了 actions 这个可选的内置概念。 如果你现在就想要了解如何编写 actions，请阅读 Actions 章节。很简单！ 使用 actions 是有优势的: 它们可以帮助你把代码组织的更好，还能在状态何时何地应该被修改这个问题上帮助你做出明智的决定。
- **Computeds**，派生，计算值可以用来从其他可观察对象中派生信息。 计算值采用惰性求值，会缓存其输出，并且只有当其依赖的可观察对象被改变时才会重新计算。 它们在不被任何值观察时会被暂时停用。
- **autorun**，autorun 函数接受一个函数作为参数，每当该函数所观察的值发生变化时，它都应该运行。 当你自己创建 autorun 时，它也会运行一次。它仅仅对可观察状态的变化做出响应，比如那些你用 observable 或者 computed 注释的。
## Mobx的注意事项
### 自动创建可观察的对象
`makeObservable`和`makeAutoObservable`,  
makeAutoObservable的操作：
- 所有 自有 属性都成为 observable。
- 所有 getters 都成为 computed。
- 所有 setters 都成为 action。
- 所有 prototype 中的 functions 都成为 autoAction。
- 所有 prototype 中的 generator functions 都成为 flow。（需要注意，generators 函数在某些编译器配置中无法被检测到，如果 flow 没有正常运行，请务必明确地指定 flow 注解。）
- 在 overrides 参数中标记为 false 的成员将不会被添加注解。例如，将其用于像标识符这样的只读字段。

# Mobx和Redux的区别
- **函数式和面向对象**，Redux更多的是遵循函数式编程（Functional Programming, FP）思想，而Mobx则更多从面相对象角度考虑问题。
- **单一store和多store**，store是应用管理数据的地方，在Redux应用中，我们总是将所有共享的应用数据集中在一个大的store中，而Mobx则通常按模块将应用状态划分，在多个独立的store中管理。
- **JavaScript对象和可观察对象**，Redux默认以JavaScript原生对象形式存储数据，而Mobx使用可观察对象，我们不能直接操作状态对象，而总是在原来状态对象基础上返回一个新的状态对象，这样就能很方便的返回应用上一状态；而Mobx中可以直接使用新值更新状态对象。





