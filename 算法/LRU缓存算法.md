# LRU缓存算法

具体解释参照[LeetCode](https://leetcode.cn/problems/lru-cache-lcci/)

解题思路：
- LRU 缓存机制可以通过哈希表辅以双向链表实现，我们用一个哈希表和一个双向链表维护所有在缓存中的键值对。
- 双向链表按照被使用的顺序存储了这些键值对，靠近头部的键值对是最近使用的，而靠近尾部的键值对是最久未使用的。
- 哈希表即为普通的哈希映射（HashMap），通过缓存数据的键映射到其在双向链表中的位置。


![0950c73a343a64dce879d5a0362579efc.png](/FILES/d823543983d88986f6d8ddd00.png)

```javascript
/**
 * @param {number} capacity
 */
function LRUCache(capacity) {
    this._max = max;
    this._num = 0;
    this._map = new Map();
    this.headNode = {};
    this.tailNode = {};
    this.headNode.next = this.tailNode;
    this.tailNode.last = this.headNode;
}

LRUCache.prototype.put = function (key, value) {
    if (this._map.has(key)) {
        this.moveToHead(key, value);
    } else {
        if (this._num < this._max) {
            this.addHead(key, value);
        } else {
            this.deleteTail();
            this.addHead(key, value);
        }
    }
};
LRUCache.prototype.get = function (key) {
    if (this._map.has(key)) {
        const node = this._map.get(key);
        this.moveToHead(key, node.value);
        return node.value;
    }
    return -1;
};

LRUCache.prototype.addHead = function (key, value) {
    this._num++
    const node = { key, value };
    const nextNode = this.headNode.next;
    this.headNode.next = node;
    node.last = this.headNode;
    node.next = nextNode;
    nextNode.last = node;
    this._map.set(key, node);
};

LRUCache.prototype.deleteTail = function () {
    this._num--
    const last = this.tailNode.last;

    const newLast = this.tailNode.last.last;
    newLast.next = this.tailNode;
    this.tailNode.last = newLast;

    this._map.delete(last.key);
};

LRUCache.prototype.moveToHead = function (key, value) {
    const node = this._map.get(key);

    node.last.next = node.next;
    node.next.last = node.last;
    this._map.delete(key);
    this._num--

    this.addHead(key, value);
};

```

