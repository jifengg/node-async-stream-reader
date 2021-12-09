const stream = require('stream')

/**
 * 以Promisse的形式顺序读取文件字节流。
 * 另外支持以指定分隔字符串分次读取字符串，例如以\n为分隔，逐行读取文件。
 * @param {stream.Readable} stream
 * @author jifengg
 * @date 2021-12-08
 * @lastModify 2021-12-08 13:53:00
 * @link https://github.com/jifengg/node-async-stream-reader/
 */
function AsyncStreamReader(stream) {
    /**
     * @type {stream.Readable}
     */
    this._stream = stream;
    /**
     * @type {Buffer}
     */
    this._buffer = Buffer.alloc(0);
    /**
     * @type {Buffer}
     */
    this._leftBuffer = null;
    this._readCB = null;
    /**
     * 要读取的字节数
     */
    this._readingSize = 0;
    /**
     * 已读取的字节数
     */
    this._readedSize = 0;
    this._position = 0;
    /**
     * 缓存的字节数组
     */
    this._chunks = [];
    this._stream.on('data', (chunk) => {
        this._chunks.push(chunk);
        this._readedSize += chunk.length;
        if (this._readedSize >= this._readingSize) {
            this._buffer = Buffer.concat(this._chunks);
            if (this._readCB) {
                this._readCB(null);
                this._chunks = [];
            }
        }
    });
    this._stream.on('end', () => {
        if (this._readCB) {
            this._buffer = Buffer.concat(this._chunks);
            this._readCB(null);
            this._chunks = [];
        }
    });
    this._stream.on('error', (err) => {
        if (this._readCB) {
            this._readCB(err);
        }
    });
    this._stream.on('close', () => {
        if (this._readCB) {
            this._readCB('stream closed');
        }
    });
}

/**
 * 读取当前文件以指定分隔符分割的下一个字符串，如果文件已经结束则返回剩余的字符串
 * @param {string} spliter 分隔符，支持任意字符串
 * @returns 当前文件以该分隔符分割的下一个字符串，如果文件已经结束则返回剩余的字符串。返回null表示文件已经结束
 */
AsyncStreamReader.prototype.readBySpliter = async function(spliter = '\n') {
    let bytes = [];
    if (this._leftBuffer) {
        bytes.push(this._leftBuffer);
    }
    if (this._leftBuffer && this._leftBuffer.includes(spliter)) {

    } else {
        while (true) {
            let b = await this.read();
            if (b === null) {
                break;
            }
            bytes.push(b);
            if (b.includes(spliter)) {
                break;
            }
        }
    }
    if (bytes.length > 0) {
        let includeBuffer = bytes.pop();
        let index = includeBuffer.indexOf(spliter);
        //包含分隔符
        if (index >= 0) {
            this._leftBuffer = includeBuffer.slice(index + spliter.length);
            if (index > 0) {
                bytes.push(includeBuffer.slice(0, index));
            }
        } else {
            //不包含分隔符，读取到结尾了，返回剩余内容
            this._leftBuffer = null;
            bytes.push(includeBuffer);
        }
        return Buffer.concat(bytes).toString();
    } else {
        return null;
    }

}

/**
 * 读取当前文件的下一行
 * @returns 返回null表示文件已经结束
 */
AsyncStreamReader.prototype.readLine = function() {
    return this.readBySpliter('\n');
}

/**
 * 从文件的当前位置读取指定的字节数
 * @param {number} size 要读取的字节数，如果为null则返回缓存区已读取的内容
 * @returns 返回null说明文件已经读取完毕
 */
AsyncStreamReader.prototype.read = function(size) {
    return new Promise((resolve, reject) => {
        //判断流是否读取结束了
        if (this._stream.readableEnded) {
            resolve(null);
            return;
        }
        if (this._buffer.length - this._position >= (size || 1)) {
            resolve(this.innerRead(size));
        } else {
            this._buffer = this._buffer.slice(this._position);
            this._position = 0;
            this._readingSize = size || 0;
            this._stream.resume();
            this._chunks.push(this._buffer);
            this._readedSize = this._buffer.length;
            this._readCB = (err) => {
                this._readCB = null;
                this._stream.pause();
                if (err) {
                    reject(err);
                } else {
                    resolve(this.innerRead(size));
                }
            };
        }
    });
}

/**
 * 从已经缓存的数据中读取指定的字节数
 * @param {number} size 
 * @returns 
 */
AsyncStreamReader.prototype.innerRead = function(size) {
    //如果没有可以读取的数据，则返回null
    if (this._buffer.length <= this._position) {
        return null;
    }
    size = size || (this._buffer.length - this._position);
    let buf = Buffer.alloc(Math.min(size, this._buffer.length - this._position));
    this._buffer.copy(buf, 0, this._position, this._position + size);
    this._position += size;
    return buf;
}

AsyncStreamReader.prototype.readString = function(len, encoding) {
    return this.read(len).then((buf) => {
        return buf.toString(encoding);
    });
}

// 添加Buffer的方法
const BufferReadMethods = {
    readInt8: 1,
    readUInt8: 1,
    readInt16LE: 2,
    readInt16BE: 2,
    readUInt16LE: 2,
    readUInt16BE: 2,
    readInt32LE: 4,
    readInt32BE: 4,
    readUInt32LE: 4,
    readUInt32BE: 4,
    readFloatLE: 4,
    readFloatBE: 4,
    readDoubleLE: 8,
    readDoubleBE: 8,
    readInt64LE: 8,
    readInt64BE: 8,
    readUInt64LE: 8,
    readUInt64BE: 8
}

for (const m in BufferReadMethods) {
    if (Buffer.prototype.hasOwnProperty(m)) {
        const len = BufferReadMethods[m];
        (function() {
            AsyncStreamReader.prototype[m] = function() {
                console.log(this);
                return this.read(len).then((buffer) => {
                    return buffer && buffer[m]();
                });
            }
        })(m, len);
    }
}

module.exports = AsyncStreamReader;