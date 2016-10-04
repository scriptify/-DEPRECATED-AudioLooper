import SyncWorker from './syncing.worker';
import drum from './drum.wav';

import { ADD_TRACK, PLAY, STOP, REMOVE_TRACK } from './constants.js';

export default class AudioLooper {

  worker;
  onPlay;
  onStop;

  constructor(onPlay, onStop) {
    this.onPlay = onPlay;
    this.onStop = onStop;
    this.bootstrap();
  }

  bootstrap() {

    this.worker = new SyncWorker();
    this.worker.addEventListener('message', ({ data }) => this.onWorkerMessage(data));

  }

  onWorkerMessage({ type, id }) {
    switch(type) {
      case PLAY:
        this.onPlay(id);
      break;

      case STOP:
        this.onStop(id);
      break;
    }
  }

  addTrack({ id, duration }) {
    this.worker.postMessage({ type: ADD_TRACK, id, duration });
  }

  removeTrack({ id }) {
    this.worker.postMessage({ type: REMOVE_TRACK, id });
  }

  play({ id }) {
    this.worker.postMessage({ type: PLAY, id });
  }

  stop({ id }) {
    this.worker.postMessage({ type: STOP, id });
  }

}

const audioObj = new Audio(drum);

audioObj.addEventListener('loadedmetadata', e => {
  const onPlay = id => {
    console.log('play song');
    audioObj.pause();
    audioObj.currentTime = 0;
    audioObj.play();
  };

  const onStop = id => {
    audioObj.pause();
  };

  const looper = new AudioLooper(onPlay, onStop);
  looper.addTrack({
    id: 34,
    duration: audioObj.duration
  });
});
