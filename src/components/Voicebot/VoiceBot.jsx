// src/components/VoiceBot.jsx (Updated)

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Loader2, Volume2, X, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AudioRecorder from './AudioRecorder';
import ChatHistory from './ChatHistory';

// Removed: import './VoiceBot.css'; // REMOVED: Using Tailwind only

const API_BASE_URL = 'http://localhost:5000/api'||process.env.REACT_APP_API_URL ;

const VoiceBot = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [error, setError] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  
  const audioRecorderRef = useRef(null);
  const audioPlayerRef = useRef(null);

  // Stop any playing audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
    };
  }, []);

  // Handle starting recording
  const handleStartRecording = async () => {
    try {
      setError(null);
      if (audioRecorderRef.current) {
        await audioRecorderRef.current.startRecording();
        setIsRecording(true);
      }
    } catch (err) {
      console.error('Recording error:', err);
      setError(t('Microphone access denied. Please enable microphone permissions.'));
    }
  };

  // Handle stopping recording
  const handleStopRecording = async () => {
    try {
      if (audioRecorderRef.current) {
        const audioBlob = await audioRecorderRef.current.stopRecording();
        setIsRecording(false);
        
        if (audioBlob) {
          await sendAudioToBackend(audioBlob);
        }
      }
    } catch (err) {
      console.error('Stop recording error:', err);
      setError(t('Failed to process recording'));
      setIsRecording(false);
    }
  };

  // Send audio to backend API
  const sendAudioToBackend = async (audioBlob) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Prepare FormData
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      
      // Format conversation history for Gemini
      const history = conversation.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
      
      // You'll need to send the session ID if you want conversation context on the backend
      // For now, we'll send the history array directly in JSON format as expected by your backend
      formData.append('conversationHistory', JSON.stringify(history));

      // Make API call
      // NOTE: Your backend is expecting the conversationHistory as a string of the array.
      const response = await fetch(`${API_BASE_URL}/voice/query`, { // Corrected endpoint to /query
        method: 'POST',
        body: formData,
        credentials: 'include', // Include auth cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('Failed to process voice'));
      }

      if (data.success) {
        // Add user message
        const userMessage = {
          role: 'user',
          text: data.data.userText, // Access through data.data
          timestamp: Date.now()
        };

        // Add AI response
        const aiMessage = {
          role: 'assistant',
          text: data.data.aiText, // Access through data.data
          audioBase64: data.data.audioBase64, // Access through data.data
          timestamp: Date.now()
        };

        setConversation(prev => [...prev, userMessage, aiMessage]);

        // Play audio response
        if (data.data.audioBase64) {
          playAudioResponse(data.data.audioBase64);
        }
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message || t('Failed to process voice query'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Play audio response
  const playAudioResponse = (audioBase64) => {
    try {
      // Stop any currently playing audio
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }

      // Convert base64 to data URL
      const audioData = audioBase64.startsWith('data:') 
        ? audioBase64 
        : `data:audio/mp3;base64,${audioBase64}`;
      
      const audio = new Audio(audioData);
      audioPlayerRef.current = audio;
      
      audio.play().catch(err => {
        console.error('Audio playback error:', err);
      });

      audio.onended = () => {
        audioPlayerRef.current = null;
      };

      setCurrentAudio(audio);
    } catch (err) {
      console.error('Audio play error:', err);
    }
  };

  // Clear conversation
  const handleClearConversation = () => {
    setConversation([]);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      {/* Voice Bot Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 z-40 w-[400px] h-[600px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-emerald-200 dark:border-emerald-700 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  <h3 className="font-bold text-lg">{t('Voice Assistant')}</h3>
                </div>
                {conversation.length > 0 && (
                  <button
                    onClick={handleClearConversation}
                    className="text-sm px-3 py-1 bg-white/20 rounded-full hover:bg-white/30 transition"
                  >
                    {t('Clear')}
                  </button>
                )}
              </div>
              <p className="text-xs text-white/80 mt-1">
                {t('Ask me anything in Kannada')}
              </p>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto">
              <ChatHistory 
                conversation={conversation}
                onPlayAudio={playAudioResponse}
              />
            </div>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Recording Controls */}
            <div className="p-4 bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-center gap-4">
                {/* Hidden AudioRecorder component */}
                <AudioRecorder ref={audioRecorderRef} />

                {/* Record Button - Replaced custom CSS with Tailwind utilities */}
                <motion.button
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  disabled={isProcessing}
                  className={`relative p-6 rounded-full transition-all duration-300 ${
                    isRecording
                      ? 'bg-red-500 hover:bg-red-600' // Base color
                      : 'bg-emerald-500 hover:bg-emerald-600'
                  } text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                  whileHover={{ scale: isProcessing ? 1 : 1.1 }}
                  whileTap={{ scale: isProcessing ? 1 : 0.95 }}
                >
                  {/* Tailwind Ping Animation for Recording Pulse */}
                  {isRecording && (
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping top-0 left-0"></span>
                  )}
                  {isProcessing ? (
                    <Loader2 className="w-8 h-8 animate-spin relative z-10" />
                  ) : isRecording ? (
                    <MicOff className="w-8 h-8 relative z-10" />
                  ) : (
                    <Mic className="w-8 h-8 relative z-10" />
                  )}
                </motion.button>
              </div>

              {/* Status Text */}
              <div className="text-center mt-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {isProcessing
                    ? t('Processing...')
                    : isRecording
                    ? t('Recording... Tap to stop')
                    : t('Tap to speak')}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceBot;