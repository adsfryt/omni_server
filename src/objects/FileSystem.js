import fs from "fs";

export default new class FileSystem {
    createPath(dir){
        if (!fs.existsSync(dir)){
             fs.mkdirSync(dir, { recursive: true });
        }
    }
    toArray(files){
        if(!files){
            return [];
        }
        if(!Array.isArray(files)){
            return [files];
        }
        return files;
    }
}