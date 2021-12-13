# node-async-stream-reader

一个支持异步方式的流读取器，以nodejs编写，支持node环境。

可用于异步读取一个文件或任何可读的流（例如`http response`），并在它们到达时进行处理。

此方式不会占用太多内存，并且可以处理大文件。占用的内存取决于`read(size)`方法传入的参数。因此，正如`readable.read(size)`方法一样，我们建议`size参数必须小于或等于1 GiB（1,073,741,824）`。

读取速度取决于底层流的速度。


# 安装

```bash
npm --save install node-async-stream-reader
```

# API Reference

## AsyncStreamReader(stream : stream.Readable)

构造一个以stream.Readable为来源的异步流读取器。

### read(size:Number):`Promise<Buffer> | Buffer`

读取下一个`size`字节，如果流已经结束，则返回null。

### readLine():`Promise<string> | string`

读取下一行，如果流已经结束，则返回null。

并且，如果它包含一个`\r`，你必须自己去掉它。

### readBySpliter(spliter:string):`Promise<string> | string`

读取下一个字符串，以`spliter`为分隔符。如果流已经结束，则返回null。
如你所见，`readLine()` == `readBySpliter('\n')`。如果你的字符串包含`\r`，你可以使用`readBySpliter('\r\n')`来代替。

### readInt(),readInt16LE() ... :`Promise<number> | number`

和`Buffer`的`Read**()`方法一样。

### readString(size:Number,encoding:BufferEncoding):`Promise<string> | string`

读取`size`个字节，并使用`encoding`转换为字符串。如果流已经结束，则返回null。

# 注意

你可以对所有 `read**()` 方法使用`await`:

```js
let data = await reader.read(4);
let len = await reader.readInt8();
```

但是，当你在循环中使用`read**()`时，`await`将会很慢。解决方法是，如果返回值是Promise，则加上await，如：

```js
const reader = new AsyncStreamReader(fs.createReadStream('/path/to/a/big/file'));
//每次读取2个字节
while (true) {
    //这里不要使用await
    let buf = reader.read(2);
    //添加以下代码
    if (buf instanceof Promise) {
        buf = await buf;
    }
    if (buf == null) {
        break;
    } else {
        len += buf.length;
    }
}
```

# 示例

## 循环读取文件的所有字节

```js
// 循环读取文件的所有字节
const fs = require('fs');
const AsyncStreamReader = require('node-async-stream-reader');

async function readFileByBytes() {
    const reader = new AsyncStreamReader(fs.createReadStream('/path/to/a/very/big/file'));
    let len = 0;
    while (true) {
        //size 可以不传
        const chunk = await reader.read();
        if (chunk == null) {
            break;
        } else {
            //对chunk进行处理，这里我们只是简单的累加chunk的长度
            len += chunk.length;
        }
    }
    console.log('file length:', len);
}

readFileByBytes();
```

## 读取文本文件的前4行

```js
// 读取文本文件的前4行
const fs = require('fs');
const AsyncStreamReader = require('node-async-stream-reader');

async function readFileByLine() {
    const reader = new AsyncStreamReader(fs.createReadStream('demo.js'));
    for (let i = 0; i < 4; i++) {
        let line = await reader.readLine();
        if (line == null) {
            break;
        }
        console.log('line', i, line);
    }
}

readFileByLine();
```
