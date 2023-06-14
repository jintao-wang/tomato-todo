import Dexie from 'dexie';

export const db = new Dexie('tomatoDatabase');
db.version(3).stores({
  taskList: '&uuid, title,description, tomatoNum, completedTomatoes, currentTomatoTime, status, createdAt, updatedAt', // Primary key and indexed props
});
