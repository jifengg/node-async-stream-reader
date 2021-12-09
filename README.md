[中文版](README_ZH.md)

# node-async-stream-reader

A stream reader with asynchronous support, written in nodejs and supporting node environments.  

this can be used to read a file or any readable stream (such as a `http response`) asynchronously, and then process the data as it comes in.

it won't take many memory while reading the stream, and it will be able to handle large files.how many memory taken is depend on the arguments passed to the `read(size)` method.so,as same as the `readable.read(size)` method,we suggest `The size argument must be less than or equal to 1 GiB (1,073,741,824).`.

the reading speed is depend on the speed of the underlying stream.

# install

```bash
npm --save install node-async-stream-reader
```

# API Reference

## AsyncStreamReader(stream : stream.Readable)
Constructs a new async stream reader from a stream.Readable.

### read(size:Number):`Promise<Buffer>`

read next `size` byte(s) from `stream`.if stream is `ended`,return null.

### readLine():`Promise<string>`

read next line from `stream`.if stream is `ended`,return null.

and all so,if it contain a `\r`,you must remove it by yourself.

### readBySpliter(spliter:string):`Promise<string>`

read next string from `stream`,which split by `spliter`.if stream is `ended`,return null.

as you know,`readLine()` == `readBySpliter('\n')`.if your string contain '\r',you can use `readBySpliter('\r\n')` instead.

# demo

## read file by bytes

```js
// read file by bytes
const fs = require('fs');
const AsyncStreamReader = require('node-async-stream-reader');

async function readFileByBytes() {
    const reader = new AsyncStreamReader(fs.createReadStream('/path/to/a/very/big/file'));
    let len = 0;
    while (true) {
        //size can be undefined.
        const chunk = await reader.read();
        if (chunk == null) {
            break;
        } else {
            //do something with chunk,here we just sum the length of chunk.
            len += chunk.length;
        }
    }
    console.log('file length:', len);
}

readFileByBytes();
```

## read 4 lines of file

```js
// read 4 lines of file
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
