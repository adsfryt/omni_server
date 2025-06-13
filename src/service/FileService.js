export default new class FileService {
    fillDataFiles(data,files){
        if(!files){
            files = [];
        }
        if(!Array.isArray(files)){
            files = [files];
        }
        data.files = [];
        for (let i = 0; i < files.length; i++) {
            if(files[i].size > 50000000){
                throw new Error("file's size can't be more than 50mb");
            }
            if(data.files.includes(files[i].name)){
                throw new Error("Names of files can't repeat");
            }
            data.files.push(files[i].name);
        }
    }

    filesToArray(files){
        if(!files){
            return [];
        }
        if(!Array.isArray(files)){
            return [files];
        }
    }
}