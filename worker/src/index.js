import * as Comlink from 'comlink';

const {setIntervalRemote, clearIntervalRemote} = Comlink.wrap(new Worker('interval.worker.js'));

const setIntervalInWorker = (fn, ms) => setIntervalRemote(Comlink.proxy(fn), ms);

window.workerApi = {
  setIntervalInWorker,
  clearIntervalInWorker:clearIntervalRemote,
};
