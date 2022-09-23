import {  globalSpeed, audioCtx, initAudioCtx, globalVolume } from "../App.jsx";

import { clipsEx, setClipsEx } from "../components/ClipList.jsx";

export class Clip {
    static allClips = [];

    constructor(audioBuffer, name){
        // input
        this.name = name;
        this.audioBuffer = audioBuffer;

        // output
        this.blob = null;

        // playing
        this.audioBufferNode = null;
        this.gainNode = null;
        this.playing = false;
        this.onEnded = () => {}

        Clip.allClips.push(this);
    }

    play(){
        if(!audioCtx){
            initAudioCtx();
        }

        let source = audioCtx.createBufferSource();
        let gainNode = audioCtx.createGain();
        gainNode.gain.value = globalVolume;
        if(this.audioBuffer){
            source.buffer = this.audioBuffer;
            source.playbackRate.value = globalSpeed;
            source.onended = () => {
                this.playing = false;
                setClipsEx([...clipsEx]);
            };

            source.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            this.audioBufferNode = source;
            this.gainNode = gainNode;

            source.start();
            this.playing = true;
        }
    }

    stop(){
        this.audioBufferNode?.stop();
        this.audioBufferNode = null;
        this.playing = false;
    }

    setVolume(v){
        if(this.gainNode){
            this.gainNode.gain.value = v;
        }
    }

    setPlaybackRate(s){
        if(this.audioBufferNode){
            this.audioBufferNode.playbackRate.value = s;
        }
    }

    generateDownload(){
        // function by Russell Good, some modifications by me https://www.russellgood.com/how-to-convert-audiobuffer-to-audio-file/
        const bufferToWave = (abuffer) => {
            const numOfChan = abuffer.numberOfChannels;
            const length = abuffer.length * numOfChan * 2 + 44;
            let buffer = new ArrayBuffer(length);
            let view = new DataView(buffer);
            let channels = [];
            let pos = 0;
            let offset = 0;
            
            const writeUint16 = (data) => {
                // little endian
                view.setUint16(pos, data, true);
                pos += 2;
            }
            
            const writeUint32 = (data) => {
                // little endian
                view.setUint32(pos, data, true);
                pos += 4;
            }

            // write WAVE header
            writeUint32(0x46464952); // "RIFF" backwards (since setUint32 does little endian, but this needs to actually be forwards)
            writeUint32(length - 8); // bytes in file after this word
            writeUint32(0x45564157); // "WAVE" also backwards, see two lines above
            writeUint32(0x20746d66); // "fmt " also backwards
            writeUint32(16); // length of file up until this point
            writeUint16(1); // type PCM
            writeUint16(numOfChan);
            writeUint32(abuffer.sampleRate);
            writeUint32(abuffer.sampleRate * 2 * numOfChan); // average bytes/sec
            writeUint16(numOfChan * 2) // block alignment (bits/sample * number of channels)
            writeUint16(16) // bit depth

            writeUint32(0x61746164); // "data" backwards, since setUint32 does little endian but this needs to actually be forwards
            writeUint32(length - pos - 4); // number of bytes

            // write interleaved data
            for(let i = 0; i < numOfChan; i++){
                channels.push(abuffer.getChannelData(i));
            }

            // write the data
            while(pos < length) {
                for(let i = 0; i < numOfChan; i++){
                    let sample = Math.max(-1, Math.min(1, channels[i][offset]));
                    sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
                    view.setInt16(pos, sample, true);
                    pos += 2;
                }
                offset++;
            }

            // create Blob
            return new Blob([buffer], { type: "audio/wav" });
        }

        this.blob =  URL.createObjectURL(bufferToWave(this.audioBuffer));
    }
}