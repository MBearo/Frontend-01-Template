# 每周总结可以写在这里

## utf8 Encoding

```javascript
function encode(string){
  let x=[]
  for(let i=0;i<string.length;i++){
    x.push(string.codePointAt().toString(16))
  }
  return x.reduce((a,c)=>a+'/u'+c,'')
}
```

## Number 直接量

```javascript
/^-?[0-9]\d*$|(0x)?[0-9a-fA-F]+|0?[0-7]*|^-?([1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0)$/
```
## 写一个正则表达式，匹配所有的字符串直接量，单引号和双引号

```javascript
/?:[^"]|\.)*"|'(?:[^']|\.)*|^[\u4E00-\u9FA5A-Za-z0-9]+$ /
```