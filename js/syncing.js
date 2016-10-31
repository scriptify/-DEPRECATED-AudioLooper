  import InlineWorker from 'inline-worker';

export default function createSyncWorker() {
  return new InlineWorker( createSyncer );
}

function createSyncer() {

  // No webpack imports possible in the inline worker function
  // TODO: Fix this by forking the inline-worker repo and fixing it!

  const ADD_TRACK = 'ADD_TRACK';
  const PLAY = 'PLAY';
  const STOP = 'STOP';
  const REMOVE_TRACK = 'REMOVE_TRACK';
  const SYNC = 'SYNC';
  const FIRST_SYNC = 'FIRST_SYNC';


  const post = obj => {
    self.postMessage(JSON.stringify(obj));
  };

  let tracks = [];

  const loop = fn => {
    // Same like setInterval, but with the passed time since last interval as 1° argument
    let currTime = performance.now();
    let timePlayed = 0;


    setInterval(() => {

      const newTime = performance.now();
      const diff = newTime - currTime;
      currTime = newTime;
      fn(diff);

    }, 0);
  };

  const algorithm = (tracks, playTrack, lastPlayed = -1) => {
    const firstTrack = tracks.find(track => track.isFirstTrack);

    if((lastPlayed + 1) < firstTrack.currentPercentualTime) {
      //console.log(firstTrack.currentPercentualTime);
      lastPlayed = lastPlayed + 1;
      tracks.forEach(track => {
        if(lastPlayed % track.maxPercentualTime === 0 && track.shouldPlay) {
          playTrack(track.id);
        }
      });
    }

    return lastPlayed;

  };

  function syncTracks(tracks, onPlay) {

    let lastPlayed = undefined;

    loop(timePassed => {

      const firstTrack = tracks.find(track => track.isFirstTrack);
      if(!firstTrack)
        return;
      // Add percentage to firstTrackPercentage
      firstTrack.currentPercentualTime +=  (timePassed / 1000) / firstTrack.duration;

      // Make first sync here: Look if there are any tracks which weren't synced once
      tracks.forEach(track => {
        if(!track.firstSync && track !== firstTrack) {
          const floored = Math.floor( firstTrack.currentPercentualTime );
          let percVal = firstTrack.currentPercentualTime;
          if(floored >= track.maxPercentualTime) {
            percVal = (track.maxPercentualTime - 1) + (firstTrack.currentPercentualTime - floored);
          }

          const numVal = firstTrack.duration * percVal;
          console.log(`PercVal: ${percVal} || NumVal: ${numVal} || Track duration: ${track.duration}`);
          if(numVal <= track.duration) { // So if the actual position where it should be played now (according to the sync) is greater than the duration of the same, of course it's not played; But it will be played with the algorithm;
            post({ type: FIRST_SYNC, id: track.id, payload: numVal });
          }

          track.firstSync = true;
        }
      });

      lastPlayed = algorithm(tracks, onPlay, lastPlayed);

    });

  }

  function addTrack(tracks, duration, id) {
    const isFirstTrack = (tracks.length === 0);
    let maxPercentualTime = 1;

    if(!isFirstTrack) {
      const firstTrack = tracks.find(track => track.isFirstTrack);
      maxPercentualTime = Math.ceil(duration / firstTrack.duration);
    }

    tracks.push({
      id,
      duration,
      isFirstTrack,
      shouldPlay: true,
      currentPercentualTime: 0, // Only relevant for first track
      maxPercentualTime,
      firstSync: true // Determine if the FIRST_SYNC method was executed once in the main thread (to sync new tracks so that they can be directly played)
    });
  }

  self.addEventListener('message', json => {

    const { type, payload } = JSON.parse(json.data);

    const { id } = payload;

    switch(type) {

      case ADD_TRACK:
        const { duration } = payload;
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
        post({ type: STOP, id })
      break;

      case SYNC:
        // Sync message from ui Thread -> Sync first track with the REAL currentTime
        const currentTime = payload;
        const firstTrack = tracks.find(track => track.isFirstTrack);
        // Update value
        // Always add the difference of the percentual progress of the real track and the actual percentual progress of the track
        firstTrack.currentPercentualTime += (currentTime / firstTrack.duration) - (firstTrack.currentPercentualTime - Math.floor( firstTrack.currentPercentualTime ));
      break;

    }
  });

  syncTracks(tracks, id => {
    post({ type: PLAY, id });
  });

}
