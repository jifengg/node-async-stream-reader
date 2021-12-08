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

### read(size:Number):`Promise<Buffer>`

读取下一个`size`字节，如果流已经结束，则返回null。

### readLine():`Promise<string>`

读取下一行，如果流已经结束，则返回null。

并且，如果它包含一个`\r`，你必须自己去掉它。

### readBySpliter(spliter:string):`Promise<string>`

读取下一个字符串，以`spliter`为分隔符。如果流已经结束，则返回null。
如你所见，`readLine()` == `readBySpliter('\n')`。如果你的字符串包含`\r`，你可以使用`readBySpliter('\r\n')`来代替。

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
