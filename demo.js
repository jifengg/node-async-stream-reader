const fs = require('fs');
const AsyncStreamReader = require('./index');

async function readFileByBytes() {
    let file = 'C:/workspace/node-wave-reader/test/10s.awf.json';
    const reader = new AsyncStreamReader(fs.createReadStream(file));
    let len = 0;
    console.time('readFileByBytes');
    let count = 0;
    while (true) {
        let buf = reader.read(2);
        if (buf instanceof Promise) {
            buf = await buf;
        }
        if (buf == null) {
            break;
        } else {
            len += buf.length;
        }
        count++;
    }
    console.timeEnd('readFileByBytes');
    console.log('file length:', len, count);

    console.time('readFileByBytes2');
    count = 0;
    let bufs = fs.readFileSync(file);
    let position = 0;
    let size = 2;
    let len2 = 0;
    while (true) {
        // size = size || (bufs.length - position);
        const chunk = bufs.slice(position, position + size)
        position += chunk.length;
        len2 += chunk.length;
        count++;
        if (position >= bufs.length) {
            break;
        }
    }
    console.timeEnd('readFileByBytes2');
    console.log('file length 2:', len2, count);

    console.time('readFileByBytes3');
    count = 0;
    let fs2 = fs.createReadStream(file);
    let len3 = 0;
    fs2.on('data', (bufs) => {
        let position = 0;
        // fs2.pause();
        while (true) {
            const chunk = bufs.slice(position, position + 2)
            position += chunk.length;
            len3 += chunk.length;
            count++;
            if (position >= bufs.length) {
                break;
            }
            // fs2.resume();
        }
    });
    fs2.on('end', () => {
        console.timeEnd('readFileByBytes3');
        console.log('file length 3:', len3, count);
    });
}

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

async function readNumber() {
    const reader = new AsyncStreamReader(fs.createReadStream('demo.js'));
    console.log('readNumber:', await reader.readUInt8()); //c=99
    console.log('readNumber:', await reader.readInt8()); //o=111
    console.log('readNumber:', await reader.readInt16BE()); //ns=28275
    console.log('readString:', '-->' + await reader.readString(5) + '<--'); //
}
readFileByBytes();
// readFileByLine();
// readNumber();