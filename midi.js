//Support for WebMIDI
//- will not work on Safari! Best supported on Chrome
//- laptop keyboard code at bottom
//- edit 'noteOn' and 'noteOff' functions to work with your script

//enable to let your laptop keyboard trigger notes
var midi = null;
var muted = false;
var outputMidiID = null;
let midiOn = true;

console.log('start midi.js')

/****** load webMIDI API ******/
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess()
        .then(onMIDISuccess)
        .catch(onMIDIFailure);
} else {
    alert("No MIDI support in your browser.");
    // Handle the situation gracefully, e.g., show a notification to the user
}

function onMIDISuccess(midiAccess) {
    console.log("MIDI ready!");
    midi = midiAccess;  // store in the global
    //console.log(getMidiIO())
    //populateMIDIDevices();
    midi.inputs.forEach(function (key, val) { key.onmidimessage = handleMidiInput; })

    //eval('globalThis.setMidiInput1 = setMidiInput;');
}

function onMIDIFailure(msg) {
    console.error(`Failed to get MIDI access - ${msg}`);
}

function setMidiInput(inputID) {
    //in case only one id is inputted, turn into array
    if (!Array.isArray(inputID)) inputID = [inputID];

    //reset inputs
    midi.inputs.forEach(function (key, val) { key.onmidimessage = handleMidiInput; })

    // for (var id of inputID) {
    //     if (id in midi_input_ids & midi.inputs.get(midi_input_ids[id]) != null) {
    //         midi.inputs.get(midi_input_ids[id]).onmidimessage = handleMidiInput;
    //         console.log("MIDI input set to: " + midi_input_names[id]);
    //     } else { console.warn('Invalid input ID'); }
    // }
}

var midi_input_ids = {};
var midi_output_ids = {};
var midi_input_names = {};
var midi_output_names = {};

function getMidiIO() {
    var midiInputs = 'MIDI Inputs:\n';
    var midiOutputs = 'MIDI Outputs:\n';
    var inputID = null;
    var outputID = null;

    var num = 1;
    for (var output of midi.outputs) {
        midiOutputs += num + ': ' + output[1].name + '\n'; //+ '\', ID: \'' + output[1].id + '\'\n';
        outputID = output[1].id;
        midi_output_ids[num] = outputID;
        midi_output_names[num] = output[1].name;
        num += 1;
    }

    num = 1;
    for (var input of midi.inputs) {
        midiInputs += num + ': ' + input[1].name + '\n'; // + '\', ID: \'' + input[1].id + '\'\n';
        inputID = input[1].id;
        midi_input_ids[num] = inputID;
        midi_input_names[num] = input[1].name;
        num += 1;
    }

    return midiInputs + midiOutputs
}

/****** load webMIDI API ******/
class MidiHandler {
    constructor() {
        this.noteOnHandler = (note, velocity=127, channel=1) => {
            console.log('Default Note On Handler:', note, velocity);
            console.log(`Define your own note on handler like this:\nsetNoteOnHandler(( note, vel, (optional:channel) ) => { <your code here> }) `)
        };
        this.noteOffHandler = (note, velocity=0, channel=1) => {
            console.log('Default Note Off Handler:', note, velocity);
            console.log(`Define your own note off handler like this:\nsetNoteOffHandler(( note, vel, (optional:channel) ) => { <your code here> }) `)
        };
        this.CCHandler = (controller, value, channel=1) => {
            console.log('Default CC Handler:', controller, value);
            console.log(`Define your own CC handler like this:\nsetCCHandler(( cc, value, (optionaL:channel) ) => { <your code here> }) `)
        };
    }

    handleNoteOn(note, velocity, channel) {
        this.noteOnHandler(note, velocity, channel);
    }
    handleNoteOff(note, velocity, channel) {
        this.noteOffHandler(note, velocity, channel);
    }
    handleCC(controller, value, channel) {
        this.CCHandler(controller, value, channel);
    }

    setNoteOnHandler(func) {
        this.noteOnHandler = func;
    }
    setNoteOffHandler(func) {
        this.noteOffHandler = func;
    }
    setCCHandler(func) {
        this.CCHandler = func;
    }
}
const midiHandlerInstance = new MidiHandler();

function setNoteOnHandler(func) {
        midiHandlerInstance.noteOnHandler = func;
    }
function  setNoteOffHandler(func) {
        midiHandlerInstance.noteOffHandler = func;
    }
function  setCCHandler(func) {
        "setting CC handler"
        midiHandlerInstance.CCHandler = func;
}

function handleMidiInput(message) {
    console.log(message)
    let channel = (message.data[0] & 15) + 1

    if (message.data[1] != null) {
        let status = message.data[0]
        //console.log('midi', status, message.data[1], message.data[2])
        if (status >= 128 && status <= 159) {//note message
            let note = message.data[1]
            let velocity = message.data[2]
            //note off msg
            if (status >= 128 && status <= 143 || velocity < 1) {
                midiHandlerInstance.handleNoteOff(note, velocity, channel)
            }
            //note on msg
            else {
                midiHandlerInstance.handleNoteOn(note, velocity, channel)
            }
        } else if (status >= 176 && status <= 191) {
            let cc = message.data[1]
            let value = message.data[2]
            midiHandlerInstance.handleCC(cc, value, channel)
        }
    }
}

/************************************
 * LAPTOP KEYBOARD
 * ************************************/

let notesOn = new Set();
let KB_octave = 4;
let activeKeys = {};
let keyToNote = {
    90: { "midi": 60, "pitch": "C" },     // Z
    83: { "midi": 61, "pitch": "C#/Db" }, // S
    88: { "midi": 62, "pitch": "D" },     // X
    68: { "midi": 63, "pitch": "D#/Eb" }, // D
    67: { "midi": 64, "pitch": "E" },     // C
    86: { "midi": 65, "pitch": "F" },     // V
    71: { "midi": 66, "pitch": "F#/Gb" }, // G
    66: { "midi": 67, "pitch": "G" },     // B
    72: { "midi": 68, "pitch": "G#/Ab" }, // H
    78: { "midi": 69, "pitch": "A" },     // N
    74: { "midi": 70, "pitch": "A#/Bb" }, // J
    77: { "midi": 71, "pitch": "B" },     // M
    188: { "midi": 72, "pitch": "C" },    // ,
    76: { "midi": 73, "pitch": "C#/Db" }, // L
    190: { "midi": 74, "pitch": "D" },    // .
    186: { "midi": 75, "pitch": "D#/Eb" },// ;
    191: { "midi": 76, "pitch": "E" }     // /
};

// Function to handle octave changes
function changeOctave(modifier) {
    KB_octave = Math.max(1, Math.min(7, KB_octave + modifier));
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

function handleKeyDown(event) {
    if (midiOn) {
        const keyCode = event.keyCode;
        if (!activeKeys[keyCode]) {
            activeKeys[keyCode] = true;
            if (keyToNote[keyCode]) {
                let note = keyToNote[keyCode];
                let midiNote = note["midi"] + (KB_octave - 4) * 12;
                if (midiNote <= 127) {
                    midiHandlerInstance.handleNoteOn(midiNote,127)
                    console.log('Keyboard Note on:', midiNote); // Replace with MIDI handler
                }
            } else if (keyCode === 37) { // Arrow left
                changeOctave(-1);
            } else if (keyCode === 39) { // Arrow right
                changeOctave(1);
            }
        }
    }
}

function handleKeyUp(event) {
    if (midiOn) {
        const keyCode = event.keyCode;
        activeKeys[keyCode] = false;
        if (keyToNote[keyCode]) {
            let note = keyToNote[keyCode];
            let midiNote = note["midi"] + (KB_octave - 4) * 12;
            if (midiNote <= 127) {
                midiHandlerInstance.handleNoteOff(midiNote)
                console.log('Keyboard Note off:', midiNote); // Replace with MIDI handler
            }
        }
    }
}

console.log('end midi.js')

//MIDI selector setup
// function populateMIDIDevices() {
//     const inputs = midi.inputs.values();
//     const outputs = midi.outputs.values();

//     const midiInputsSelect = document.getElementById('midi-inputs');
//     //const midiOutputsSelect = document.getElementById('midi-outputs');

//     // Clear existing options
//     midiInputsSelect.innerHTML = '';
//     //midiOutputsSelect.innerHTML = '';

//     // Populate MIDI Inputs
//     for (let input of inputs) {
//         const option = document.createElement('option');
//         option.value = input.id;
//         option.textContent = input.name;
//         midiInputsSelect.appendChild(option);
//     }

//     // // Populate MIDI Outputs
//     // for (let output of outputs) {
//     //     const option = document.createElement('option');
//     //     option.value = output.id;
//     //     option.textContent = output.name;
//     //     midiOutputsSelect.appendChild(option);
//     // }

//     // Add event listeners for selection change
//     midiInputsSelect.addEventListener('change', (event) => {
//         setMidiInput(event.target.value);
//     });

//     // midiOutputsSelect.addEventListener('change', (event) => {
//     //     setMidiOutput(event.target.value);
//     // });
// }

// function setMidiInput(id) {
//     const input = midi.inputs.get(id);
//     if (input) {
//         console.log(`Selected MIDI Input: ${input.name}`);
//         // Handle the selected input (e.g., set up event listeners)
//     }
// }

// function setMidiOutput(id) {
//     const output = midi.outputs.get(id);
//     if (output) {
//         console.log(`Selected MIDI Output: ${output.name}`);
//         // Handle the selected output
//     }
// }