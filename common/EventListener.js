export class EventListener {
  event = {};

  constructor(event) {
    event.forEach(e => {
      this.event[e] = new Set();
    })

  }

  addEventListener(key, func) {
    if (!this.event[key]) {
      throw new Error(`do not has this event: ${key}`);
    }

    this.event[key].add(func);
  }


  removeEventListener(key, func) {
    if (!this.event[key]) {
      throw new Error(`do not has this event: ${key}`);
    }
    this.event[key].delete(func);
  }
}
