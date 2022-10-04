import React, { useEffect, useReducer } from 'react';
import Swal from 'sweetalert2';

import { audioCtx, initAudioCtx, lightGrayUI } from '../App.jsx';

export let forceUpdateClipList;

export const testClips = ["Billy Bob this is a very long name but its gotta be in order to test that my UI handles long filenames properly", 
                            "Joe Mama", "Pringles McGee", "Dang Rabbits", "Margarita Fahita"].map(n =>
    {
        return {
            name: n,
            play: () => console.log(n, "play"),
            stop: () => console.log(n, "stopped"),
            playing: false,
            audioBuffer: {
                numberOfChannels: 2
            }
        }
    }
)

const max = Math.max;
const min = Math.min;

let draggingIdx = -1;
let draggedOverIdx = -1;
let clipsCopy = [];

const selectedOutlineStyle = '4px solid #ff0046';

export default function ClipList({ clipsMessage, clips, setClips }){
    const [, forceUpdate] = useReducer(x => x + 1, 0);

    useEffect(() => {
        forceUpdateClipList = forceUpdate;
    }, []);

    const reorderClips = (fromIdx, toIdx) => {
        if(fromIdx < 0 || toIdx < 0 || clips.length !== clipsCopy.length)
            return;

        let direction = Math.sign(toIdx - fromIdx);
        
        if (toIdx === fromIdx)
            direction = 0;

        for (let i = 0; i < clips.length; i++){
            if(i == toIdx){
                clips[i] = clipsCopy[fromIdx];
            }
            else if ((min(fromIdx, toIdx) <= i && i <= max(fromIdx, toIdx))){
                clips[i] = clipsCopy[i + direction];
            }
            else{
                clips[i] = clipsCopy[i];
            }
        }

        clips[toIdx] = clipsCopy[fromIdx];
    }

    const selectOneClip = (idx) => {
        clips.forEach(c => c.selected = false);
        clips[idx].selected = true;
    }

    return (
        <>
        {clips.length === 0 ?
        <div style={{ paddingLeft: 10 }}>{clipsMessage}</div>
        : 
        <div style={{
            maxWidth: 500,
            marginLeft: 10,
            marginRight: 10,
            height: 'fit-content'
        }}>
            {clips.map((clip, idx) => (
                <div
                    key={idx}
                    title={clip.name}
                    draggable
                    style={{
                        display: 'flex',
                        height: 'fit-content',
                        background: lightGrayUI,
                        textAlign: 'center',
                        padding: 5,
                        marginBottom: 2,
                        wordWrap: 'break-word',
                        borderRadius: 10,
                        userSelect: 'none',
                        outline: clips[idx].selected ? selectedOutlineStyle : 'none'
                    }}

                    onMouseDown={() => {
                        selectOneClip(idx);
                        forceUpdate();
                    }}

                    onDragStart={() => {
                        clipsCopy = clips.slice();
                        selectOneClip(idx)
                        draggingIdx = idx;
                        forceUpdate();
                    }}
                    onDragEnter={() => {
                        draggedOverIdx = idx;
                        reorderClips(draggingIdx, draggedOverIdx);
                        forceUpdate();
                    }}
                    onDragOver={e => e.preventDefault()}
                >
                    <div style={{
                        float: 'left'
                    }}>
                        <button
                            onClick={e => {
                                e.target.blur();

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
                                    forceUpdate();
                                }
                                else{
                                    clip.play();
                                    forceUpdate();
                                }
                            }}
                        >
                            {clip.playing ? "Stop" : "Play"}
                        </button>
                    </div>

                    <div style={{
                        overflow: 'hidden',
                        marginRight: 'auto',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        paddingInline: '0.5rem',
                    }}>
                        {clip.name}
                    </div>
                    
                    <div
                        style={{
                            width: 16,
                            minWidth: 16,
                            height: 16,
                            marginBlock: 'auto',
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
                            forceUpdate();
                        }}
                    >
                        <svg style={{ color: '#d44' }} fill="currentColor" focusable="false" viewBox="0 0 24 24" aria-hidden="true" data-testid="CloseIcon" aria-label="fontSize medium"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
                    </div>
                </div>
            ))}
        </div>
        }
        </>
    )
}