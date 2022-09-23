import React, { useEffect, useState } from "react";
import './App.css'

import { convertSliderValueToAmplitude } from './components/MasterVolumeControl.jsx';

import { Clip } from './classes/Clip'; 
import ClipList, { clipsEx, setClipsEx } from "./components/ClipList.jsx";
import AudioFileDrop from "./components/AudioFileDrop.jsx";
import PlaybackRateControl from "./components/PlaybackRateControl.jsx";
import MasterVolumeControl from "./components/MasterVolumeControl.jsx";

export const AudioContext = window.AudioContext || window.webkitAudioContext;

export const lightTextColor = "#eee";
export const lightGrayUI = "#444";

export let audioCtx;

export const globalVolumeSliderDefault = 80; // out of 100
export const globalVolumeDefault = convertSliderValueToAmplitude(globalVolumeSliderDefault);
export let globalVolume = globalVolumeDefault;
export let globalSpeed = 1;


export const clipsMessageDefault = "No clips loaded.";
export const clipsMessageLoading = "Loading clips...";

export const setGlobalVolume = v => {
  globalVolume = v;
}

export const setGlobalSpeed = s => {
  globalSpeed = s;
}

export const initAudioCtx = () => {
  audioCtx = new AudioContext();
}


let outputClip;

function App() {
  const [files, setFiles] = useState([]);
  const [clipsMessage, setClipsMessage] = useState(clipsMessageDefault);
  const [outputClipReady, setOutputClipReady] = useState(false);

  return (
    <div
        style={{
            maxWidth: '100vw',
            position: 'absolute',
            left: 0,
            top: 0,
            color: lightTextColor,
            paddingLeft: 10,
            paddingTop: 10,
            minHeight: '100vh',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column'
        }}
    >
        <div id="globalSliders" style={{ display: 'flex' }}>
            <div style={{ marginRight: '1.5rem' }}>
                <MasterVolumeControl/>
            </div>
            <div>
                <PlaybackRateControl/>
            </div>
        </div>

        <div style={{
            display: "flex"
        }}>
            <div>
                <div style={{ display: "flex" }}>
                    <AudioFileDrop 
                        files={files}
                        setFiles={setFiles}
                        audioCtx={audioCtx}
                        setClipsMessage={setClipsMessage}
                    />
                </div>

                <button
                    onClick={() => {
                        if(!audioCtx){
                            initAudioCtx();
                        }

                        // mass alias!
                        const speedupFactor = 100;

                        console.log(clipsEx);

                        let outputBuffers = [[], []];

                        for(let clip of clipsEx){
                            for (let channel_idx = 0; channel_idx < 2; channel_idx++){
                                // duplicate mono tracks to be stereo
                                let channelData = clip.audioBuffer.getChannelData(channel_idx % clip.audioBuffer.numberOfChannels);
                                console.log(channelData.length);
                                for (let i = 0; i < channelData.length; i += speedupFactor){
                                    outputBuffers[channel_idx].push(channelData[i])
                                }
                            }
                        }

                        for (let i = 0; i < outputBuffers.length; i++){
                            outputBuffers[i] = Float32Array.from(outputBuffers[i]);
                        }

                        let outputAudioBuffer = new AudioBuffer({
                            length: outputBuffers[0].length,
                            numberOfChannels: outputBuffers.length,
                            sampleRate: 44100
                        });

                        for(let i = 0; i < outputBuffers.length; i++){
                            outputAudioBuffer.copyToChannel(outputBuffers[i], i);
                        }

                        outputClip = new Clip(outputAudioBuffer, "mass-aliasing-output");

                        outputClip.play();
                        outputClip.generateDownload();

                        setOutputClipReady(true);

                        console.log(outputClip);

                    }}
                >Mass Alias!</button>

                <button onClick={() => {
                    setClipsEx([]);
                }}>
                    Clear all clips
                </button>

                <>
                {outputClipReady ? <a
                    href={outputClip.blob}
                    download={(() => {
                        return outputClip.name + "_aliased.wav";
                    })()}
                >
                    Save
                </a> : <></>}
                </>
            </div>
            
            <ClipList clipsMessage={clipsMessage}/>
        </div>

        <footer style={{
            marginTop: 'auto',
            color: "#888",
            lineHeight: '1.5rem',
            paddingBottom: '0.5rem'
        }}>
        <div><a className="footerLink" target="_blank" rel="noreferrer" href="https://youtu.be/U33ejbo3ro4" title="Video Inspiration">WangleLine</a></div>
        <div><a className="footerLink" target="_blank" rel="noreferrer" href="https://github.com/apc518/realisr-2" title="Realisr 2 Github">GitHub</a></div>
        <div>Copyright &copy; 2022 <a className="footerLink" target="_blank" rel="noreferrer" href="https://chambercode.com/about/andy" title="ChamberCode Portfolio">Andy Chamberlain</a></div>
        </footer>
    </div>
  )
}

export default App
