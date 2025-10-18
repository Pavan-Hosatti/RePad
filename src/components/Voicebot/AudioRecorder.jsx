// src/components/AudioRecorder.jsx

import React, { useImperativeHandle, forwardRef } from 'react';

// Define the MIME type to use for recording
// 'audio/webm;codecs=opus' is the modern, highly compatible, and quality format
const getSupportedMimeType = () => {
    if (typeof MediaRecorder === 'undefined') {
        return null;
    }
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        return 'audio/webm;codecs=opus';
    }
    if (MediaRecorder.isTypeSupported('audio/webm')) {
        return 'audio/webm';
    }
    // Fallback to a generally supported type, though less reliable for all browsers
    return 'audio/wav'; 
};

const AudioRecorder = forwardRef((props, ref) => {
    // State variables (internal to the component)
    let mediaRecorder = null;
    let audioChunks = [];
    let stream = null;
    let resolveStopPromise = null;

    // Public functions exposed via the ref
    useImperativeHandle(ref, () => ({
        startRecording: async () => {
            const mimeType = getSupportedMimeType();
            if (!mimeType) {
                // Throw error if MediaRecorder is not supported at all
                throw new Error("MediaRecorder API not supported in this browser.");
            }

            try {
                // 1. Request microphone access
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                
                audioChunks = [];
                
                // 2. Initialize MediaRecorder with the supported MIME type (The Fix!)
                mediaRecorder = new MediaRecorder(stream, { mimeType }); 

                // 3. Define event handlers
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: mimeType });
                    // Resolve the promise from the `stopRecording` function
                    if (resolveStopPromise) {
                        resolveStopPromise(audioBlob);
                        resolveStopPromise = null;
                    }
                    // Stop tracks to release microphone
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorder.onerror = (event) => {
                    console.error('MediaRecorder error:', event.error);
                    // Reject the promise if there's an error during recording
                    if (resolveStopPromise) {
                        resolveStopPromise(null); // Return null or re-throw an error
                        resolveStopPromise = null;
                    }
                    // Stop tracks to release microphone
                    stream.getTracks().forEach(track => track.stop());
                    throw new Error("Recording failed due to media error.");
                };


                // 4. Start recording
                mediaRecorder.start();
                console.log("Recording started with MIME type:", mimeType);

            } catch (err) {
                // Re-throw for parent component (VoiceBot.jsx) to catch and handle
                console.error("Error accessing microphone:", err);
                // Ensure tracks are stopped if an error occurs during setup
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
                
                // Throw a custom error that is easier to catch and display in the UI
                throw new Error("Microphone access denied or failed.");
            }
        },

        stopRecording: () => {
            // Returns a promise that resolves with the final audio blob
            return new Promise((resolve, reject) => {
                if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                    // Set the promise resolve function so it can be called inside mediaRecorder.onstop
                    resolveStopPromise = resolve;
                    mediaRecorder.stop();
                } else {
                    resolve(null);
                }
            });
        }
    }));

    // The component renders nothing visible
    return null;
});

export default AudioRecorder;