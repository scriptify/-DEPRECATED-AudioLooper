import Chnl from 'webaudio-chnl';


export default class AudioChnl extends Chnl {

  audioObj;

  constructor(audioCtx, audioObj) {
    super(audioCtx);
    this.audioObj = audioObj;
  }

  start() {
    this.audioObj.play();
  }

  stop() {
    this.pause();
    this.audioObj.currentTime = 0;
  }

  pause() {
    this.audioObj.pause();
  }

}

/*const audioCtx = new AudioContext();
const audio = new Audio(song);
const audioChnl = new AudioChnl(audioCtx, audio);
audioChnl.start();
window.setTimeout(() => {
  audioChnl.pause();
  window.setTimeout(() => {
    audioChnl.start();
  }, 4000);
}, 6000);*/
