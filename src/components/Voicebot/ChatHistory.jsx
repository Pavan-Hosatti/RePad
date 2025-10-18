// src/components/ChatHistory.jsx

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';

const ChatHistory = ({ conversation, onPlayAudio }) => {
    const messagesEndRef = useRef(null);

    // Auto-scroll to the bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation]);

    return (
        <div className="p-4 space-y-4">
            {conversation.length === 0 && (
                <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                    <p>Start your voice conversation now.</p>
                    <p className="text-xs mt-1">
                        {/** You can show a Kannada message here to match the backend theme if i18n allows */}
                        Ask about crops or farming.
                    </p>
                </div>
            )}

            {conversation.map((message, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                        className={`max-w-[80%] p-3 rounded-xl shadow-md ${
                            message.role === 'user'
                                ? 'bg-emerald-500 text-white rounded-br-none'
                                : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
                        }`}
                    >
                        <p className="text-sm">{message.text}</p>
                        {/* Play Audio Button for AI responses */}
                        {message.role === 'assistant' && message.audioBase64 && (
                            <button
                                onClick={() => onPlayAudio(message.audioBase64)}
                                className="mt-2 text-xs flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
                            >
                                <Volume2 className="w-3 h-3" />
                                Listen again
                            </button>
                        )}
                    </div>
                </motion.div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatHistory;