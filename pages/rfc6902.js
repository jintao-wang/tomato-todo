import React, {useEffect} from "react";
import {produce} from 'immer';
import {createPatch} from "rfc6902";


export default function Home() {
  useEffect(() => {
    const infoStore = new InfoStore();

    infoStore.addStateChangeListener(infoStore.getStore().friends, (oldFriends, newFriends, patch) => {
      console.log('oldFriends:',oldFriends);
      console.log('newFriends:',newFriends);
      console.log('patch:', patch);
    })
    infoStore.addStateChangeListener(infoStore.getStore(), (oldStore, newStore, patch) => {
      console.log('oldStore:',oldStore);
      console.log('newStore:',newStore);
      console.log('patch:', patch);
    })
    infoStore.addFriend({
      id: 4,
      name: 'haha'
    });

    infoStore.deleteFriend(4);
  }, [])

  return (
    <div>wangjitna</div>
  )
}

// storeLight
class BaseStore {
  store;

  stateChangeListener = {};

  constructor(initData) {
    this.updateStore(initData);
  }

  getStore() {
    return this.store
  }

  produceData(fn) {
    const newState = produce(this.store, fn);
    const patches = createPatch(this.store, newState);
    for(const patch of patches) {
      const registerPath = Object.keys(this.stateChangeListener);
      for(const path of registerPath) {
        if(patch.path.includes(path)) {
          this.stateChangeListener[path].forEach(listenerFn => {
            listenerFn(getValueByPath(path, this.store), getValueByPath(path, newState), patch);
          })
        }
      }
    }
    this.store = newState;
  }


  addStateChangeListener(obj, fn) {
    const path = getPath(this.store, obj);
    if(!this.stateChangeListener[path]) {
      this.stateChangeListener[path] = new Set();
    }
    this.stateChangeListener[path].add(fn);
  }

  removeStateChangeListener(obj, fn) {
    const path = getPath(this.store, obj);
    this.stateChangeListener[path]?.remove(fn);
  }

  updateStore(data) {
    // const patches = createPatch(this.store, data);
    // this.stateChangeListener.forEach((fn) => fn(patches));
    this.store = produce(data, () => {})
  }
}

class InfoStore extends BaseStore{

  constructor() {
    super({
      id: 1,
      user: {
        name: 'wangjintao',
        id: 1,
        home: {
          address: 'xxxx',
          familyNumbers: [
            {
              name: 'jj',
              age: 26,
            }
          ]
        },
      },
      friends: [
        {
          name: 'wang',
          id: 0,
        },
        {
          name: 'jin',
          id: 1,
        },
        {
          name: 'tao',
          id: 2,
        },
      ]
    })
  }

  setId(id) {
    this.produceData((draft) => {
      draft.id = id
    })
  }

  setUserId(id) {
    this.produceData((draft) => {
      draft.user.id = id
    })
  }

  deleteFriend(id) {
    this.produceData((draft) => {
      const index = draft.friends.findIndex((friend) => friend.id === id);
      draft.friends.splice(index, 1)
    })
  }

  addFriend(friend) {
    this.produceData((draft) => {
      draft.friends.splice(1, 0, friend);
    })
  }
}

function getPath(obj, value) {
  const path = [];

  function deepFind(obj, value) {
    for (let key in obj) {
      if (obj[key] === value) {
        path.push(key);
        return true;
      }
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        path.push(key);
        if (!deepFind(obj[key], value)) {
          // 如果此路径下未找到目标值，移除当前路径
          path.pop();
        } else {
          // 如果找到目标值，结束递归
          return true;
        }
      }
    }
    return false;
  }

  deepFind(obj, value);
  return `/${path.join('/')}`;
}

function getValueByPath(path, store) {
  const pathArray = path.slice(1).split('/');
  let data = store;
  pathArray.forEach(path => {
    if(!data[path]) return;
    data = data[path]
  })
  return data;
}

