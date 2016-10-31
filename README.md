 # AudioLooper - Looping made easy

## What is an AudioLooper?

An AudioLooper let's you loop your Audio-objects in a very simple and intuitive way.
The looping algorithm keeps the tracks in sync.
The algorithm is executed in a seperated thread(a Web Worker) because of the enhanced performance, which is the most important thing to have for an exact timing.

## How does it work?

The looping algorithm keeps all tracks in sync according to the first added track.

### Technical Details

The looping algorithm is executed in a Web Worker. Web Workers can't interact with the DOM APIs, so passing all tracks as direct references to the Audio-object is technically not possible. Therefore, you just pass an id (to identify the tracks) and the duration of the track. The algorithm then just works with these 'virtual' tracks. When a track is played/stopped by the alogrithm, your callbacks get executed. To enhance accuracy, you can continuously call a function which syncs the real track (so the audio-object in your UI-thread) with the virtual track in the other thread. This (as far as I was able to test it) increases accuracy up to over 90%. Still, sometimes there are delays (as far as I was able to test it, the delays had a length of ~2-10ms, so they weren't noticeable).

## Usage

### Creating an AudioLooper
```javascript
AudioLooper(onPlay, onStop)
```

You can construct a new AudioLooper object with this constructor.
The arguments are:
1. __onPlay: _function___

  This function gets exectued everytime a track needs to be played (according to the algorithm). The function takes 1 argument: The _id_ of the track (you determined it before when you added the track to the looper). In the body of this function you can react accordingly to the play action: Here you would play your 'real' tracks, so the audio-objects you created (which can be identified by an id, which were also determined by you).

2. __onStop: _function___

  This function is comparable to the _onPlay_ - callback. The function takes 1 argument: The _id_ of the track. The only difference is that this function gets called when a track needs to be stopped.


### Adding a track

```javascript
.add( { id, duration } )
```

This method add a track to the looper, so it can be processed by the algorithm.

### Removing a track

### Playing a track

### Stopping a track

### Syncing the _virtual_ first track with _real_ first track
