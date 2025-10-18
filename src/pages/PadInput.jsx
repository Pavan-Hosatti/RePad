import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
// NEW IMPORTS for TTS and UI
import { Volume2, VolumeX } from 'lucide-react'; 

// IMPORT FOR TTS HOOK (Assuming this path is correct based on your previous component)
// You need to provide the actual path to your TTS hook, adjusting as necessary.
import useTextToSpeech from '../hooks/useVoiceStatus.js'; 

// DUMMY IMPORTS for the new component's logic (Replace with actual imports if needed)
// Assuming these were previously defined:
const useCropPrediction = () => ({ 
    predictions: [
        { id: 1, name: 'Cotton', confidence: '92%', status: 'Recommended' },
        { id: 2, name: 'Wheat', confidence: '85%', status: 'Caution' },
        { id: 3, name: 'Rice', confidence: '98%', status: 'Optimal' },
    ], 
    fetchPredictions: () => console.log('Fetching predictions...'),
});

const CropPredictionCard = ({ prediction }) => {
    const { t } = useTranslation();
    const { speak, stop, isSupported, isMuted } = useVoiceControlContext(); // Assuming a context for mute state
    
    // Fallback for simplicity: just read the name
    const handleDoubleClick = (text) => {
        if (isSupported && !isMuted) {
            stop();
            speak(text);
        }
    }

    return (
        <motion.div 
            className="p-6 bg-white dark:bg-slate-700 rounded-lg shadow-lg"
            onDoubleClick={() => handleDoubleClick(`${t(prediction.name)}, ${t('confidence')}: ${prediction.confidence}, ${t('status')}: ${prediction.status}`)}
        >
            <h3 className="text-xl font-semibold dark:text-white">{t(prediction.name)}</h3>
            <p className="text-gray-500 dark:text-gray-400">{t('Confidence')}: {prediction.confidence}</p>
            <p className={`font-bold ${prediction.status === 'Optimal' ? 'text-green-500' : 'text-yellow-500'}`}>{t(prediction.status)}</p>
        </motion.div>
    );
};

// Assuming a context hook or adjusting for a simpler pattern
// For this example, we'll keep the TTS state and functions local in PadInput
const useVoiceControlContext = () => {
    const { i18n } = useTranslation();
    const currentLangCode = i18n.resolvedLanguage;
    const { speak, stop, isSupported } = useTextToSpeech(currentLangCode);
    const [isMuted, setIsMuted] = useState(false);

    const handleDoubleClickSpeech = (text) => {
        if (isSupported && !isMuted) {
            stop(); 
            speak(text);
        }
    };
    
    const toggleMute = () => {
        if (!isMuted) {
            stop();
        }
        setIsMuted(prev => !prev);
    };

    return { speak, stop, isSupported, isMuted, setIsMuted, handleDoubleClickSpeech, toggleMute };
}


// Renamed Component: PadInput
const PadInput = () => {
    const { t, i18n } = useTranslation();
    const { 
        speak, 
        stop, 
        isSupported, 
        isMuted, 
        toggleMute, 
        handleDoubleClickSpeech 
    } = useVoiceControlContext(); // Custom hook to manage TTS

    // Use the dummy hook for predictions
    const { predictions, fetchPredictions } = useCropPrediction(); 

    useEffect(() => {
        // Renaming to be more generic for 'PadInput' but keeping the original logic
        fetchPredictions(); 
    }, [fetchPredictions]); // Added fetchPredictions to dependency array to satisfy ESLint

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-slate-900 dark:to-slate-800 pt-20">
            
            {/* Mute/Unmute Button (Fixed position) */}
            {isSupported && (
                <motion.button
                    onClick={toggleMute}
                    className="fixed top-6 right-6 p-3 bg-gray-700/10 backdrop-blur-sm rounded-full text-gray-700 dark:text-white hover:bg-gray-700/30 dark:hover:bg-white/30 transition z-50 border border-gray-300 dark:border-white/20"
                    title={isMuted ? t('Unmute TTS') : t('Mute TTS')}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </motion.button>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="mb-12 text-center"
                >
                    <h1 
                        className="text-4xl font-bold text-gray-900 dark:text-white mb-2"
                        onDoubleClick={() => handleDoubleClickSpeech(t('cropPrediction.header.title'))}
                    >
                        {t('cropPrediction.header.title')}
                    </h1>
                    <p 
                        className="text-gray-600 dark:text-gray-300"
                        onDoubleClick={() => handleDoubleClickSpeech(t('cropPrediction.header.subtitle'))}
                    >
                        {t('cropPrediction.header.subtitle')}
                    </p>
                </motion.div>

                {/* Predictions Grid */}
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: 0.2 }} 
                    className="grid md:grid-cols-3 gap-6"
                >
                    {predictions.map((prediction, index) => (
                        // This component needs access to TTS functions too, which would typically 
                        // be passed via props or context. I'll modify the assumed Card structure 
                        // to use a simple context mock for demonstration.
                        <CropPredictionCard key={prediction.id} prediction={prediction} />
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default PadInput;