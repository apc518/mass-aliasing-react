import React, { useEffect, useReducer } from 'react';
import Swal from 'sweetalert2';

import { audioCtx, initAudioCtx, lightGrayUI } from '../App.jsx';

export let forceUpdateClipList;

export const resetClipsOutputs = (clips, setClips) => {
    for (let c of clips) {
        if(!(c.blob === null && c.outAudioBuffer === null)){
            c.blob = null;
            c.outAudioBuffer = null;
        }
    }
    setClips([...clips]); // refresh clip list
}

export default function ClipList({ clipsMessage, clips, setClips }){
    const [, forceUpdate] = useReducer(x => x + 1, 0);

    useEffect(() => {
        forceUpdateClipList = forceUpdate;
    }, []);

    return (
        <>
        {clips.length === 0 ?
        <div style={{ paddingLeft: 10 }}>{clipsMessage}</div>
        : 
        <div style={{
            display: 'grid',
            gap: 10,
            placeItems: 'flex-start',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'auto 1fr',
            marginLeft: 10,
            height: 'fit-content'
        }}>
            {clips.map((clip, idx) => (
                <div 
                    key={idx}
                    style={{
                        width: '100%',
                        height: 'fit-content',
                        background: lightGrayUI,
                        textAlign: 'center',
                        padding: 5,
                        maxWidth: 200,
                        wordWrap: 'break-word',
                        borderRadius: 10,
                        userSelect: 'none'
                    }}
                >
                    <div
                        style={{
                            width: 16,
                            height: 16,
                            float: 'right',
                            padding: 0,
                            borderRadius: 8,
                            display: 'grid',
                            placeItems: 'center'
                        }}
                        className="closeButton"
                        onClick={() => {
                            clip.stop();
                            clips.splice(idx, 1);
                            console.log(clip, clips);
                            setClips([...clips]);
                        }}
                    >
                        <svg style={{ color: '#d44' }} fill="currentColor" focusable="false" viewBox="0 0 24 24" aria-hidden="true" data-testid="CloseIcon" aria-label="fontSize medium"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
                    </div>
                    {clip.name}<br/>
                    <button
                        onClick={() => {
                            if(!audioCtx){
                                initAudioCtx();
                            }
                            
                            if (clip.audioBuffer.numberOfChannels < 1) {
                                Swal.fire({
                                    icon: "error",
                                    text: "A file with no channels? No-can-do I'm afraid."
                                });
                            }

                            if(clip.playing){
                                clip.stop();
                                setClips([...clips]);
                                return;
                            }
                            else{
                                clip.play();
                                setClips([...clips]);
                            }

                        }}
                    >
                        {clip.playing ? "Stop" : "Play"}
                    </button>
                </div>
            ))}
        </div>
        }
        </>
    )
}