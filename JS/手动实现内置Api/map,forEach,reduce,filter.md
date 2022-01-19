### map

```javascript
Array.prototype.newMap = function (fun,context){
	const result = []
    const array = this
    for(let i = 0 ; i < array.length ; i += 1){
		const item = array[i]
    	result[i] = fun.call(context || window, item, i ,array)
    }
    return result
}
```

### forEach

```javascript
Array.prototype.newForEach = function (fun,context){
    const array = this
    for(let i = 0 ; i < array.length ; i += 1){
		const item = array[i]
    	result[i] = fun.call(context || window, item, i ,array)
    }
}
```

### filter

```javascript
Array.prototype.newFilter = function (fun,context){
	const result = []
    const array = this
    for(let i = 0 ; i < array.length ; i += 1){
		const item = array[i]
        const bool = fun.call(context || window, item, i ,array)
        if(bool){
            result.push(item)
        }
    }
    return result
}
```

### reduce

```javascript
Array.prototype.newReduce = function (fun,sum){
	let result = sum
    const array = this
    for(let i = 0 ; i < array.length ; i += 1){
        const item = array[i]
        if(result === undefined){
            result = item
        }else{
            result = fun(result, item, i ,array)
        }
    }
    return result
}
```

