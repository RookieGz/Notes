React的框架是基于虚拟节点（以下为：vdom）的框架，render生成vdom，然后通过虚拟节点把vnode渲染出来；

在state或props更新的时候，组件render会更新生成新的vdom，React通过diff算法比较两次的额vdom，尽量的复用节点，提高性能。

# fiber算法

在React16版本之前，是递归一层一层的渲染vdom，对差异的节点进行更新节点的操作。

在React16以后，为了优化性能，将vdom转化成fiber，将节点树转化成链表。再进行渲染。
