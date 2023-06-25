import Dexie from 'dexie';

export const db = new Dexie('tomatoDatabase');
db.version(3).stores({
  taskList: '&uuid, title,description, tomatoNum, completedTomatoes, currentTomatoTime, status, createdAt, updatedAt', // Primary key and indexed props
});
db.version(4).stores({
  taskList: '&uuid, title,description, targetTomatoNum, status, createdAt, updatedAt, tomatoDetails',

}).upgrade(tx => {
  // Will only be executed if a version below 2 was installed.
  return tx.taskList.toCollection().delete();
});

db.version(5).stores({
  taskList: '&uuid, title,description, targetTomatoNum, status, createdAt, updatedAt, tomatoDetails',
})

db.version(6).stores({
  taskList: '&uuid, title,description, targetTomatoNum, status, createdAt, updatedAt, uploadAt, tomatoDetails',
}).upgrade(tx => {
  return tx.taskList.toCollection().delete();
});

export const authDB = new Dexie('dropboxAuth');
authDB.version(1).stores({
  auth: '&id,token,expiresIn'
});
