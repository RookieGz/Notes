# form的submit方法和requestSubmit方法有什么不同？

当我们使用原生新建一个表单

```html
<form onSubmit={handleSubmit}>
  <input name="text" />
</form>
```

```js
const handleSubmit = (e) => {
  e.preventDefault();
}
```

在表单里没有submit按钮时，希望通过js触发提交事件

```js
form.submit();
```

这时不会触发onSubmit事件，`preventDefault` 也没有成功。

可以使用requestSubmit方法就可以触发onSubmit事件了。

关于submit事件的详解[MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLFormElement/submit)

HTMLFormElement.submit() 用来提交表单 <form>

这个方法和触发提交表单按钮很类似，但有所不同：

没有引发 submit (en-US) 事件。即，表单的 onsubmit 事件处理程序不会运行。
不会触发约束验证 。
HTMLFormElement.requestSubmit() 方法与触发表单提交的 <button> 的效果是相同的。

如果一个表单控件（比如一个提交按钮）的 name 或 id 的值为 submit，则它将覆盖表单的 submit 方法。

使用 HTMLFormElement.submit() 方法时，属性 type="submit" 的 <input> 不会与表单一起被提交，但在使用原始的 HTML 表单提交时，它将被提交。
