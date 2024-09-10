import WaveSurfer from 'wavesurfer.js';
import React, { useState, useRef, useEffect } from 'react';
import { PauseIcon, VoiceRecordIcon, PlayIcon, DeleteIcon, StopIcon } from '../UI/Icons/Icons';

const VoiceRecorder: React.FC = () => {
    const [recording, setRecording] = useState<boolean>(false);
    const [paused, setPaused] = useState<boolean>(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [recordingTime, setRecordingTime] = useState<number>(0);
    const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const waveformRef = useRef<HTMLDivElement | null>(null); // Reference to the waveform container
    const recordingTimerRef = useRef<number | null>(null);

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        setRecording(true);
        setRecordingTime(0); // Reset recording time

        mediaRecorder.ondataavailable = (event) => {
            chunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudioUrl(audioUrl);
            stopRecordingTimer();
            // send audioBlob to server
        };

        mediaRecorder.start();
        startRecordingTimer(); // Start timer to track recording time
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            // Stop the media stream tracks
            const stream = mediaRecorderRef.current.stream;
            stream.getTracks().forEach((track) => track.stop()); // Stop all tracks (audio)
        }
        setRecording(false);
        stopRecordingTimer();
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.pause();
        }
        setPaused(true);
        stopRecordingTimer();
    };

    const resumeRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.resume();
        }
        setPaused(false);
        startRecordingTimer();
    };

    const startRecordingTimer = () => {
        recordingTimerRef.current = setInterval(() => {
            setRecordingTime((prev) => prev + 1); // Update recording time every second
        }, 1000);
    };

    const stopRecordingTimer = () => {
        if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current);
        }
    };

    const playPauseAudio = () => {
        if (wavesurfer) {
            wavesurfer.playPause(); // Toggle play/pause in Wavesurfer
            setIsPlaying(wavesurfer.isPlaying());
        }
    };

    useEffect(() => {
        if (audioUrl && waveformRef.current) {
            const ws = WaveSurfer.create({
                container: waveformRef.current,
                waveColor: '#ddd',
                progressColor: '#4a90e2',
                height: 20,
                width: 400
                // responsive: true,
            });
            ws.load(audioUrl); // Load the recorded audio
            setWavesurfer(ws);
            ws.on('finish', () => {
                setIsPlaying(false);
            })
            return () => {
                ws.destroy(); // Cleanup on unmount
            };
        }
    }, [audioUrl]);

    const deleteRecording = () => {
        setAudioUrl(null);
        chunksRef.current = [];
        setRecording(false);
        setPaused(false);
        setIsPlaying(false);
        if (mediaRecorderRef.current) {
            const stream = mediaRecorderRef.current.stream;
            stream.getTracks().forEach((track) => track.stop()); // Stop all tracks (audio)
        }
    };

    return (
        <div className='flex flex-col items-center  bg-white'>
            {recording && (
                <div className='flex flex-col items-center'>
                    <div className='flex'>
                        {paused ? (
                            <a onClick={resumeRecording}><VoiceRecordIcon /></a>
                        ) : (
                            <a onClick={pauseRecording}><PauseIcon /></a>
                        )}
                        <a onClick={stopRecording}><StopIcon /></a>
                    </div>
                    {/* Progress bar for recording time */}
                    <div className='mt-2 w-full'>
                        <div className='bg-gray-300 w-full h-2 rounded'>
                            <div
                                className='bg-blue-600 h-2 rounded'
                                style={{ width: `${(recordingTime / 60) * 100}%` }} // Assuming max 60s recording time
                            />
                        </div>
                        <span>{recordingTime}s</span>
                    </div>
                </div>
            )}
            {(!recording && !audioUrl) && <a onClick={startRecording}><VoiceRecordIcon /></a>}
            {audioUrl && (
                <div className='flex flex-col items-center mt-4'>
                    {/* Waveform visualization */}
                    <div ref={waveformRef} className='w-full'></div>
                    <div className='flex items-center mt-2'>
                        {isPlaying ? (
                            <a onClick={playPauseAudio}><PauseIcon /></a>
                        ) : (
                            <a onClick={playPauseAudio}><PlayIcon /></a>
                        )}
                        <a onClick={deleteRecording}><DeleteIcon /></a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceRecorder;


// import React, { useState, useRef } from 'react';
// import { PauseIcon, VoiceRecordIcon } from '../UI/Icons/Icons';

// const VoiceRecorder: React.FC = () => {
//     const [recording, setRecording] = useState<boolean>(false);
//     const [paused, setPaused] = useState<boolean>(false);
//     const [audioUrl, setAudioUrl] = useState<string | null>(null);
//     const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//     const chunksRef = useRef<Blob[]>([]);

//     const startRecording = async () => {
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         const mediaRecorder = new MediaRecorder(stream);
//         mediaRecorderRef.current = mediaRecorder;
//         setRecording(true);

//         mediaRecorder.ondataavailable = (event) => {
//             chunksRef.current.push(event.data);
//         };

//         mediaRecorder.onstop = () => {
//             const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
//             const audioUrl = URL.createObjectURL(audioBlob);
//             setAudioUrl(audioUrl);

//             // Send audioBlob to the server via Socket.io
//             // socket.emit('send_voice_message', audioBlob);
//         };

//         mediaRecorder.start();
//     };

//     const stopRecording = () => {
//         if (mediaRecorderRef.current) {
//             mediaRecorderRef.current.stop();
//         }
//         setRecording(false);
//     };

//     const pauseRecording = () => {
//         if (mediaRecorderRef.current) {
//             mediaRecorderRef.current.pause();
//         }
//         setPaused(true);
//     };

//     const resumeRecording = () => {
//         if (mediaRecorderRef.current) {
//             mediaRecorderRef.current.resume();
//         }
//         setPaused(false);
//     };

//     return (
//         <div className='flex'>
//             {(recording && paused) &&
//                 <a onClick={resumeRecording}><VoiceRecordIcon /></a>
//             }

//             {(recording && !paused) && <a onClick={pauseRecording}>
//                 <PauseIcon />
//             </a>}

//             {recording ? <a onClick={stopRecording}>Stop</a> : <a onClick={startRecording}>
//                 <VoiceRecordIcon />
//             </a>}

//             {audioUrl && (
//                 <audio controls>
//                     <source src={audioUrl} type="audio/webm" />
//                     Your browser does not support the audio element.
//                 </audio>
//             )}
//         </div>
//     );
// };

// export default VoiceRecorder;
