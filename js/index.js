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
