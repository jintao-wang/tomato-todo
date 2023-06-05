import React, {useEffect} from "react";
import {produce, enablePatches} from 'immer';
import {generate, observe} from "fast-json-patch";


export default function Home() {
  useEffect(() => {
    const dataModule = new DataModule();
    const path = new Patch();
    setTimeout(() => {
      // dataModule.setId(2);
      // dataModule.setUserId(3);
      dataModule.addFriend({
        id: 4,
        name: 'haha'
      });
    }, 500)
  }, [])

  return (
    <div>wangjitna</div>
  )
}

class Patch {
  document = { firstName: "Joachim", lastName: "Wester", contactDetails: { phoneNumbers: [ { number:"555-123" }] } };
  observer = observe(this.document);
  patch = generate(this.observer);

  constructor() {

  }
}

class DataModule {
  data;

  constructor() {
    this.data = produce({
      id: 1,
      user: {
        name: 'wangjintao',
        id: 1,
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
    }, () => {
    })
  }

  produceData(fn) {
    this.data = produce(this.data, fn);
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
      const index = draft.friends.findIndex((friend) => {friend.id === id});
      draft.friends.splice(index, 1)
    })
  }

  addFriend(friend) {
    this.produceData((draft) => {
      draft.friends.splice(1, 0, friend)
    })
  }
}
