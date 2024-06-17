/*
  Alt-Enter: Evaluate Line in Live Mode
  Alt-Shift-Enter: Evaluate Block in Live Mode
*/
/*
  Clone of the Dato DUO
  Synth for two
*/

let player = 'synth' //synth or seq

let toneSig = new Tone.Signal()
let tonePitchshift = new Tone.Multiply()
let sawPitchshift = new Tone.Multiply()
let pulseWav = new Tone.PulseOscillator().start()
let sawWav = new Tone.Oscillator({type:'sawtooth'}).start()
let toneMixer = new Tone.Multiply()
let sawMixer = new Tone.Multiply()
let cutoffSig = new Tone.Signal()
let filterEnvelope = new Tone.Envelope()
let filterDepth = new Tone.Multiply()
let filterMultiplier = new Tone.Multiply()
let filter = new Tone.Filter()
let ampEnvelope = new Tone.Envelope()
let amp = new Tone.Multiply()
let dist = new Tone.Distortion(0.9)
let crusher = new Tone.BitCrusher(2)
let delay = new Tone.FeedbackDelay()
let masterOut = new Tone.Multiply(0.05).toDestination()

//let scope = new Oscilloscope('Canvas3')

//connect the initial signal to multipliers for pitch shift
//connect those to the oscillators
toneSig.connect(tonePitchshift), tonePitchshift.connect(pulseWav.frequency)
toneSig.connect(sawPitchshift), sawPitchshift.connect(sawWav.frequency)

toneSig.value = 500;
tonePitchshift.factor.value = 1;
sawPitchshift.factor.value = 1;

//connect the oscillators to a mixer and add them together
pulseWav.connect(toneMixer), toneMixer.connect(filter)
sawWav.connect(sawMixer), sawMixer.connect(filter)

toneMixer.factor.value = 1
sawMixer.factor.value = 1

//Connect the filter (VCF)
filterEnvelope.connect(filterDepth)
cutoffSig.connect(filter.frequency)
filterDepth.connect(filter.frequency)

cutoffSig.value = 1000
filterDepth.factor.value = 1000
filterEnvelope.attack = 0.2
filterEnvelope.decay = 0.1
filterEnvelope.sustain = 0.4
filterEnvelope.release = 0.2
filter.rolloff = -24
filter.Q.value = 1

//Connect the ASDR (VCA)
filter.connect(amp)

ampEnvelope.connect(amp.factor)
ampEnvelope.attack = 0.1
ampEnvelope.delay = 0.1
ampEnvelope.sustain = 0.9
ampEnvelope.release = 0.1

//effects chain

amp.connect(dist)
dist.connect(crusher)
crusher.connect(delay)
delay.connect(masterOut)

//masterOut.connect(scope.input)

//MIDI integration
/*
setNoteOnHandler( (note,vel)=>{
})

setNoteOffHandler( (note,vel)=>{
})
*/

//GUI
//All the effects start on even when they not supposed to

//implement portamento on the sequencer side

//accent should also increase volume. is there a way to get some make up
//gain whenever I hit accent

//beatpads don't work when you hit them twice fast

//hone in the sound design of the vcf envelope and vca envelope
//really all the different parameters to make it sound like the duo

// join collab-hub room
ch.joinRoom('dataduo-21m080');

const gui = new p5( sketch, 'p5-container' )
/*
gui.setTheme('default')
gui.listThemes() 

gui.setThemeParameters({
  titleFont: 'Helvetica', 
  borderColor: [200,200,200]
  //backgroundColor: [222,220,216]
})
*/

let distortion_toggle =  gui.Toggle({
  label:'Accent',
  mapto: dist.wet,
  x: 85, y:10, size: 0.8,
  link: 'dist'
})
distortion_toggle.accentColor = [51,145,219]
dist.wet.value = 0

let crusher_toggle =  gui.Toggle({
  label:'bitcrusher',
  mapto: crusher.wet,
  x: 90, y:25, size: 0.8,
  link: 'crusher'
})
crusher_toggle.accentColor = [46,152,99]
crusher.wet.value = 0

let glide_toggle =  gui.Toggle({
  label:'Glide',
  callback: function(){}, //portamento on sequencer side
  x: 15, y:10, size: 0.8,
  link: 'glide'
})
glide_toggle.accentColor = [51,145,219]

let delay_toggle =  gui.Toggle({
  label:'Delay',
  mapto: delay.wet,
  x: 10, y:25, size: 0.8,
  link: 'delay'
})
delay_toggle.accentColor = [46,152,99]
delay.wet.value = 0

let wave_fader = gui.Slider({
  label:'wave',
  mapto: pulseWav.width,
  x: 39, y: 5, size: 2,
  min:0, max: 1,
  orientation: 'vertical',
  showValue: false, 
  link: 'wave'
})
wave_fader.accentColor = [247, 5, 5]
wave_fader.borderColor = [20, 20, 20]
wave_fader.set(0.5)

let freq_fader = gui.Slider({
  label:'freq',
  callback: function(x){ cutoffSig.value = x},
  x: 49, y: 5, size: 2,
  min:500, max: 2000,
  orientation: 'vertical',
  showValue: false,
  link: 'freq'
})
freq_fader.accentColor = [247, 5, 5]
freq_fader.borderColor = [20, 20, 20]
freq_fader.set(1250)

let release_fader = gui.Slider({
  label:'release',
  callback: function(x){ filterEnvelope.release = x},
  x: 59, y: 5, size: 2,
  min:0, max: 5,
  orientation: 'vertical',
  showValue: false,
  link: 'release'
})
release_fader.accentColor = [247, 5, 5]
release_fader.borderColor = [20, 20, 20]
release_fader.set(2.5)

let resonance_knob = gui.Knob({
  label:'res',
  callback: function(x){ filter.Q.value = x},
  x: 49.5, y: 43, size:.25,
  min:0.99999, max: 100, curve: 2,
  showValue: false,
  link: 'res'
})
resonance_knob.accentColor = [49,48,55]
resonance_knob.set( 1 )

let detune_knob = gui.Knob({
  label:'detune',
  mapto: tonePitchshift.factor,
  x: 22, y: 25, size:.25,
  min:0.99999, max: 3, curve: 1,
  showValue: false,
  link: 'detune'
})
detune_knob.accentColor = [49,48,55]
detune_knob.set( 1 )

let speaker_knob = gui.Knob({
  label:'gain',
  mapto: masterOut.factor,
  x: 78, y: 25, size:.25,
  min:0, max: 0.1, curve: 2,
  showValue: false,
  link: 'gain'
})
speaker_knob.accentColor = [49,48,55]
speaker_knob.set( 0.05 )

//sampler - beatpads

let kick = "audio/drums-003.mp3"
let snare = "audio/snare.mp3"
const kickPlayer = new Tone.Player(kick).toDestination()
const snarePlayer = new Tone.Player(snare).toDestination()
kickPlayer.playbackRate = 1
snarePlayer.playbackRate = 1

//trigger playback of the loaded soundfile

let kick_trigger = gui.Button({
  label:'kick',
  callback: function(){ kickPlayer.start()},
  size: 1, border: 20,
  x:30, y:40, size: 1,
  link: 'kick'
})
kick_trigger.accentColor = [20,20,20]

let snare_trigger = gui.Button({
  label:'snare',
  callback: function(){ snarePlayer.start()},
  size: 1, border: 20,
  x:70, y:40, size: 1,
  link: 'snare',
})
snare_trigger.accentColor = [20,20,20]

let lineA = gui.Line(0,50,100,50,{
  border:4
})

//define our scale, sequence, octave, and index
let pitches = [60,60,60,60, 60,60,60,60]
let scale = [0,3,5, 7, 10]
let octave = 4
let index = 0
let transpose = 0
let isBoost = false
let isRandom = false




//convert scale degrees to midi notes
const scaleToMidi = function(degree){
  //if our degree is larger than the length of the scale
  let cur_octave = Math.floor(degree/scale.length)
  degree = degree % scale.length
  return scale[degree] + cur_octave * 12
}
  


const sequence = new Tone.Sequence( (time, note) => {
  //calculate freq for note
  let pitch = Tone.Midi(pitches[index]+octave*12+transpose).toFrequency()
  toneSig.setValueAtTime(pitch, time);
  if (isRandom){
  let pitch = Tone.Midi(pitches[Math.floor(Math.random()*8)]+octave*12+transpose).toFrequency()
  toneSig.setValueAtTime(pitch, time);
  }
  //vco.frequency.exponentialRampToValueAtTime(pitch, time+1);
  ampEnvelope.triggerAttackRelease(.1, time); 
  ampEnvelope.triggerAttackRelease(.1, time); 
  //update index
  index = ( index+1 ) % pitches.length
  },
  pitches, // Sequence of note names - ignored
  '8n'// Time interval between each note
);
console.log(sequence.get())
let seq_knobs = []
let fader_spacing = 8
for( let i=0;i<pitches.length;i++){
  seq_knobs.push(gui.Fader({
    label: (i).toString(),showLabel:0,
    callback: function(x){
      pitches[i]= scaleToMidi(Math.floor(x))
    },
    min:0,max:12, value:Math.random()*12,
    size: 1, x: 21.5 + i*fader_spacing, y: 80
    
  }))
}
let isTransportRunning = true // opposite because will be flipped on initiation callback 
let toggleButton = gui.Toggle({
  label:'On/Off',
  callback:
  function toggleTransport() {
  if (isTransportRunning) {
    Tone.Transport.stop();
    console.log('stopped transport')
  } else {
    Tone.Transport.start();
    console.log('started transport')
  }
  isTransportRunning = !isTransportRunning;
},
  x: 50, y:70, size: 0.5,
  link: 'on-off'
})

let tempoKnob = gui.Knob({
  label: 'Tempo',
  callback: function(x){
    Tone.Transport.bpm.value = x;
  },
  x: 78, y: 70,
  min:30, max:250, curve: 1, size: 0.3,
  link: 'tempo'
})
let lengthKnob = gui.Knob({
  label: 'Note Length',
  callback: function(x){ampEnvelope.decay = x
    ampEnvelope.release = x},
  min: 0.1, max: 1, curve: 2, size: 1,
  x: 22, y: 70, size: 0.3,
  link: 'note-length'
})

let transposeAdd = gui.Button({
  label: 'Transpose +',
  callback: function() {
    transpose += 1
  },
  x: 88, y: 87, size: 0.6,
  link: 'transpose+'
})

let transposeSubtract = gui.Button({
  label: 'Transpose -',
  callback: function subtractnote(){
    transpose -= 1
  },
  x: 12, y: 87, size: 0.6,
  link: 'transpose-'
})


let booster = gui.Toggle({
  label: 'Boost',
  callback: function boosted(){
  if (isBoost) {
    sequence.playbackRate = 2;
  } else {
    sequence.playbackRate = 1;
  }
  isBoost = !isBoost;
  },
  x: 70, y: 59, size: 0.8,
  link: 'boost'
})

let rand = gui.Toggle({
  label: 'Random',
  callback: function(x){
  isRandom = x
  },
  x: 30, y:59, size: 0.8,
  link: 'random'
})
isRandom = false

//start sequence
sequence.start()
//sequence.stop()

startEnable = 0

//this start button exists just to enable audio
//there are probably other ways to call Tone.start(). . . .
startButton.addEventListener('click', () => {
  if (startEnable == 0) {
    // Start the hihat if it's not already playing
    Tone.start()
    Tone.Transport.stop();
    console.log('start');
    startEnable = 1

    document.getElementById('startStatus').innerHTML = 'Enabled';
  } else {
    console.log('stop');
    startEnable = 0
  }
});