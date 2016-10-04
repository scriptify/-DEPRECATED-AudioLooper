import { ADD_TRACK, PLAY, STOP, REMOVE_TRACK } from './constants.js';

const loop = fn => {
  // Same like setInterval, but with the passed time since last interval as 1° argument
  let currTime = Date.now();
  let timePlayed = 0;


  setInterval(() => {

    const newTime = Date.now();
    const diff = newTime - currTime;
    currTime = newTime;
    fn(diff);

  }, 0);
};

let tracks = [];

const algorithm = (tracks, playTrack, alreadyPlayed = []) => {
  const firstTrack = tracks.find(track => track.isFirstTrack);
  const num = Math.round(firstTrack.currentPercentualTime * 100) / 100;

  if( Number.isInteger( num ) && !alreadyPlayed.includes(num) ) {
    tracks.forEach(track => {
      //console.log(`${num} % ${track.maxPercentualTime} = ${num % track.maxPercentualTime}, ${firstTrack.currentPercentualTime}`)
      //console.log(`${num} % ${track.maxPercentualTime} = ${num % track.maxPercentualTime === 0}`)
      if(num % track.maxPercentualTime === 0 && track.shouldPlay) {
        playTrack(track.id);
      }
    });
  }

  return num;

};

function syncTracks(tracks, onPlay) {

  let alreadyPlayed = [];

  loop(timePassed => {

    const firstTrack = tracks.find(track => track.isFirstTrack);
    if(!firstTrack)
      return;
    // Add percentage to firstTrackPercentage
    firstTrack.currentPercentualTime +=  (timePassed / 1000) / firstTrack.duration;
    alreadyPlayed.push( algorithm(tracks, onPlay, alreadyPlayed) );

  });

}

function addTrack(tracks, duration, id) {
  const isFirstTrack = (tracks.length === 0);
  let maxPercentualTime = 1;

  if(!isFirstTrack) {
    const firstTrack = tracks.find(track => track.isFirstTrack);
    maxPercentualTime = Math.ceil((firstTrack.duration / 100) * duration);
  }

  tracks.push({
    id,
    duration,
    isFirstTrack,
    shouldPlay: true,
    currentPercentualTime: 0, // Only relevant for first track
    maxPercentualTime
  });
}

self.addEventListener('message', ({ data: { type, id, duration } }) => {
  switch(type) {

    case ADD_TRACK:
      addTrack(tracks, duration, id);
    break;

    case REMOVE_TRACK:
      tracks.splice( tracks.find(track => track.id === id), 1 );
    break;

    case PLAY:
      const playTrack = tracks.find(track => track.id === id);
      playTrack.shouldPlay = true;
    break;

    case STOP:
      const stopTrack = tracks.find(track => track.id === id);
      playTrack.shouldPlay = false;
      self.postMessage({ type: STOP, id })
    break;
  }
});

syncTracks(tracks, id => {
  self.postMessage({ type: PLAY, id });
});
