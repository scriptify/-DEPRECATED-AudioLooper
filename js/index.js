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
    // Idealy, ou get higher accuracy by doing this
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

// Simple Loopstation:

const average = data => data.reduce((pre, curr) => pre + curr) / data.length;

import Recordy from 'recordy';
import AudioChnl from 'audiochnl';

const audioCtx = new AudioContext();

const recordy = new Recordy(audioCtx);

recordy.getInput()
  .then(hasInput => {
    if(hasInput)
      console.log('Got mic input!');
    else
      console.error('Could not get mic input.');
  });

render(recordy, audioCtx);

function render(recordy, audioCtx) {


  let time1 = 0;
  let time2 = 0;
  let measurements = [];
  let tracks = [];
  let id = 0;
  let count = 0;

  const alertDiv = document.createElement('div');

  const alertText = text => {
    const h1 = document.createElement('h1');
    h1.textContent = text;
    alertDiv.appendChild(h1);
  }

  const onPlay = id => {

    const firstDuration = tracks[0].chnl.audioObj.duration;

    time2 = performance.now();
    measurements.push( (time2 - time1) / 1000 )
    time1 = time2;

    const logNum = measurements[measurements.length - 1];

    const audio = tracks.find(track => track.id === id).chnl;
    //  console.log(Math.abs( audio.audioObj.duration - audio.audioObj.currentTime ) * 1000);
    audio.seek(0);
    audio.start();
  }

  const onStop = id => {
    tracks.find(track => track.id === id).chnl.pause();
  };
  
  const looper = new AudioLooper(onPlay, onStop);


  const mainDiv = document.createElement('div');
  mainDiv.class = 'main';

  const recordBtn = document.createElement('button');
  const stopRecordBtn = document.createElement('button');

  recordBtn.textContent = 'Start recording';
  stopRecordBtn.textContent = 'Stop recording';

  recordBtn.addEventListener('click', e => {
    recordy.startRecording();
  });

  stopRecordBtn.addEventListener('click', e => {
    recordy.stopRecording(true) // TRUE == Create audio object
      .then(audio => {

        const audioChnl = new AudioChnl(audioCtx, audio, () => {
        audioChnl.connect(audioCtx.destination);
        audioChnl.effects.delay.enable();

          tracks.push({
            id: ++id,
            chnl: audioChnl
          });

          looper.addTrack({
            id,
            duration: audio.duration
          });

          if(tracks.length === 1) {
            // First track was added -> always send sync message to looper Thread
            looper.syncFirstTrack( tracks[0].chnl.audioObj );
          }

      });

      });
  });

  mainDiv.appendChild(recordBtn);
  mainDiv.appendChild(stopRecordBtn);
  mainDiv.appendChild(alertDiv);

  document.querySelector('#app').appendChild(mainDiv);
}
