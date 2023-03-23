在使用React进行开发的时候，组件之间的通信是避不开的问题。一般来说，react的信息传递是单向的，只能由父元素传递给子元素。但是不同分支的组件也有要通信的需求，下面就总结一些React中组件之间传递信息的方法。
# Props
最常见的信息传递的方法，仅用于父子间传递信息：<br />**父组件 => 子组件**
```javascript
function Parent() {
  return (
    <div>
      <div>This is parent component.</div>
      <Child message="Hello" />
    </div>
  );
}

function Child({ message }) {
  return (
    <div>
      <div>This is child component.</div>
      <div>This message from Parent component: {message}</div>
    </div>
  );
}
```
**子组件 => 父组件**
```javascript
function Parent() {
  const [message, setMessage] = useState("");

  return (
    <div>
      <div>This is Parent component.</div>
      <div>This message from Child component: {message}</div>
      <Child send={setMessage} />
    </div>
  );
}

function Child({ send }) {
  return (
    <div>
      <div>This is Child component.</div>
      <button onClick={() => send("hello")}>Send</button>
    </div>
  );
}
```
通过向子组件传递方法，子组件执行方法将信息传递给父组件。<br />**兄弟组件之间传值**
```javascript
function Parent() {
  const [message, setMessage] = useState("");

  return (
    <div>
      <div>This is Parent component.</div>
      <Child1 send={setMessage} />
      <Child2 message={message} />
    </div>
  );
}

function Child2({ message }) {
  return (
    <div>
      <div>This is child component.</div>
      <div>This message from Parent component: {message}</div>
    </div>
  );
}

function Child1({ send }) {
  return (
    <div>
      <div>This is Child component.</div>
      <button onClick={() => send("hello")}>Send</button>
    </div>
  );
}
```
这种方法就是上面两种方案的结合，就可以达到兄弟组件之间的传值。
# Context
context是react提供的一种跨组件传递信息的方法。
```javascript
const Context = createContext();

function Parent() {
  const [num, setNum] = useState(0);

  return (
    <Context.Provider value={{ num, setNum }}>
      <div>
        <div>This is Parent component.</div>
        <Child />
      </div>
    </Context.Provider>
  );
}

function Child() {
  return (
    <div>
      <div>This is Child1 component.</div>
      <Context.Consumer>
        {(data) => (
          <div>
            message: {data.num}{" "}
            <button onClick={() => data.setNum(data.num + 1)}>+</button>
          </div>
        )}
      </Context.Consumer>
    </div>
  );
}

```
只是一种很重要的传递方法，redux、mobx-react等成熟的第三方状态管理工具都会用到Context，react18之后完全拥抱Hooks，使用`useContext`hook使用context。
```javascript
// ...

function Child() {
  const context = useContext(Context);

  return (
    <div>
      <div>This is Child1 component.</div>
      <div>
        message: {context.num}{" "}
        <button onClick={() => context.setNum(context.num + 1)}>+</button>
      </div>
    </div>
  );
}
```
# EventBus
总线模式（eventBus）就是简单版的发布订阅模式。通过订阅事件，向订阅者发布消息。
```javascript
class EventBus {
  events = {};

  on(key, handle) {
    if (!this.events[key]) {
      this.events[key] = [];
    }
    this.events[key].push(handle);
  }

  off(key, handle) {
    this.events[key] = this.events[key].filter((han) => han !== handle);
  }

  emit(key, ...args) {
    if (this.events[key]) {
      this.events[key].forEach((handle) => {
        handle(...args);
      });
    }
  }
}

const eventBus = new EventBus();

function Parent() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    eventBus.on("send", (mes) => {
      setMessage(mes);
    });
  }, []);

  return (
    <div>
      <div>This is Parent component.</div>
      {message}
      <Child />
    </div>
  );
}

function Child() {
  return (
    <div>
      <div>This is Child1 component.</div>
      <button onClick={() => eventBus.emit("send", "hello")}>send</button>
    </div>
  );
}
```
# Ref
react当中获取html节点的方法有findDOMNode（即将废弃）和ref。但是当想要获取自定义组件的DOM节点，直接在props上写ref是获取不到的，如要用到react的api：`forwardRef`。当然除了获取子组件的DOM节点，传递一些信息也是可以的。
```javascript
function Parent() {
  const div = useRef(null);

  useEffect(() => {
    console.log(div)
  }, [])

  return (
    <div>
      <div>This is parent component</div>
      <Child ref={div} />
    </div>
  );
}

const Child = forwardRef(function Child_(props, ref) {
  useEffect(() => {
    ref.current = 'from child'
  }, [])

  return (
    <div>
      <div ref={ref}>This is Child component</div>
    </div>
  );
});
```

