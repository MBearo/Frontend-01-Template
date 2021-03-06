## 特殊对象

* Function Object
  * [[call]] 视为函数Function
  * [[Construct]] 可以被new 操作符调用，根据new的规则返回对象
* Array Object
  * [[DefineOwnProperty]]
    * Property == length
      设置对象的length属性，根据length的变化对对象进行操作

      newLength > length 用空扩充数组
      
      newLength < length 截取数组
  * String Object
      
      string的length是不可写不可配的。
  * Arguments Object

      [[callee]] 视为函数参数对对象，伪数组 caller
  * Object
      [[Get]] property被访问时调用 get

      [[Set]] property被赋值时调用 set
      
      [[GetPrototypeOf]] 对应getPrototypeOf方法 获取对象原型
      
      [[SetPrototypeOf]] 对应setPrototypeOf方法 设置对象原型
      
      [[GetOwnProperty]] getOwnPropertyDescriptor 获取对象私有属性的描述列表
      
      [[HasProperty]] hasOwnProperty 私有属性判断
      
      [[IsExtensible]] isExtensible对象是否可扩展
      
      [[PreventExtensions]] preventExtension控制对象是否可以添加属性
      
      [[DefineOwnProperty]] defineProperty 定义对象属性
      
      [[Delete]] delete 操作符
      
      [[OwnPropertyKeys]] Object.keys() Object.entries() Object.values()
      
      [[Call]] 能够调用call
  * Module Namespece
      [[Module]] 视为一个引入的模块

      [[Exports]] 视为一个导出的模块

## numberToString

```javascript
function convertNumberToString(number: number, radix: number = 10) {
    let integer = Math.floor(number);
    let fraction: any = String(number).match(/\.\d+$/);
    if (fraction) {
        fraction = fraction[0].replace('.', '');
    }
    let string = '';
    while (integer > 0) {
        string = String(integer % radix) + string;
        integer = Math.floor(integer / radix);
    }
    return fraction ? `${string}.${fraction}` : string;
}
```

## stringToNumber

```javascript
function convertStringToNumber(string, radix = 10) {
    const numberRegex = /^(\.\d+|(0|[1-9]\d*)(\.\d*)?)([eE][-\+]?\d+)?$|^0[bB][01]+$|^0[oO][0-7]+$|^0[xX][0-9a-fA-F]+$/

    if (!string) {
        return NaN
    }
    if (typeof string !== 'string') {
        throw new Error('str 只能为字符串')
    }
    if (!numberRegex.test(string)) {
        throw new Error('数字不合法')
    }

    if (radix > 10) {
        return;
    }
    let flag = /e|E/.test(string);
    // 判  带 e ||  E 
    if (!flag) {
        let chars = string.split('');
        let number = 0;
        let i = 0;
        while (i < chars.length && chars[i] != '.') {
            number = number * radix;
            number += chars[i].codePointAt(0) - '0'.codePointAt(0);
            i++;
        }
        // 忽略小数
        if (chars[i] === '.') {
            i++;
        }

        // 计算小数位
        let fraction = 1;
        while (i < chars.length) {
            fraction /= radix;
            number += (chars[i].codePointAt(0) - '0'.codePointAt(0)) * fraction;
            i++;
        }
        return number;
    } else {
        let logNumber = Number(string.match(/\d+$/)[0]);

        let number = string.match(/^[\d\.]+/)[0].replace(/\./, '');
        if (/e-|E-/.test(string)) {
            return Number(number.padEnd(logNumber + 1, 0));
        } else if (/e+|E+/.test(string)) {
            return Number(number.padEnd(logNumber + 1, 0));
        } else {
            return Number(number.padStart(logNumber + number.length, 0).replace(/^0/, '0.'));
        }
    }
}
```