const fs = require('fs');
const AsyncStreamReader = require('./index');

async function readFileByBytes() {
    const reader = new AsyncStreamReader(fs.createReadStream('demo.js'));
    let len = 0;
    while (true) {
        const chunk = await reader.read(10);
        if (chunk == null) {
            break;
        } else {
            len += chunk.length;
        }
    }
    console.log('file length:', len);
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
readFileByLine();
readNumber();