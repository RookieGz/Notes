## innerText

[MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLElement/innerText)

innerText 属性代表一个节点及后代**所渲染文本的内容**

作为一个 getter，它近似于用户用光标突出该元素的内容，然后将其复制到剪贴板上所得到的文本。

作为一个 setter，这将用给定的值替换该元素的子元素，并将任何换行符转换为 \<br> 元素。

测试用例

```html
<p id="tester">
  <span style="display: none;">隐藏文字</span>
  <span>展示文字</span>
  hello1world<br />
  hello2world<br />
  hello3world hello4world
</p>
<p id="tester2"></p>
<script>
  const tester = document.getElementById("tester");
  const tester2 = document.getElementById("tester2");

  console.log(tester.innerText);
  tester2.innerText = tester.innerText;
</script>
```

结果

```
展示文字 hello1world
hello2world
hello3world hello4world

<p id="tester2">
  展示文字 hello1world
  <br>
  hello2world
  <br>
  hello3world hello4world
</p>
```

可以看得出来，在作为 getter 的时候 innerText 没有取得隐藏元素的文字，并且将\<br>标签转换成的换行符，而换行符直接被删除，可以说 innerText 获取的文字就是在页面上展示的文字。还有一种情况，在默认情况下，页面不会展示换行符，这是否会影响 innerText 的获取？下面来验证一下。为 tester 添加属性`white-space: pre-wrap`，这会让元素内部的换行符生效，这时输出的值

```

展示文字
hello1world

hello2world

hello3world // 这里换行符生效了
hello4world

<p id="tester2">
<br>
<br>
展示文字
<br>
hello1world
<br>
<br>
hello2world
<br>
<br>
hello3world
<br>
hello4world
<br>
</p>
```

可以看到 innerText 的取值也有换行，并且作为 setter 将换行转换成<br>。

## textContent

[MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Node/textContent)

与 innerText 相似都可以获取当前元素及所有子元素的文本内容，但是 textContent 也可以获取被隐藏的子元素的文字。

```html
<p id="tester" style="white-space: pre-wrap;">
  <span style="display: none;">隐藏文字</span>
  <span>展示文字</span>
  hello1world<br />
  hello2world<br />
  hello3world hello4world
</p>
<p id="tester2"></p>
<script>
  const tester = document.getElementById("tester");
  const tester2 = document.getElementById("tester2");

  console.log(tester.textContent);
  tester2.textContent = tester.textContent;
</script>
```

输出

```
    隐藏文字
    展示文字
    hello1world
    hello2world
    hello3world
    hello4world

<p id="tester2">
  隐藏文字
  展示文字
  hello1world
  hello2world
  hello3world
  hello4world
</p>
```

可以看出作为getter可以获取所有子元素的文字，并且将\<br>转换成换行符，但是作为setter的时候并不会将换行符转换成\<br>

## 结论
innerText和textContent的不同：

- textContent 会获取所有元素的内容，包括 \<script> 和 \<style> 元素，然而 innerText 只展示给人看的元素。
- textContent 会返回节点中的每一个元素。相反，innerText 受 CSS 样式的影响，并且不会返回隐藏元素的文本，
  - 此外，由于 innerText 受 CSS 样式的影响，它会触发回流（ reflow ）去确保是最新的计算样式。（回流在计算上可能会非常昂贵，因此应尽可能避免。）
- 与 textContent 不同的是，在 Internet Explorer (小于和等于 11 的版本) 中对 innerText 进行修改，不仅会移除当前元素的子节点，而且还会永久性地破坏所有后代文本节点。在之后不可能再次将节点再次插入到任何其他元素或同一元素中。
- 如果需要获取纯文本内容并保留换行符和标签，可以使用 textContent。如果只需要获取可见的文本内容并忽略样式和标签，可以使用 innerText。
