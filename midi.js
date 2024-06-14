//Support for WebMIDI
//- will not work on Safari! Best supported on Chrome
//- laptop keyboard code at bottom
//- edit 'noteOn' and 'noteOff' functions to work with your script

//enable to let your laptop keyboard trigger notes
let midiOn = true;

if (!navigator.requestMIDIAccess) {
    console.log("WebMIDI is not supported in this browser.");
} else {
    console.log("WebMIDI supported. Setting up...");
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
}

function onMIDISuccess(midiAccess) {
    console.log("MIDI access obtained.");
    midiAccess.inputs.forEach(function(input) {
        console.log("Input device ID:", input.id, "Name:", input.name);
        input.onmidimessage = handleMIDIMessage;
    });
}

function onMIDIFailure() {
    console.log("Failed to obtain MIDI access.");
}

function handleMIDIMessage(message) {
    var data = message.data; // this gives us our [command/channel, note, velocity] data.
    var command = data[0];
    var note = data[1];
    var velocity = (data.length > 2) ? data[2] : 0; // a velocity value might not be included with a note off command

    switch (command) {
        case 144: // noteOn message 
            if (velocity > 0) {
                noteOn(note, velocity);
            } else {
                noteOff(note);
            }
            break;
        case 128: // noteOff message 
            noteOff(note);
            break;
    }
}

function noteOn(note, velocity) {
    console.log(`Note ${note} on with velocity ${velocity}`);
    // Handle note on
}

function noteOff(note) {
    console.log(`Note ${note} off`);
}

/************************************
 * LAPTOP KEYBOARD
 * ************************************/

let notesOn = new Set();
let octave = 4;
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
    octave = Math.max(1, Math.min(7, octave + modifier));
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
                let midiNote = note["midi"] + (octave - 4) * 12;
                if (midiNote <= 127) {
                    noteOn(midiNote,127)
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
            let midiNote = note["midi"] + (octave - 4) * 12;
            if (midiNote <= 127) {
                noteOff(midiNote)
                console.log('Keyboard Note off:', midiNote); // Replace with MIDI handler
            }
        }
    }
}