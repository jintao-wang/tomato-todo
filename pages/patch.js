import React, {useEffect} from "react";
import {produce, enablePatches} from 'immer';
import {generate, observe} from "fast-json-patch";


export default function Home() {
  useEffect(() => {
    const path = new Patch();
    path.addFriend({
      id: 4,
      name: 'haha'
    });
  }, [])

  return (
    <div>wangjitna</div>
  )
}

class Patch {
  storeRef = {
    current: null,
  };
  observer = observe(this.storeRef);

  constructor() {
    this.storeRef.current = produce(
      {
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
      },
      () => {
      }
    )
    console.log(generate(this.observer));
  }

  produceData(fn) {
    this.storeRef.current = produce(this.storeRef.current, fn);
    const patch = generate(this.observer);
    console.log(patch)
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

