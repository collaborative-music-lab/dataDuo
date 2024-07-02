/*
  Alt-Enter: Evaluate Line in Live Mode
  Alt-Shift-Enter: Evaluate Block in Live Mode
*/
/*
  Clone of the Dato DUO
  Synth for two
*/

let player = 'synth' //synth or seq
let isGlide = false

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

cutoffSig.value = 1500
filterDepth.factor.value = 5000
filterEnvelope.attack = 0.1
filterEnvelope.decay = 0.1
filterEnvelope.sustain = 1
filterEnvelope.release = 0.2
filter.rolloff = -24
filter.Q.value = 1

//Connect the ASDR (VCA)
filter.connect(amp)

ampEnvelope.connect(amp.factor)
ampEnvelope.attack = 0.3
ampEnvelope.delay = 0.1
ampEnvelope.sustain = 1
ampEnvelope.release = 0.9

//effects chain

let dist = new Tone.Distortion(0.9)
let crusher = new Tone.BitCrusher(2)
let delay = new Tone.FeedbackDelay()


let distgain = new Tone.Multiply(1)
let crushgain = new Tone.Multiply(1)
let delaygain = new Tone.Multiply(1)
let delayFilter = new Tone.Filter()
let lfo = new Tone.LFO("8n", 500, 2000)

let distout = new Tone.Add()
let crushout = new Tone.Add()
let delayout = new Tone.Add()

//distortion
amp.connect(distout)
amp.connect(distgain)
distgain.connect(dist)
dist.connect(distout)

//bitcrusher
distout.connect(crushout)
distout.connect(crushgain)
crushgain.connect(crusher)
crusher.connect(crushout)

//delay
crushout.connect(delayout)
crushout.connect(delaygain)
delaygain.connect(delay)
delay.connect(delayFilter)
lfo.connect(delayFilter.frequency)
delayFilter.connect(delayout)
delayout.connect(masterOut)

// join collab-hub room
ch.joinRoom('dataduo-21m080')

const gui = new p5( sketch, 'p5-container' )

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
  callback: function(x){isGlide = x},
  x: 15, y:10, size: 0.8,
  link: 'glide'
})
glide_toggle.accentColor = [51,145,219]
/*
let delay_toggle =  gui.Toggle({
  label:'Delay',
  mapto: delay.wet,
  x: 10, y:25, size: 0.8,
  link: 'delay'
})
delay_toggle.accentColor = [46,152,99]
delay.wet.value = 0
*/

let delay_knob = gui.Knob({
  label:'Delay Control',
  callback: function(x){delayControl(x)},  //TO DOOO make this knob change aspects of the delay
  x: 10, y: 25, size:0.8,
  min:0.001, max: 1, curve: 1,
  showValue: false,
  link: 'delayknob'
})
delay_knob.accentColor = [49,48,55]
delay_knob.set( 0.0001 )

function delayControl(x) {
  delay.feedback.value = stepper(x, 0 , 1 , [[0,0], [0.02, 0], [0.8,0.6], [1,1]])
  delay.wet.value = stepper(x , 0, 1, [[0,0], [0.02, 0], [0.04, 1], [1,1]])
  delaygain.factor.value = stepper(x , 0, 1, [[0,0], [0.02, 0], [0.04, 0.3], [0.4, 0.5], [1,1]])
  lfo.amplitude = stepper(x , 0, 1, [[0,0], [0.5, 0], [0.7, 0.5], [1,1]])
}

let wave_fader = gui.Slider({
  label:'wave',
  //mapto: pulseWav.width,
  x: 39, y: 5, size: 2,
  min:0, max: 1,
  callback: function(x){pulseWav.width.value = stepper(x, 0, 1, [[0,0], [0.4, 0.6], [1,1]])},
  orientation: 'vertical',
  showValue: false, 
  link: 'wave'
})
wave_fader.accentColor = [247, 5, 5]
wave_fader.borderColor = [20, 20, 20]
wave_fader.set(0.5)

let freq_fader = gui.Slider({
  label:'freq',
  callback: function(x){cutoffSig.value = stepper(x, 200, 1200, [[0,0], [0.6, 0.8], [1,1]])},
  x: 49, y: 5, size: 2,
  min:200, max: 1200,
  orientation: 'vertical',
  showValue: false,
  link: 'freq'
})
freq_fader.accentColor = [247, 5, 5]
freq_fader.borderColor = [20, 20, 20]
freq_fader.set(700)

let release_fader = gui.Slider({
  label:'release',
  callback: function(x){ filterEnvelope.release = stepper(x, 0.1, 1.5, [[0,0], [0.8, 0.5], [1,1]])},
  x: 59, y: 5, size: 2,
  min:0.1, max: 1.5,
  orientation: 'vertical',
  showValue: false,
  link: 'release'
})
release_fader.accentColor = [247, 5, 5]
release_fader.borderColor = [20, 20, 20]
release_fader.set(0.8)

let resonance_knob = gui.Knob({
  label:'res',
  callback: function(x){ filter.Q.value = x},
  x: 49.5, y: 43, size:.25,
  min:0.99999, max: 30, curve: 2,
  showValue: false,
  link: 'res'
})
resonance_knob.accentColor = [49,48,55]
resonance_knob.set( 1 )

let detune_knob = gui.Knob({
  label:'detune',
  mapto: tonePitchshift.factor,
  x: 22, y: 25, size:.25,
  min:0.99999, max: 2, curve: 1,
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
  callback: function(){ snarePlayer.start(); ch.event('snare')},
  size: 1, border: 20,
  x:70, y:40, size: 1,
  link: 'snare',
})
snare_trigger.accentColor = [20,20,20]

let lineA = gui.Line(0,50,100,50,{
  border:4
})

//define our scale, sequence, octave, and index
let pitches = [0,0,0,0,0,0,0,0]
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
let disable_array = [true, true, true, true, true, true, true, true]
let global_disable = [true, true, true, true, true, true, true, true]
const sequence = new Tone.Sequence( (time, note) => {
  if (!disable_array[index]) {
    index = ( index+1 )
    return
  }
  
  //calculate freq for note
  let pitch = Tone.Midi(pitches[index]+octave*12+transpose).toFrequency()
  toneSig.setValueAtTime(pitch, time);
  if (isRandom){
    let pitch = Tone.Midi(pitches[Math.floor(Math.random()*8)]+octave*12+transpose).toFrequency()
    toneSig.setValueAtTime(pitch, time);
  }
  if (isGlide) {
    toneSig.exponentialRampToValueAtTime(pitch, time + 1);
  }
  ampEnvelope.triggerAttackRelease(.1, time); 
  filterEnvelope.triggerAttackRelease(.1, time);
  ampEnvelope.triggerAttackRelease(.1, time); 
  filterEnvelope.triggerAttackRelease(.1, time);
  //update index
  index = ( index+1 ) % pitches.length
  },
  pitches, // Sequence of note names - ignored
  '8n'// Time interval between each note
);


let seq_knobs = []
let fader_spacing = 8
for( let i=0;i<pitches.length;i++){
  seq_knobs.push(gui.Fader({
    label: (i).toString(),showLabel:0,
    callback: function(x){
      pitches[i]= scaleToMidi(Math.floor(x))
    },
    min:0.01,max:12, value:Math.random()*12,
    size: 1, x: 20 + i*fader_spacing, y: 77,
    link: 'seq' + i
    // link: (x) => {ch.control('pitches', pitches)}
  }))
}

// ch.on('pitches', ({ values }) => {
//   pitches = values
//   for( let i=0; i<pitches.length; i++){
//     seq_knobs[i].forceSet(pitches[i])     // forceSet sets the new values without sending the collab hub messages
//   }
// });

let disable_toggles = []
for( let i=0; i<pitches.length; i++){
  disable_toggles.push(gui.Toggle({
    label: "OFF",
    callback: function(){
      if (global_disable[i]) {
      disable_array[i] = true;
    } 
      else {
      disable_array[i] = false;
    }
    global_disable[i] = !global_disable[i];
    },
    size: .5, x: 20 + i*fader_spacing, y: 95,
    link: (x) => {ch.control('disable_array', disable_array)}
  }))
}

ch.on('disable_array', ({ values }) => {
  disable_array = values
  for( let i=0;i<pitches.length;i++){
    if (disable_array[i]) {
      disable_toggles[i].forceSet(false)
    } 
    else {
      disable_toggles[i].forceSet(true)
    }
  }
})


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

/*
 * Helper function for creating a custom curve for GUI elements
 *
 * input : input of the stepper function
 * min: minimmum value of the element
 * max: maximmum value of the element
 * steps: array of arrays in format [[0,0], [a,b], .... [1,1]] where each point is a step in the curve
 * 
 * x values are how much the GUI element is turned
 * y values are the level the elements are at internally
*/

function stepper(input, min, max, steps) {
  let range = max - min
  let rawval = (input - min) / range
  const gui_values = []
  const internal_values = []
  for (let i = 0; i < steps.length ; i++) {
    gui_values.push(steps[i][0])
    internal_values.push(steps[i][1])
  }
  let index = 0
  while(index < gui_values.length) {
    if (rawval < gui_values[index]) {
      let slope = (internal_values[index] - internal_values[index - 1])/(gui_values[index] - gui_values[index-1])
      let rawCurved = internal_values[index-1] + slope * (rawval - gui_values[index - 1]) 
      let realCurved = (rawCurved * range) + min
      console.log('input value', input)
      console.log('curved value', realCurved)
      return realCurved
    }
    index++
  }
  return max
}


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


setCCHandler((midi, value) => 
  { console.log(midi, value)
    if (midi < 8){
    seq_knobs[midi].set(value/10.583333)
  }
    if (63 < midi < 72){
        if (value>0){
          disable_toggles[midi-64].set(disable_toggles[midi-64].value == 0)
    }
  }
    else{
    switch(midi){
      case 16: wave_fader.set(value/127); break;
      case 17: if (value/0.0635 > 500){
        freq_fader.set(value/0.0635)
        }
        else{
          freq_fader.set(500)
        }
        break
      case 18: release_fader.set(value/25.4); break;
      case 19:  detune_knob.set(value/63.5)   //I CHANGED THE RELEASE MIN/MAX - knob should be adjusted
       
    
      case 20: if (value/4.23333 > 1){
        resonance_knob.set(value/4.23333)   //I CHANGED THE RESONANCE MIN/MAX - should be fine as is
        }
        else{
          resonance_knob.set(1)
        }
        break
      case 21: speaker_knob.set(value/1270); break;
      case 22: if (value/127 > 0.1){
        lengthKnob. set(value/127)
        }
        else{
          lengthKnob.set(0.1)
        }
        break
      case 23: if (value/0.508 > 30){
        tempoKnob. set(value/0.508)
        }
        else{
          tempoKnob.set(30)
        }
        break
      case 41: if (value>0){
        toggleButton.set(toggleButton.value==0)}; break;
      case 43: if (value>0){
        rand.set(rand.value == 0)}; break;  
      case 44: if (value>0){
        booster.set(booster.value == 0)}; break;
      case 61: transposeSubtract.set(value/127); break;
      case 62: transposeAdd.set(value/127); break;
      case 42: if (value>0){
        delay_toggle.set(delay_toggle.value==0)}; break;
      case 45: if (value>0){
        crusher_toggle.set(crusher_toggle.value==0)}; break;
      case 60: if (value>0){
        distortion_toggle.set(distortion_toggle.value==0)}; break;
      case 46: if (value>0){
        glide_toggle.set(glide_toggle.value==0)}; break;
      case 58: kick_trigger.set(value/127); break;
      case 59: snare_trigger.set(value/127); break;
    }
  }
})



let lineB = gui.Line(0,100,100,100,{
  border:4
})