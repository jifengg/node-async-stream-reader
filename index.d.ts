import * as stream from 'node:stream';

/**
 * 以Promisse的形式顺序读取文件字节流。
 * 另外支持以指定分隔字符串分次读取字符串，例如以\n为分隔，逐行读取文件。
 * @param {stream.Readable} stream 
 */
class AsyncStreamReader {
    /**
     * 以Promisse的形式顺序读取文件字节流。
     * 另外支持以指定分隔字符串分次读取字符串，例如以\n为分隔，逐行读取文件。
     * @param {stream.Readable} stream 
     */
    constructor(stream: stream.Readable);
    /**
     * 读取当前文件以指定分隔符分割的下一个字符串，如果文件已经结束则返回剩余的字符串。
     * @param spliter 分隔符，支持任意字符串
     * @returns 当前文件以该分隔符分割的下一个字符串，如果文件已经结束则返回剩余的字符串。返回null表示文件已经结束
     */
    readBySpliter(spliter: string): Promise<string>;
    /**
     * 读取当前文件的下一行
     * @returns 返回null表示文件已经结束
     */
    readLine(): Promise<string>;

    /**
     * 从文件的当前位置读取指定的字节数
     * @param size 要读取的字节数，如果为null则返回缓存区已读取的内容
     * @returns 返回null说明文件已经读取完毕
     */
    read(size): Promise<Buffer> | Buffer;

    readUInt8(): Promise<number> | number;
    readUInt16LE(): Promise<number> | number;
    readUInt16BE(): Promise<number> | number;
    readUInt32LE(): Promise<number> | number;
    readUInt32BE(): Promise<number> | number;
    readInt8(): Promise<number> | number;
    readInt16LE(): Promise<number> | number;
    readInt16BE(): Promise<number> | number;
    readInt32LE(): Promise<number> | number;
    readInt32BE(): Promise<number> | number;
    readFloatLE(): Promise<number> | number;
    readFloatBE(): Promise<number> | number;
    readDoubleLE(): Promise<number> | number;
    readDoubleBE(): Promise<number> | number;
    readString(byteCount: number, encoding?: BufferEncoding): Promise<string> | string;
    _stream: stream.Readable;
}

export = AsyncStreamReader;