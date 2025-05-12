import { Worker, isMainThread, parentPort } from 'worker_threads';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (isMainThread) {
    let date = new Date();

    const arr = [1,2];
    for (let i = 0; i < 10000000; i++) {
        arr.push(i);
    }

    let date1 = new Date();

    const arr1 = [1,2];
    for (let i = 0; i < 10000000; i++) {
        const arr2 = arr1.concat(3);
    }

    let date2 = new Date();

    console.log("1",date1 - date,"2",date2 - date1 )
} else {
    // This code is executed in the worker and not in the main thread.
    let y = 0;
    for (let i = 0; i < 10000000000; i++) {
        y++;
    }
}