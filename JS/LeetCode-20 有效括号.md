> 给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串 s ，判断字符串是否有效。
> 有效字符串需满足：
> - 左括号必须用相同类型的右括号闭合。
> - 左括号必须以正确的顺序闭合。
> - 每个右括号都有一个对应的相同类型的左括号。
> 
> 来源：力扣（LeetCode）
> 链接：[https://leetcode.cn/problems/valid-parentheses](https://leetcode.cn/problems/valid-parentheses)

```javascript
const bracket = {
  "{": "}",
  "(": ")",
  "[": "]",
};

function ableBracket(str) {
  const target = str.split("");
  const resutl = [];// 采用栈的数据结构，遇到左括号就把对应的右括号推入栈，遇到右括号就推出栈，比较两者是否一致

  for (let item of target) {
    if (item in bracket) {
      resutl.push(bracket[item]);
    } else if (item !== resutl.pop()) {
      return false;
    }
  }

  return !resutl.length
}

```

