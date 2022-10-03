import React, { useEffect, useReducer } from 'react';
import Swal from 'sweetalert2';

import { audioCtx, initAudioCtx, lightGrayUI } from '../App.jsx';

export let forceUpdateClipList;

export const testClips = ["Billy Bob This is a very long name what will it do if its a bit longer how about", "Joe Mama", "Pringles McGee", "Dang Rabbits", "Margarita Fahita"].map(n =>
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

let draggingIdx = -1;
let draggedOverIdx = -1;

const selectedOutlineStyle = '4px solid #ff0046';

export default function ClipList({ clipsMessage, clips, setClips }){
    const [, forceUpdate] = useReducer(x => x + 1, 0);

    useEffect(() => {
        forceUpdateClipList = forceUpdate;
    }, []);

    const reorderClips = (fromIdx, toIdx) => {
        if(fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return;

        console.log("reordering", fromIdx, toIdx);

        let clipsCopy = clips.slice();

        let direction = Math.sign(toIdx - fromIdx);

        console.log({clipsCopy: clipsCopy.map(c => c.name), direction});

        for (let i = 0; i < clips.length; i++){
            console.log("after", i, "iterations:", clipsCopy.map(c => c.name));
            if ((fromIdx < i && i <= toIdx) || (toIdx <= i && i < fromIdx)){
                clipsCopy[i - direction] = clips[i];
            }
        }

        clipsCopy[toIdx] = clips[fromIdx];

        console.log("done:", clipsCopy.map(c => c.name));

        setClips([...clipsCopy]);
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
            marginLeft: 10,
            height: 'fit-content'
        }}>
            {clips.map((clip, idx) => (
                <div 
                    key={idx}
                    style={{
                        display: 'flex',
                        width: '100%',
                        height: 'fit-content',
                        background: lightGrayUI,
                        textAlign: 'center',
                        padding: 5,
                        marginBottom: 2,
                        maxWidth: 600,
                        wordWrap: 'break-word',
                        borderRadius: 10,
                        userSelect: 'none',
                        outline: clips[idx].selected ? selectedOutlineStyle : 'none'
                    }}

                    draggable

                    onMouseDown={e => {
                        selectOneClip(idx);
                        forceUpdate();
                    }}

                    onDragStart={e => {
                        selectOneClip(idx)
                        draggingIdx = idx;
                        forceUpdate();
                    }}
                    onDragEnter={e => draggedOverIdx = idx}
                    onDragEnd={e => {
                        console.log(idx, e);
                        reorderClips(draggingIdx, draggedOverIdx);
                        forceUpdate();
                    }}
                    onDragOver={e => e.preventDefault()}
                >
                    <div style={{
                        float: 'left'
                    }}>
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
                        width: 'auto',
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