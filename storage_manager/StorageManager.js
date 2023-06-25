import {authDB, db} from './index_db/db'
import {debounce} from "@/common/debounce";
import {Dropbox} from "dropbox";
import {throttle} from "@/common/throttle";

export class StorageManager {
  static instance;

  $storageChangeListener = new Set();

  constructor() {
    if (StorageManager.instance) {
      return StorageManager.instance;
    }

    StorageManager.instance = this;
  }

  addStorageChangeListener(callback) {
    this.$storageChangeListener.add(callback);
  }

  removeStorageChangeListener(callback) {
    this.$storageChangeListener.delete(callback);
  }

  async getTaskList() {
    this.$syncData();
    return db.taskList.toArray()
  }

  async getTask(uuid) {
    return db.taskList.get(uuid)
  }

  async addTask(task) {
    this.$syncData();
    return db.taskList.add(task)
  }

  async putTask(task) {
    this.$syncData();
    return db.taskList.put(task)
  }

  $syncData = throttle(() => {
    authDB.auth.get('user').then(async (authData) => {
      if (authData?.expiresIn > new Date().getTime()) {
        const token = authData.token;
        const dbx = new Dropbox({accessToken: token});
        const remoteTaskList = await this.$getTaskListFromRemote(dbx);
        const localTaskList = await db.taskList.toArray();
        this.$syncToLocal(localTaskList, remoteTaskList);
        this.$syncToRemote(localTaskList, remoteTaskList, dbx);
      }
    });
  }, 30000)

  $getTaskListFromRemote(dbx) {
    const path = process.env.NEXT_PUBLIC_ENV === 'development' ? '/dev/index.json' : '/index.json';
    return dbx.filesDownload({path})
      .then((response) => new Promise(resolve => {
        const blob = response.result.fileBlob; // Blob object contains the file data
        const reader = new FileReader();
        reader.onload = function() {
          const text = reader.result;
          resolve(JSON.parse(text));
        };
        reader.readAsText(blob);
      }))
      .catch((error) => {
        return [];
      });
  }

  $syncToLocal(localTaskList, remoteTaskList) {
    let change = false;
    remoteTaskList.map(async (remoteFile) => {
      const localFile = localTaskList.find((file) => file.uuid === remoteFile.uuid);

      if (!localFile) {
        change = true;
        db.taskList.add(remoteFile);
      } else if (new Date(remoteFile.updatedAt).getTime() > new Date(localFile.updatedAt).getTime()) {
        change = true;
        db.taskList.put(remoteFile);
      }
    })

    if(change) {
      db.taskList.toArray().then(taskList => {
        this.$storageChangeListener.forEach(callback => callback(taskList))
      })
    }
  }

  $syncToRemote(localTaskList, remoteTaskList, dbx) {
    if (!localTaskList?.length) return;

    let change = false;

    const newFileListPromise = localTaskList.map(async (localFile) => {
      const remoteFile = remoteTaskList.find((file) => file.uuid === localFile.uuid);

      if (!remoteFile && localFile.updatedAt) {
        change = true;
        const newFileInfo = {
          ...localFile,
          uploadAt: new Date().toISOString(),
        };
        db.taskList.put(newFileInfo);
        return newFileInfo;
      }
      if (remoteFile && new Date(localFile.updatedAt).getTime() > new Date(remoteFile.updatedAt).getTime()) {
        change = true;
        const newFileInfo = {
          ...localFile,
          uploadAt: new Date().toISOString(),
        };
        db.taskList.put(newFileInfo);
        return newFileInfo
        // eslint-disable-next-line max-len
      }
      return localFile;
    });

    if(change) {
      Promise.all(newFileListPromise).then((newFileList) => {
        const path = process.env.NEXT_PUBLIC_ENV === 'development' ? '/dev/index.json' : '/index.json';
        // 将 JSON 对象转化为字符串
        const jsonString = JSON.stringify(newFileList);

        // 创建一个 Blob 对象代表这个字符串的内容
        const fileContent = new Blob([jsonString], {type: 'application/json'});

        // 上传这个 Blob 对象到 Dropbox
        dbx.filesUpload({path, contents: fileContent, mode: 'overwrite'})
          .then(function (response) {
            // console.log(response);
          })
          .catch(function (error) {
            // console.error(error);
          });
      });
    }
  }
}
