import * as Comlink from 'comlink';

const intervalInWorker = {
  setIntervalRemote(fn, ms) {
    return setInterval(fn, ms)
  },
  clearIntervalRemote(timer) {
    return clearInterval(timer)
  }
};

Comlink.expose(intervalInWorker);
