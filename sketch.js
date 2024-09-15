/*
  Alt-Enter: Evaluate Line in Live Mode
  Alt-Shift-Enter: Evaluate Block in Live Mode
*/
/*
  Clone of the Dato DUO
  Synth for two
*/

const gui = new p5( sketch, 'p5-container' )


let player = 'synth' //synth or seq
let isGlide = false
let sustainTime = .1

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
let masterOut = new Tone.Multiply({factor:0.05, channelCount:2}).toDestination()

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

toneMixer.factor.value = .3
sawMixer.factor.value = .3

//Connect the filter (VCF)
filterEnvelope.connect(filterDepth)
cutoffSig.connect(filter.frequency)
filterDepth.connect(filter.frequency)

cutoffSig.value = 1500
filterDepth.factor.value = 5000
filterEnvelope.attack = 0.01
filterEnvelope.decay = 0.1
filterEnvelope.sustain = .5
filterEnvelope.release = 0.2
filter.rolloff = -24
filter.Q.value = 1
//filterEnvelope.releaseCurve = 'linear'

//Connect the ASDR (VCA)
filter.connect(amp)

ampEnvelope.connect(amp.factor)
ampEnvelope.attack = 0.3
ampEnvelope.delay = 0.1
ampEnvelope.sustain = .5
ampEnvelope.release = 0.9
ampEnvelope.releaseCurve = 'linear'

//effects chain

let dist = new Tone.Distortion()
let crusher = new Tone.BitCrusher(2)
let delay = new Tone.FeedbackDelay()
let delay2 = new Tone.FeedbackDelay(.0)
delay2.wet.value = 1



let distgain = new Tone.Multiply(1)
let crushgain = new Tone.Multiply(1)
let delaygain = new Tone.Multiply(1)
let delayFilter = new Tone.Filter()
let lfo = new Tone.LFO("8n", 500, 2000)
let lfo2 = new Tone.LFO(.2, .01, .015)
lfo2.connect(delay2.delayTime)

const leftPanner = new Tone.Panner(-1); // Pan fully left
const rightPanner = new Tone.Panner(1); // Pan fully right
leftPanner.connect(masterOut)
rightPanner.connect(masterOut)

let distout = new Tone.Add()
let crushout = new Tone.Add()
let delayout = new Tone.Add()

//distortion
amp.connect(distgain)
distgain.connect(dist)
dist.connect(distout)

//bitcrusher
distout.connect(crushgain)
crushgain.connect(crusher)
crusher.connect(crushout)

//delay
crushout.connect(delaygain)
crushout.connect(masterOut)
delaygain.connect(delay)
delay.connect(delayFilter)
lfo.connect(delayFilter.frequency)
delayFilter.connect(delayout)
delayout.connect(leftPanner)
delayout.connect(delay2)
delay2.connect(rightPanner)


// join collab-hub room
//ch.joinRoom('dataduo-21m080')

dist.wet.value = 1
let distortion_toggle =  gui.Knob({
  label:'Dist',
  //mapto: dist.distortion,
  callback: (x)=>{
    dist.distortion = x
    dist.wet.value = x
  },
  x: 85, y:10, size: 0.8,
  link: 'dist', value: 0
})
distortion_toggle.accentColor = [51,145,219]


crusher.wet.value = 1
let crusher_toggle =  gui.Knob({
  label:'bitcrusher',
  mapto: crusher.bits,
  //callback: x=>{crusher.bits =
  x: 90, y:25, size: 0.8, max: 16, min: 2,
  link: 'crusher', value: 16
})
crusher_toggle.accentColor = [46,152,99]


let glide_toggle =  gui.Momentary({
  label:`Glide \n ( ' )`,
  callback: function(x){isGlide = x},
  x: 15, y:10, size: 0.8,
  link: 'glide',
  textSize: 1.5
})
glide_toggle.accentColor = [51,145,219]
glide_toggle.set(0)
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
  min:0, max: 1, curve: 2,
  showValue: false,
  link: 'delayknob'
})
delay_knob.accentColor = [49,48,55]
delay_knob.set( 0.0001 )

function delayControl(x) {
  delay.feedback.value = stepper(x, 0 , 1 , [[0,0], [0.02, 0], [0.8,0.6], [1,1]])
  //delay.wet.value = stepper(x , 0, 1, [[0,0], [0.02, 0], [0.04, 1], [1,1]])
  delaygain.factor.value = stepper(x , 0, 1, [[0,0], [0.02, 0], [0.04, 0.3], [0.4, 0.5], [1,1]])
  lfo.amplitude = stepper(x , 0, 1, [[0,0], [0.5, 0], [0.7, 0.5], [1,1]])
}
delay.wet.value = 1

let wave_fader = gui.Slider({
  label:'wave',
  //mapto: pulseWav.width,
  x: 39, y: 5, size: 2,
  min:0, max: 1,
  callback: x=>{
    pulseWav.width.value = stepper(1-x, 0, 1, [[0,0], [0.4, 0.6], [1,1]])*.95
    toneMixer.factor.value = stepper(x, 0, 1, [[0,0], [0.5, 0.7], [1,1]]) *.3
    sawMixer.factor.value = stepper(1-x, 0, 1, [[0,0], [0.5, 0.7], [1,1]]) *.3
  },
  orientation: 'vertical',
  showValue: false, 
  link: 'wave',
  border:12
})
wave_fader.accentColor = [247, 5, 5]
wave_fader.borderColor = [20, 20, 20]
wave_fader.set(0.5)

let freq_fader = gui.Slider({
  label:'freq',
  callback: (x)=>{
        filterDepth.factor.value = x
        cutoffSig.value = x
      },
  x: 49, y: 5, size: 2,
  min:200, max: 1200,
  orientation: 'vertical',
  showValue: false,
  link: 'freq',
  border:12
})
freq_fader.accentColor = [247, 5, 5]
freq_fader.borderColor = [20, 20, 20]
freq_fader.set(700)

let release_fader = gui.Slider({
  label:'release',
  callback: (x)=>{ 
        ampEnvelope.attack = x<.5 ? 0.01 : x-.49 * Math.pow(x+.5,.75)
        ampEnvelope.decay = stepper(x, 0.1, 5, [[0,0], [0.8, 0.5], [1,5]])
        ampEnvelope.release = stepper(x, 0.1, 30, [[0,0], [0.8, 0.5], [1,5]])
        filterEnvelope.decay = stepper(x, 0.1, 5, [[0,0], [0.8, 0.5], [1,5]])
        filterEnvelope.release = stepper(x, 0.1, 30, [[0,0], [0.8, 0.5], [1,5]])
      },
  x: 59, y: 5, size: 2,
  min:0.1, max: 1.5,
  orientation: 'vertical',
  showValue: false,
  link: 'release',
  border:12
})
release_fader.accentColor = [247, 5, 5]
release_fader.borderColor = [20, 20, 20]
release_fader.set(0.8)

let resonance_knob = gui.Knob({
  label:'res',
  callback: function(x){ filter.Q.value = x},
  x: 49.5, y: 43, size:.5,
  min:0.99999, max: 30, curve: 2,
  showValue: false,
  link: 'res'
})
resonance_knob.accentColor = [49,48,55]
resonance_knob.set( 1 )

let detune_knob = gui.Knob({
  label:'detune',
  callback: x=>{
      tonePitchshift.factor.value = stepper(x,0.99999,2,[[0,0],[.25,.02],[.45,.49],[.55,.51],[.75,.98],[1,1]])/2
      //console.log(stepper(x,0.99999,2,[[0,0],[.25,.02],[.45,.49],[.55,.51],[.75,.98],[1,1]]))
    },
  x: 22, y: 25, size:.5,
  min:0.99999, max: 2, curve: 1,
  showValue: false,
  link: 'detune'
})
detune_knob.accentColor = [49,48,55]
detune_knob.set( 1 )

let speaker_knob = gui.Knob({
  label:'gain',
  mapto: masterOut.factor,
  x: 78, y: 25, size:.5,
  min:0, max: 0.1, curve: 2,
  showValue: false
})
speaker_knob.accentColor = [49,48,55]
speaker_knob.set( 0.05 )

//sampler - beatpads

kick = "audio/drums-003.mp3"
    snare = "audio/snare.mp3"
    //this.kickPlayer = new Tone.Player(this.kick).toDestination()
    kickPlayer = new Tone.Sampler({
      urls: {
        C4: "drums-003.mp3"
      },
      baseUrl: "/dataduo/audio/"
    }).toDestination()
    snarePlayer = new Tone.Sampler({
      urls: {
        C4: "snare.mp3"
      },
      baseUrl: "/dataduo/audio/"
    }).toDestination()
    //this.snarePlayer = new Tone.Player(this.snare).toDestination()
    kickPlayer.volume.value = -16
    snarePlayer.volume.value = -22
    // this.kickPlayer.playbackRate = 1
    // this.snarePlayer.playbackRate = 1

    //trigger playback of the loaded soundfile

    kick_trigger = gui.Button({
      label:'kick \n ( . )',
      callback: ()=>{ 
        kickPlayer.triggerAttack( 'C4')
         ch.event('kick')
      },
      size: 1, border: 20,
      x:30, y:40, size: 1,
      link: 'kick',
      textSize: 1.5
    })
    kick_trigger.accentColor = [20,20,20]

    snare_trigger = gui.Button({
      label:'snare \n ( / )',
      callback: ()=>{ 
        snarePlayer.triggerAttack( 'C4')
         ch.event('snare')
      },
      size: 1, border: 20,
      x:70, y:40, size: 1,
      link: 'snare',
      textSize: 1.5
    })
    snare_trigger.accentColor = [20,20,20]

let lineA = gui.Line(0,50,100,50,{
  border:4
})

//define our scale, sequence, octave, and index
let pitches = [0,0,0,0,0,0,0,0]
let scale = [0,3,5, 7, 10]
let octave = 4
let clock = 0
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
let enable_array = [true, true, true, true, true, true, true, true]

const sequence = new Tone.Sequence( (time, note) => {
  //update index
  clock = clock+1 

  //trigger drums
  if( clock % 2 == 0){
    if( kick_enable[Math.floor(clock/2)%8]){
      try {kickPlayer.triggerAttack( 'C4', time)}
      catch{}
    }
    if(snare_enable[Math.floor(clock/2)%8]){
      try {snarePlayer.triggerAttack( 'C4', time)}
      catch{}
    }
  }

  //if boost isn't activated only run on even clocks
  if (isBoost == 0 && clock%2 > 0) {
    return
  }
  
  //update index and get pitch
  if ( isBoost == 0 ) {
    index = Math.floor( clock/2 ) % pitches.length
  } else {
    index = clock % pitches.length
  }

  //if tranport is stopped or step is disabled
  if (isTransportRunning == 0 || enable_array[index] == false) {
    return
  }

  //calculate freq for note
  let pitch = Tone.Midi(pitches[index]+octave*12+transpose).toFrequency()
  
  //console.log(index, enable_array)

  //toneSig.setValueAtTime(pitch, time);
  if (isRandom){
    pitch = Tone.Midi(pitches[Math.floor(Math.random()*8)]+octave*12+transpose).toFrequency()
    //toneSig.setValueAtTime(pitch, time);
  }

  if( isGlide ) toneSig.exponentialRampToValueAtTime(pitch, time + sustainTime/1);
  else toneSig.setValueAtTime(pitch, time);

  ampEnvelope.triggerAttackRelease(sustainTime, time); 
  filterEnvelope.triggerAttackRelease(sustainTime, time);
  },
  pitches, // Sequence of note names - ignored
  '16n'// Time interval between each note
);
sequence.start()

let seq_knobs = []
let fader_spacing = 8
for( let i=0;i<pitches.length;i++){
  seq_knobs.push(gui.Fader({
    label: (i).toString(),showLabel:0,
    callback: function(x){
      pitches[i]= scaleToMidi(Math.floor(x))
    },
    min:0.01,max:12, value:Math.random()*12,
    size: 1, x: 20 + i*fader_spacing, y: 67,
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


const kickEnables = ['z','x','c','v','b','n','m',',']
const snareEnables = ['a','s','d','f','g','h','j','k']
const synthEnables = ['q','w','e','r','t','y','u','i']

let enable_toggles = []
for( let i=0; i<pitches.length; i++){
  enable_toggles.push(gui.Toggle({
    label: synthEnables[i],
    callback: function(x){
      if (x) enable_array[i] = true;
      else  enable_array[i] = false;
    },
    size: .5, x: 20 + i*fader_spacing, y: 85,
    link: (x) => {ch.control('enable_array', enable_array)}
  }))
}
for( let i=0; i<pitches.length; i++) enable_toggles[i].set(1)

ch.on('enable_array', ({ values }) => {
  enable_array = values
  for( let i=0;i<pitches.length;i++){
    if (enable_array[i])  enable_toggles[i].forceSet(true)
    else enable_toggles[i].forceSet(false)
  }
})

let kick_toggles = []
let kick_enable = new Array(8).fill('false')
for( let i=0; i<kick_enable.length; i++){
  kick_toggles.push(gui.Toggle({
    label: kickEnables[i],
    callback: function(x){
      if (x>0) kick_enable[i] = true;
      else  kick_enable[i] = false;
    },
    size: .25, x: 20 + i*fader_spacing, y: 95,
    link: (x) => {ch.control('kick_array', kick_enable)}
  }))
}
for( let i=0; i<kick_enable.length; i++) kick_toggles[i].set(0)
gui.Text({
  label:'kick', textSize: 1.5,
  x: 15, y: 95, border: 0.1
})

ch.on('kick_array', ({ values }) => {
  kick_enable = values
  for( let i=0;i<kick_enable.length;i++){
    if (kick_enable[i])  kick_toggles[i].forceSet(true)
    else kick_toggles[i].forceSet(false)
  }
})

let snare_toggles = []
let snare_enable = new Array(8).fill('false')
for( let i=0; i<snare_enable.length; i++){
  snare_toggles.push(gui.Toggle({
    label: snareEnables[i],
    callback: function(x){
      if (x) snare_enable[i] = true;
      else  snare_enable[i] = false;
    },
    size: .25, x: 20 + i*fader_spacing, y: 90,
    link: (x) => {ch.control('snare_array', snare_enable)}
  }))
}
for( let i=0; i<snare_enable.length; i++) snare_toggles[i].set(0)

ch.on('snare_array', ({ values }) => {
  snare_enable = values
  for( let i=0;i<pitches.length;i++){
    if (snare_enable[i])  snare_toggles[i].forceSet(true)
    else snare_toggles[i].forceSet(false)
  }
})
gui.Text({
  label:'snare', textSize: 1.5,
  x: 15, y: 90, border: 0.1
})


let isTransportRunning = true // opposite because will be flipped on initiation callback 
let toggleButton = gui.Toggle({
  label:'On/Off \n ( ] )',
  callback:  x=>{ x > 0 ? isTransportRunning = 1 : isTransportRunning = 0},
//   function toggleTransport() {
//   if (isTransportRunning) {
//     Tone.Transport.stop();
//     console.log('stopped transport')
//   } else {
//     Tone.Transport.start();
//     console.log('started transport')
//     for( let i=0; i<pitches.length; i++) enable_toggles[i].set(1)
//   }
//   isTransportRunning = !isTransportRunning;
// },
  x: 50, y:55, size: 0.5,
  link: 'on-off',
  value: 1
})

let eighthNoteDuration = .125
let tempoKnob = gui.Knob({
  label: 'Tempo',
  callback: function(x){
    Tone.Transport.bpm.value = x;
    delay.delayTime.value = x > 45 ? 45/x : 1 //max delay is 1
    eighthNoteDuration = 30/x
    sustainTime = lengthKnob.value * eighthNoteDuration
    },
  x: 78, y: 55,
  min:30, max:250, curve: 1, size: 0.3,
  link: 'tempo'
})
let lengthKnob = gui.Knob({
  label: 'Note Length',
  callback: function(x){
    sustainTime = x * eighthNoteDuration
    //console.log(x, eighthNoteDuration)
  },
  min: 0.01, max: .9, curve: 1.2, size: 1,
  x: 22, y: 55, size: 0.3,
  link: 'note-length'
})

let transposeAdd = gui.Button({
  label: '+',
  callback: function() {
    transpose += 1
    transposeSubtract.label = 'Sub / ' + transpose.toString()
    transposeAdd.label = 'Add / ' + transpose.toString()
  },
  x: 88, y: 70, size: 0.6,
  link: 'transpose+'
})

let transposeSubtract = gui.Button({
  label: '-',
  callback: function subtractnote(){
    transpose -= 1
    transposeSubtract.label = 'Sub / ' + transpose.toString()
    transposeAdd.label = 'Add / ' + transpose.toString()
  },
  x: 12, y: 70, size: 0.6,
  link: 'transpose-'
})

let resetTranspose = gui.Momentary({
  label: 'reset',
  callback: function subtractnote(){
    transpose  = 0
    transposeSubtract.label = 'Sub / ' + transpose.toString()
    transposeAdd.label = 'Add / ' + transpose.toString()
  },
  x: 6, y: 70, size: 0.3,
  link: 'reset'
})


let booster = gui.Momentary({
  label: 'Boost \n( \\ )',
  callback: x=>{ x > 0 ? isBoost = 1 : isBoost = 0},
  // function boosted(){
  // if (isBoost) {
  //   sequence.playbackRate = 2;
  // } else {
  //   sequence.playbackRate = 1;
  // }
  // isBoost = !isBoost;
  // },
  x: 70, y: 59, size: 0.8,
  link: 'boost',
  textSize: 1.5
})
booster.set(0)

let rand = gui.Toggle({
  label: 'Random \n ( [ )',
  callback: function(x){
  isRandom = x > 0 ? true : false
  console.log(isRandom)
  },
  x: 30, y:59, size: 0.8,
  link: 'random',
  textSize: 1.5
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
      //console.log('input value', input)
      //console.log('curved value', realCurved)
      return realCurved
    }
    index++
  }
  return max
}

startEnable = 0

//this start button exists just to enable audio
//there are probably other ways to call Tone.start(). . . .
startButton.addEventListener('click', () => {
  if (startEnable == 0) {
    // Start the hihat if it's not already playing
    Tone.start()
    Tone.Transport.start();
    console.log('start');
    startEnable = 1

    document.getElementById('startStatus').innerHTML = 'Enabled';
  } else {
    console.log('stop');
    startEnable = 0
  }
});


// setCCHandler((midi, value) => 
//   { console.log(midi, value)
//     if (midi < 8){
//     seq_knobs[midi].set(value/10.583333)
//   }
//     if (63 < midi < 72){
//         if (value>0){
//           enable_toggles[midi-64].set(enable_toggles[midi-64].value == 0)
//     }
//   }
//     else{
//     switch(midi){
//       case 16: wave_fader.set(value/127); break;
//       case 17: if (value/0.0635 > 500){
//         freq_fader.set(value/0.0635)
//         }
//         else{
//           freq_fader.set(500)
//         }
//         break
//       case 18: release_fader.set(value/25.4); break;
//       case 19:  detune_knob.set(value/63.5)   //I CHANGED THE RELEASE MIN/MAX - knob should be adjusted
       
    
//       case 20: if (value/4.23333 > 1){
//         resonance_knob.set(value/4.23333)   //I CHANGED THE RESONANCE MIN/MAX - should be fine as is
//         }
//         else{
//           resonance_knob.set(1)
//         }
//         break
//       case 21: speaker_knob.set(value/1270); break;
//       case 22: if (value/127 > 0.1){
//         lengthKnob. set(value/127)
//         }
//         else{
//           lengthKnob.set(0.1)
//         }
//         break
//       case 23: if (value/0.508 > 30){
//         tempoKnob. set(value/0.508)
//         }
//         else{
//           tempoKnob.set(30)
//         }
//         break
//       case 41: if (value>0){
//         toggleButton.set(toggleButton.value==0)}; break;
//       case 43: if (value>0){
//         rand.set(rand.value == 0)}; break;  
//       case 44: if (value>0){
//         booster.set(booster.value == 0)}; break;
//       case 61: transposeSubtract.set(value/127); break;
//       case 62: transposeAdd.set(value/127); break;
//       case 42: if (value>0){
//         delay_toggle.set(delay_toggle.value==0)}; break;
//       case 45: if (value>0){
//         crusher_toggle.set(crusher_toggle.value==0)}; break;
//       case 60: if (value>0){
//         distortion_toggle.set(distortion_toggle.value==0)}; break;
//       case 46: if (value>0){
//         glide_toggle.set(glide_toggle.value==0)}; break;
//       case 58: kick_trigger.set(value/127); break;
//       case 59: snare_trigger.set(value/127); break;
//     }
//   }
// })



let lineB = gui.Line(0,100,100,100,{
  border:4
})

function printValues(){
  console.log('gui elements', gui.elements)
  if (typeof gui.elements === 'object') {
    // If gui.elements is an object (not an array)
    for (let key in gui.elements) {
      if (gui.elements.hasOwnProperty(key)) {
        console.log(gui.elements[key].label, gui.elements[key].value);
      }
    }
  } else {
    console.log('gui.elements is not iterable');
  }

}

// setNoteOnHandler((note,vel)=>{
//   switch(note){
//   case 60: booster.set(1); break;
//   }
// })

// setNoteOffHandler((note,vel)=>{
//   switch(note){
//   case 60: booster.set(0); break;
//   }
// })

let savedData = {}; // This will hold the saved values

function saveCallback() {
  savedData = {}; // Clear previous saved data
  for (let key in gui.elements) {
    if (gui.elements.hasOwnProperty(key)) {
      const element = gui.elements[key];
      savedData[element.id] = {
        type: element.type,
        value: element.value
      };
    }
  }
  console.log('Data saved:', savedData);
}

function recallCallback() {
  for (let key in gui.elements) {
    if (gui.elements.hasOwnProperty(key)) {
      const element = gui.elements[key];
      if (savedData.hasOwnProperty(element.id)) {
        if(savedData[element.id].type !== 'momentary')
        element.set ( savedData[element.id].value );
      }
    }
  }
  console.log('Data recalled');
}

saveData.addEventListener('click', () => {
  saveCallback()
});

recallData.addEventListener('click', () => {
  recallCallback()
});