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
