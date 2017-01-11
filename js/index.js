import createSyncWorker from './syncing';

import { ADD_TRACK, PLAY, STOP, REMOVE_TRACK, SYNC, CLEAR_SYNC } from './constants.js';

export default class AudioLooper {

  worker;
  onPlay;
  onStop;
  syncInterval;

  constructor(onPlay, onStop) {
    this.onPlay = onPlay;
    this.onStop = onStop;
    this.bootstrap();
  }

  bootstrap() {
    this.worker = createSyncWorker();

    this.worker.addEventListener('message', ({ data }) => this.onWorkerMessage(JSON.parse(data)));
  }

  onWorkerMessage({ type, id, payload = 0 }) {
    switch(type) {
      case PLAY:
        this.onPlay(id);
      break;

      case STOP:
        this.onStop(id);
      break;

      case CLEAR_SYNC:
        this.clearSync();
      break;
    }
  }

  addTrack({ id, duration }) {
    this.post({ type: ADD_TRACK, payload: { id, duration } });
  }

  removeTrack({ id }) {
    this.post({ type: REMOVE_TRACK, payload: { id } });
  }

  play({ id }) {
    this.post({ type: PLAY, payload: { id } });
  }

  stop({ id }) {
    this.post({ type: STOP, payload: { id } });
  }

  syncFirstTrack(audioObj) {
    // You can manually sync with the first track by passing the current time of it to the worker
    // Ideally, you get higher accuracy by doing this
    this.syncInterval = window.setInterval(() => {
      this.post({ type: SYNC, payload: audioObj.currentTime })
    }, 300)
  }

  clearSync() {
    window.clearInterval( this.syncInterval );
  }

  post(obj) {
    this.worker.postMessage( JSON.stringify(obj) );
  }

  dispose() {
    this.worker.terminate();
  }

}
