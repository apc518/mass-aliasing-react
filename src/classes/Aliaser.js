/**
 * returns an AudioBuffer
 */
export function massAlias(speedupFactor, clipsEx){
    let outputBuffers = [[], []];

    for(let clip of clipsEx){
        for (let channel_idx = 0; channel_idx < 2; channel_idx++){
            // duplicate mono tracks to be stereo
            let channelData = clip.audioBuffer.getChannelData(channel_idx % clip.audioBuffer.numberOfChannels);
            for (let i = 0; i < channelData.length; i += Math.round(speedupFactor)){
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

    return outputAudioBuffer
}