
// import {OrderedMap} from "js-sdsl";
//
// let MapSetTimeout = new OrderedMap([],(x, y) => x - y,true);
//
// console.log( MapSetTimeout.begin().equals(MapSetTimeout.end()))
//
// MapSetTimeout.setElement(1,"timeout1")
// MapSetTimeout.setElement(2,"timeout2")
// MapSetTimeout.setElement(3,"timeout3")
// MapSetTimeout.setElement(4,"timeout4")
// MapSetTimeout.setElement(5,"timeout5")
// MapSetTimeout.setElement(6,"timeout6")
//
// let start = Date.now();
// // for (let mapSetTimeoutElement of MapSetTimeout) {
// //     let t = mapSetTimeoutElement[0];
// // }
//
// // for (let it = MapSetTimeout.begin(); !it.equals(MapSetTimeout.end()); it.next()) {
// //     let t = it.o.l; - значение
// //     let t = it.o.u; - ключ
// // }
//
// for (let it = MapSetTimeout.begin(); !it.equals(MapSetTimeout.end()); ) {
//     let l = it.o.l;
//     let u = it.o.u;
//     console.log(u,l);
//     let cur = it;
//     MapSetTimeout.eraseElementByIterator(it);
//     console.log("===")
// }
// console.log(Date.now() - start)


//fs system test delete file
// import fs from "fs";
// const filePath = '/file.txt'; // Replace with the actual path
//
// try {
//     fs.unlinkSync(filePath);
//     console.log(`File ${filePath} has been successfully removed.`);
// } catch (err) {
//     console.error(`Error deleting file: ${err}`);
// }

// import fetch from 'node-fetch';
//
// for (let i = 0; i < 1; i++) {
//     try {
//         let a = await fetch("http://localhost:5000/file/test")
//         console.log("send")
//     }catch (e) {
//         console.log(e)
//     }
//
// }




let Sets = new Set();

let C = 1000000;
let arr = [2346, 578543, 436532, 8754, 34567, 8765, 678456, 99435, 128765, 342865, 53837, 482632];
for (let i = 0; i < C; i++) {
    Sets.add(arr[i%12]+i);
}
let y = 4;

while(true) {
    let start = Date.now();
    let i = 1000000;
    let arr = [2346, 578543, 436532, 87564, 34567, 8765, 678456, 979435, 128765, 342865, 538347, 482632];
    let yy = [];
    let j = 0;
    while (i--) {
        yy.push(Sets.has(arr[i % 12] + j));
        j++;
    }
    console.log(Date.now() - start)
    console.log(Sets.has(300))
}