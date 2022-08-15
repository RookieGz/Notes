**React 是一个用于构建用户界面的 JavaScript 库。**其核心在于跟踪组件状态变化并将更新状态投影到屏幕的机制。

React的框架是基于虚拟节点（以下为：vdom）的框架，render生成vdom，然后通过虚拟节点把vnode渲染出来；

在state或props更新的时候，组件render会更新生成新的vdom，React通过diff算法比较两次的额vdom，尽量的复用节点，提高性能。

- 在React16版本之前，是递归一层一层的渲染vdom，对差异的节点进行更新节点的操作。
- 在React16以后，为了优化性能，将vdom转化成fiber，将节点树转化成链表。再进行渲染。

React主要分为分为调度阶段和渲染阶段。以前的stack调度器一旦开始就无法停下来。
fiber的主要作用是更新了React的调度器。使得渲染过程可以：

- 暂停工作，稍后再回来。
- 为不同类型的工作分配优先级。
- 重用以前完成的工作。
- 如果不再需要，则中止工作。

在处理 UI 时，问题是如果一次执行过多的工作，可能会导致动画掉帧并且看起来不连贯。更重要的是，如果这些工作被更新的更新所取代，其中一些工作可能是不必要的。这是 UI 组件和函数之间的比较失败的地方，因为组件比一般的函数具有更具体的关注点。

## JS运行执行栈
在JS中，调用函数就会把函数放进执行栈中等待执行，并且一旦执行，就不能停止。直到执行栈被清空。React16以前的渲染就是使用原生的调用栈递归执行的，一旦开始就不能停止，如果渲染的层级较深，就会造成页面的卡顿，使得画面不流畅。
## fiber：可控的执行栈

理想的执行栈是将繁重的更新任务拆分成一个个小的工作单元，做完一个小的工作单元之后可以先去执行更高优先度的任务，比如动画的渲染。fiber就是实现了一个堆栈帧的调度，这个堆栈帧可以按照自己的调度算法执行他们。另外由于这些堆栈是可将可中断的任务拆分成多个子任务，通过按照优先级来自由调度子任务，分段更新，从而将之前的同步渲染改为异步渲染。

## fiber结构
fiber是一种数据结构，react中的每一个元素对应一个fiber节点。最后会生成一个faber树。每个fiber不仅仅包含每个元素的信息，还包含更多的信息，以方便Scheduler来进行调度。

结构：


![image](https://user-images.githubusercontent.com/45303288/184624399-0d7cccee-8b05-44cd-b501-3be506a9e560.png)

```typescript
type Fiber = {|
  // 标记不同的组件类型
  //export const FunctionComponent = 0;
  //export const ClassComponent = 1;
  //export const HostRoot = 3； 可以理解为这个fiber是fiber树的根节点，根节点可以嵌套在子树中
  //export const Fragment = 7;
  //export const SuspenseComponent = 13;
  //export const MemoComponent = 14;
  //export const LazyComponent = 16;
  tag: WorkTag,

  // ReactElement里面的key
  // 唯一标示。我们在写React的时候如果出现列表式的时候，需要制定key，这key就是对应元素的key。
  key: null | string,

  // ReactElement.type，也就是我们调用`createElement`的第一个参数
  elementType: any,

  // The resolved function/class/ associated with this fiber.
  // 异步组件resolved之后返回的内容，一般是`function`或者`class`
  type: any,

  // The local state associated with this fiber.
  // 跟当前Fiber相关本地状态（比如浏览器环境就是DOM节点）
  // 当前组件实例的引用
  stateNode: any,

  // 指向他在Fiber节点树中的`parent`，用来在处理完这个节点之后向上返回
  return: Fiber | null,

  // 单链表树结构
  // 指向自己的第一个子节点
  child: Fiber | null,
  // 指向自己的兄弟结构
  // 兄弟节点的return指向同一个父节点
  sibling: Fiber | null,
  index: number,

  // ref属性
  ref: null | (((handle: mixed) => void) & {_stringRef: ?string}) | RefObject,

  // 新的变动带来的新的props
  pendingProps: any, 
  // 上一次渲染完成之后的props
  memoizedProps: any,

  // 该Fiber对应的组件产生的Update会存放在这个队列里面
  updateQueue: UpdateQueue<any> | null,

  // 上一次渲染的时候的state
  // 用来存放某个组件内所有的 Hook 状态
  memoizedState: any,

  // 一个列表，存放这个Fiber依赖的context
  firstContextDependency: ContextDependency<mixed> | null,

  // 用来描述当前Fiber和他子树的`Bitfield`
  // 共存的模式表示这个子树是否默认是异步渲染的
  // Fiber被创建的时候他会继承父Fiber
  // 其他的标识也可以在创建的时候被设置
  // 但是在创建之后不应该再被修改，特别是他的子Fiber创建之前
  //用来描述fiber是处于何种模式。用二进制位来表示（bitfield），后面通过与来看两者是否相同//这个字段其实是一个数字.实现定义了一下四种//NoContext: 0b000->0//AsyncMode: 0b001->1//StrictMode: 0b010->2//ProfileMode: 0b100->4
  mode: TypeOfMode,

  // Effect
  // 用来记录Side Effect具体的执行的工作的类型：比如Placement，Update等等
  effectTag: SideEffectTag,

  // 单链表用来快速查找下一个side effect
  nextEffect: Fiber | null,

  // 子树中第一个side effect
  firstEffect: Fiber | null,
  // 子树中最后一个side effect
  lastEffect: Fiber | null,

  // 代表任务在未来的哪个时间点应该被完成
  // 不包括他的子树产生的任务
  // 通过这个参数也可以知道是否还有等待暂停的变更、没有完成变更。
  // 这个参数一般是UpdateQueue中最长过期时间的Update相同，如果有Update的话。
  expirationTime: ExpirationTime,

  // 快速确定子树中是否有不在等待的变化
  childExpirationTime: ExpirationTime,

  //当前fiber对应的工作中的Fiber。
  // 在Fiber树更新的过程中，每个Fiber都会有一个跟其对应的Fiber
  // 我们称他为 current <==> workInProgress
  // 在渲染完成之后他们会交换位置
  alternate: Fiber | null,
  ...
|};
```
fiber中最为重要的是return、child、sibling指针，连接父子兄弟节点以构成一颗单链表fiber树，其扁平化的单链表结构的特点将以往递归遍历改为了循环遍历，实现深度优先遍历。

## fiber是如何分段执行的

那么Fiber是如何做到异步实现不同优先级任务的协调执行的

这里要介绍介绍浏览器提供的两个API：[requestIdleCallback](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback)和[requestAnimationFrame](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestAnimationFrame):
但是Safari浏览器不支持`requestIdleCallback`，使用的是setTimeout代替：
```js
if (typeof window !== 'undefined') {
  global.requestIdleCallback = function(callback) {
    return setTimeout(() => {
      callback({
        timeRemaining() {
          return Infinity;
        },
      });
    });
  };

  global.cancelIdleCallback = function(callbackID) {
    clearTimeout(callbackID);
  };
}
```




