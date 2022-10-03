import React, { useState } from "react";
import Swal from "sweetalert2";

import {  audioCtx, initAudioCtx, lightTextColor, clipsMessageDefault } from '../App.jsx';
import { setClipsEx, clipsEx } from "./ClipList.jsx";
import { Clip } from "../classes/Clip.js";

const inactiveColor : string = "#dd4";
const activeColor : string = "#d77";

export default function AudioAudioFileDrop({ setClipsMessage }){
    const [bgColor, setBgColor] = useState(inactiveColor);

    const loadFiles = (fileList : FileList) => {
        setClipsMessage(`Loading clips (0/0)...`);

        if(!audioCtx){
            initAudioCtx();
        }

        const newClips = clipsEx.slice();

        const files : File[] = [];
        for(let f of fileList){
            files.push(f);
        }

        let i = 0;

        const failedFilenames : String[] = [];

        const trySetClips = () => {
            if(i === files.length - 1){
                setClipsEx(newClips);
                setClipsMessage(clipsMessageDefault);

                if(failedFilenames.length > 0){
                    Swal.fire({
                        icon: 'info',
                        html: `These files could not be decoded as audio:<br/>${failedFilenames.toString().split(",").join(", ")}`
                    });
                }
            }
            
            i++;
        }

        let counter = 1;
        for(let f of files){
            f.arrayBuffer().then(res => {
                audioCtx.decodeAudioData(res).then(decodedData => {
                    console.log(decodedData);
                    
                    newClips.push(new Clip(decodedData, f.name));
                    
                    trySetClips();
                    
                    setClipsMessage(`Loading clips (${counter}/${files.length})...`);
                    counter += 1;

                    if(counter >= files.length){
                        setClipsMessage(clipsMessageDefault);
                    }
                })
                .catch(() => {
                    failedFilenames.push(f.name);

                    trySetClips();
                });
            })
            .catch(e => console.error(e));
        }
    }

    return (
        <button 
            style={{
                width: 400,
                height: 200,
                backgroundColor: bgColor,
                color: lightTextColor,
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                border: 'none'
            }}

            onClick={e => {
                e.preventDefault();
                e.stopPropagation();

                const inputElem : HTMLInputElement = document.createElement('input');
                inputElem.type = 'file';
                inputElem.multiple = true;

                inputElem.onchange = () => {
                    if(inputElem.files)
                        loadFiles(inputElem.files);
                }

                inputElem.click();
            }}

            onDragOver={e => {
                e.preventDefault();
                e.stopPropagation();

                setBgColor(activeColor);
                e.dataTransfer.dropEffect = 'copy';
            }}

            onDragLeave={e => {
                e.preventDefault();
                e.stopPropagation();

                setBgColor(inactiveColor);
            }}

            onDrop={e => {
                e.preventDefault();
                e.stopPropagation();

                setBgColor(inactiveColor);

                loadFiles(e.dataTransfer.files);
            }}
        >
            <div style={{
                maxWidth: 150,
                textAlign: 'center',
                fontSize: 20,
                userSelect: 'none',
                color: '#00c'
            }}>
                Drag and drop audio files here!
            </div>
        </button>
    )
}