import createSyncWorker from './syncing';

import { ADD_TRACK, PLAY, STOP, REMOVE_TRACK, SYNC } from './constants.js';

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
    setInterval(() => {
      this.post({ type: SYNC, payload: audioObj.currentTime })
    }, 300)
  }

  post(obj) {
    this.worker.postMessage( JSON.stringify(obj) );
  }

}

// Benchmark #1
/*
const benchmark = (n, times) => {

  // n = seconds between tracks played
  // times = how many times to play a track

  let count = 0;
  let data = [];
  let time1 = 0;
  let time2 = 0;
  let hasBegan = false;

  return new Promise((resolve, reject) => {
    const onPlay = id => {
      // Theoratically, this executes exactly every n second
      if(hasBegan) {
        time2 = performance.now();
        data.push( (time2 - time1) / 100 );
        time1 = time2;
      }

      hasBegan = true;

      if(count >= times) {
        data.shift();

        let average = data.reduce((pre, curr) => pre + curr) / data.length;

        resolve({
          data,
          average
        });
      }

      count = count + 1;
    };
    const looper = new AudioLooper(onPlay, () => {});

    looper.addTrack({
      id: 42,
      duration: n
    });
  });
}

benchmark(0.5, 10)
  .then(result => {
    console.log(result);
  });
*/
