import React, { useState } from "react";
import './App.css'

import { convertSliderValueToAmplitude } from './components/MasterVolumeControl.jsx';

import { Clip } from './classes/Clip';
import { massAlias } from './classes/Aliaser'
import ClipList from "./components/ClipList.jsx";
import AudioFileDrop from "./components/AudioFileDrop.tsx";
import PlaybackRateControl from "./components/PlaybackRateControl.jsx";
import MasterVolumeControl from "./components/MasterVolumeControl.jsx";
import Swal from "sweetalert2";

export const AudioContext = window.AudioContext || window.webkitAudioContext;

export const lightTextColor = "#eee";
export const lightGrayUI = "#444";

export let audioCtx;

export const globalVolumeSliderDefault = 80; // out of 100
export const globalVolumeDefault = convertSliderValueToAmplitude(globalVolumeSliderDefault);
export let globalVolume = globalVolumeDefault;
export let globalSpeed = 1;

export const clipsMessageDefault = "No clips loaded.";

export const setGlobalVolume = v => {
  globalVolume = v;
}

export const setGlobalSpeed = s => {
  globalSpeed = s;
}

export const initAudioCtx = () => {
  audioCtx = new AudioContext();
}

const speedupFactorDefault = 60;
const speedupErrorColor = "#f88";
const speedupGoodColor = "#fff";

function App() {
  const [files, setFiles] = useState([]);
  const [clipsMessage, setClipsMessage] = useState(clipsMessageDefault);
  const [outputClip, setOutputClip] = useState(null);
  const [outputClipReady, setOutputClipReady] = useState(false);
  const [speedupFactor, setSpeedupFactor] = useState(speedupFactorDefault);
  const [speedupFactorIsValid, setSpeedupFactorIsValid] = useState(true);
  const [clips, setClips] = useState([]);

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
                        clips={clips}
                        setClips={setClips}
                    />
                </div>

                <div style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
                    <label htmlFor="speedupInput">Speedup Factor:</label>
                    <input 
                        id="speedupInput"
                        type="number" 
                        style={{ backgroundColor: speedupFactorIsValid ? speedupGoodColor : speedupErrorColor }}
                        defaultValue={speedupFactorDefault}
                        onInput={e => {
                            if(e.target.value >= 1)
                            {
                                setSpeedupFactorIsValid(true);
                                setSpeedupFactor(parseInt(e.target.value));
                            }
                            else{
                                setSpeedupFactorIsValid(false);
                            }
                        }}
                    ></input>
                </div>
                
                <button
                    onClick={() => {
                        if(!audioCtx) initAudioCtx();

                        if(clips.length == 0){
                            Swal.fire({
                                icon: 'info',
                                text: 'I gotta have some clips! Drag and drop audio files onto the big yellow box :)'
                            });

                            return;
                        }

                        let _outputClip = new Clip(massAlias(speedupFactor, clips), "mass-aliasing-output");
                        // TODO: _outputClip.onEnded = () => { /* do something here? */ };
                        _outputClip.generateDownload();
                        _outputClip.play();

                        setOutputClip(_outputClip);
                        setOutputClipReady(true);
                    }}
                >Mass Alias!</button>

                <button onClick={() => {
                    setClips([]);
                    Clip.allClips = [];
                    setOutputClipReady(false);
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
            
            <ClipList clipsMessage={clipsMessage} clips={clips} setClips={setClips} />
        </div>

        <footer style={{
            marginTop: 'auto',
            color: "#888",
            lineHeight: '1.5rem',
            paddingBottom: '0.5rem'
        }}>
        <div><a className="footerLink" target="_blank" rel="noreferrer" href="https://youtu.be/U33ejbo3ro4" title="Video Inspiration">WangleLine</a></div>
        <div><a className="footerLink" target="_blank" rel="noreferrer" href="https://github.com/apc518/mass-aliasing-react" title="Realisr 2 Github">GitHub</a></div>
        <div>Copyright &copy; 2022 <a className="footerLink" target="_blank" rel="noreferrer" href="https://chambercode.com/about/andy" title="ChamberCode Portfolio">Andy Chamberlain</a></div>
        </footer>
    </div>
  )
}

export default App
