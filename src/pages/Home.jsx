
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
// Updated Icon Imports for a Tech/Health/Waste Management Theme
import { 
    Zap, Filter, Trash2, Shield, HeartPulse, Cpu, 
    Volume2, VolumeX, ChevronRight, ArrowRight, 
    Thermometer, CheckCircle, Flame, Factory 
} from 'lucide-react';
import VoiceBot from '../components/VoiceBot/VoiceBot';

// IMPORT FOR I18N
import { useTranslation } from 'react-i18next';

// IMPORT FOR TTS HOOK (Adjust path as necessary)
import useTextToSpeech from '../hooks/useVoiceStatus.js';

gsap.registerPlugin(ScrollTrigger);

// Renamed Component
const SmartDisposalSystem = () => {
    // HOOK FOR I18N
    const { t, i18n } = useTranslation();

    // NEW: Text-to-Speech Hook Integration
    const currentLangCode = i18n.resolvedLanguage;
    const { speak, stop, isSupported } = useTextToSpeech(currentLangCode);
    const [isMuted, setIsMuted] = useState(false); // To manage a global Mute state

    const containerRef = useRef(null);
    // Renamed from activeStage to activeStep, still controls the How It Works section
    const [activeStep, setActiveStep] = useState(0);

    // NEW: Function to handle double-click speech
    const handleDoubleClickSpeech = (text) => {
        // Only speak if TTS is supported and not globally muted
        if (isSupported && !isMuted) {
            stop(); // Stop current speech before starting a new one
            speak(text);
        } else if (isSupported && isMuted) {
            // Optionally give feedback if muted
            console.log("TTS is currently muted. Click the speaker icon to unmute.");
        } else {
            console.warn("Text-to-Speech not supported in this browser.");
        }
    };

    // NEW: Function to toggle mute
    const toggleMute = () => {
        if (!isMuted) {
            stop(); // Stop immediately if we are muting
        }
        setIsMuted(prev => !prev);
    };


    useEffect(() => {
        if (!containerRef.current) return;

        // Auto-play stages every 5 seconds (Updated to 4 steps)
        const stepInterval = setInterval(() => {
            setActiveStep(prev => (prev + 1) % 4); // Based on 4 main steps in solutionSteps
        }, 5000);

        // --- GSAP ANIMATION LOGIC (UNCHANGED) ---
        const fadeElements = containerRef.current.querySelectorAll('.fade-in');
        fadeElements.forEach((el, idx) => {
            gsap.fromTo(
                el,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1, delay: idx * 0.15, ease: 'power2.out' }
            );
        });

        // REMOVED: Hero Image BG scroll animation, as we're now using a split layout visual.

        const cards = containerRef.current.querySelectorAll('.feature-card'); // Updated class name
        cards.forEach((card, idx) => {
            gsap.fromTo(
                card,
                { opacity: 0, y: 50 },
                {
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 85%',
                        end: 'top 55%',
                        scrub: 0.5,
                    },
                    opacity: 1,
                    y: 0,
                    ease: 'power2.out',
                }
            );
        });

        const ctaSection = containerRef.current.querySelector('.cta-section');
        if (ctaSection) {
            gsap.fromTo(
                ctaSection,
                { opacity: 0, scale: 0.95 },
                {
                    scrollTrigger: {
                        trigger: ctaSection,
                        start: 'top 70%',
                        end: 'top 40%',
                        scrub: 0.5,
                    },
                    opacity: 1,
                    scale: 1,
                    ease: 'power2.out',
                }
            );
        }
        // --- END GSAP ANIMATION LOGIC ---


        return () => {
            clearInterval(stepInterval);
            
            // 🔥 FIX: Added null check for containerRef.current to prevent the TypeError
            if (containerRef.current) {
                // Ensure ScrollTrigger cleanup is specific to the component.
                ScrollTrigger.getAll().forEach(trigger => {
                    // Also check if trigger.vars.trigger exists before calling .contains()
                    if (trigger.vars.trigger && containerRef.current.contains(trigger.vars.trigger)) {
                        trigger.kill();
                    }
                });
            }
        };
    }, []);

    // Data for the Stats section (Based on Impact)
    const stats = [
        { value: '99%', label: t('Sterilization Rate') },
        { value: '95%', label: t('Emission Reduction') },
        { value: '80%', label: t('Volume Reduction') },
        { value: 'IoT', label: t('Real-Time Data') }
    ];

    // Data for the Proposed Solution (How It Works)
    const solutionSteps = [
        { 
            icon: '🧠', 
            title: t('AI-Powered Detection'), 
            desc: t('Camera sensors identify sanitary pads in disposal bins, ensuring correct segregation and reducing human contact with hazardous waste.') 
        },
        { 
            icon: '🔥', 
            title: t('Controlled Thermal Treatment'), 
            desc: t('Pads are heated at 200–400°C, sterilizing waste, killing pathogens, and reducing volume without producing highly toxic gases.') 
        },
        { 
            icon: '💨', 
            title: t('Multi-Layer Filtration'), 
            desc: t('Catalytic, Activated Carbon, and HEPA filters eliminate CO, VOCs, and PM2.5/PM10. AI sensors monitor emissions in real-time.') 
        },
        { 
            icon: '🧱', 
            title: t('Post-Treatment Handling'), 
            desc: t('Sterilized waste is crushed and compacted for eco-bricks or safe disposal, preventing landfill and environmental contamination.') 
        }
    ];
    
    // Data for the Why Choose Us section (Innovation/Feasibility/Impact)
    const systemFeatures = [
        { icon: <Zap className="w-8 h-8 text-indigo-500" />, title: t('AI-Vision & IoT'), desc: t('Automatic waste detection and real-time monitoring for optimized operation.') },
        { icon: <Filter className="w-8 h-8 text-indigo-500" />, title: t('Zero-Toxic Emissions'), desc: t('Advanced multi-layer filtration eliminates dioxins, furans, VOCs, and PM.') },
        { icon: <Shield className="w-8 h-8 text-indigo-500" />, title: t('Health & Safety Focus'), desc: t('Eliminates manual handling and ensures complete pathogen sterilization.') },
        { icon: <HeartPulse className="w-8 h-8 text-indigo-500" />, title: t('Data-Driven Insights'), desc: t('Provides municipalities with actionable data for predictive maintenance and logistics.') },
        { icon: <Trash2 className="w-8 h-8 text-indigo-500" />, title: t('Eco-Brick Recovery'), desc: t('Compacted sterile residue can be used for eco-friendly building materials.') },
        { icon: <Factory className="w-8 h-8 text-indigo-500" />, title: t('Scalable & Modular'), desc: t('Suitable for diverse locations: schools, hospitals, hostels, and urban centers.') }
    ];

    return (
        <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-x-hidden">

            {/* HERO SECTION WITH SPLIT LAYOUT FOR VISUAL IMPACT */}
            <section className="relative w-full min-h-screen pt-24 pb-12 flex items-center overflow-hidden">
                {/* Background Gradient & Overlay (Slightly reduced darkness for better visual column contrast) */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-indigo-900/75" />
                
                {/* NEW: Mute/Unmute Button (Fixed position remains) */}
                {isSupported && (
                    <motion.button
                        onClick={toggleMute}
                        className="fixed top-6 right-24 p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition z-[100] border border-white/20"
                        title={isMuted ? t('Unmute TTS') : t('Mute TTS')}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </motion.button>
                )}

                {/* Hero Content - Split Grid */}
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 grid md:grid-cols-2 gap-12 items-center">
                    
                    {/* LEFT COLUMN: Text and CTA (Retained original fade-in animations) */}
                    <div className="py-24 md:py-0">
                        <motion.div
                            className="fade-in inline-flex items-center gap-2 px-6 py-3 bg-purple-500/20 backdrop-blur-md border border-purple-300/60 rounded-full text-purple-100 text-sm font-medium mb-8 shadow-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            onDoubleClick={() => handleDoubleClickSpeech(t('Revolutionizing Menstrual Waste Management'))}
                        >
                            <Zap className="w-4 h-4" />
                            <span>{t('Revolutionizing Menstrual Waste Management')}</span>
                            <ChevronRight className="w-4 h-4" />
                        </motion.div>

                        <motion.h1
                            className="fade-in text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight drop-shadow-lg"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            onDoubleClick={() => handleDoubleClickSpeech(`${t('Smart')} ${t('Disposal System')}. ${t('Sanitary Waste, Solved')}`)}
                        >
                            {t('Smart')}
                            <span className="block text-purple-200">{t('Disposal System')}</span>
                        </motion.h1>

                        <motion.p
                            className="fade-in text-xl md:text-2xl text-gray-50 mb-10 leading-relaxed font-medium max-w-2xl drop-shadow-md"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            onDoubleClick={() => handleDoubleClickSpeech(t('AI-powered segregation and controlled thermal treatment for safe, sustainable, and zero-emission sanitary pad disposal.'))}
                        >
                            {t('AI-powered segregation and controlled thermal treatment for safe, sustainable, and zero-emission sanitary pad disposal.')}
                        </motion.p>

                        <motion.div
                            className="fade-in flex flex-col sm:flex-row gap-4"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                        >
                            <button className="px-10 py-4 bg-indigo-500 text-white font-bold rounded-full hover:bg-indigo-600 transition-all duration-300 flex items-center gap-2 text-lg hover:shadow-lg">
                                {t('Request a Demo')}
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <button className="px-10 py-4 border-2 border-purple-200 text-white font-bold rounded-full hover:bg-white/20 transition-all flex items-center gap-2 text-lg">
                                <Shield className="w-5 h-5" /> {t('View Health Report')}
                            </button>
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN: NEW Hero Visual */}
                    <div className="relative h-full flex justify-center items-center pointer-events-none p-8 md:p-0">
                        <motion.div
                            className="fade-in w-full max-w-lg md:max-w-none"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
                        >
                            <img
                                // Using the original image but now placing it directly in the content area for prominence
                                src="/girlfine.png"
                                alt={t("Minimalist Clean Tech Sanitary Disposal System Illustration")} // Alt text translated
                                className="w-full h-auto object-contain rounded-3xl shadow-2xl border-4 border-indigo-400/50"
                            />
                            <div className="absolute inset-0 bg-indigo-900/10 rounded-3xl" />
                        </motion.div>
                    </div>

                </div>
            </section>

            {/* --- */}

            {/* STATS SECTION - BELOW HERO */}
            <section className="relative py-16 bg-white/60 dark:bg-slate-900/60 backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 gap-8"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                className="text-center"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                // TTS double-click added (read only the label)
                                onDoubleClick={() => handleDoubleClickSpeech(stat.label)}
                            >
                                {/* Updated color: text-indigo-600 */}
                                <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-lg text-gray-700 dark:text-gray-300 font-semibold">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* --- */}

            {/* HOW IT WORKS / SOLUTION STEPS */}
            <section className="relative py-32 lg:py-40 bg-white/50 dark:bg-slate-900/50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center mb-20"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2
                            className="text-6xl md:text-7xl font-black text-gray-900 dark:text-white mb-6"
                            // TTS double-click added
                            onDoubleClick={() => handleDoubleClickSpeech(`${t('The')} ${t('Four-Step Solution')}`)}
                        >
                            {t('The')} <span className="text-indigo-600 dark:text-indigo-400">{t('Four-Step Solution')}</span>
                        </h2>
                    </motion.div>

                    <div className="flex gap-3 justify-center flex-wrap mb-16">
                        {solutionSteps.map((step, idx) => (
                            <motion.button
                                key={idx}
                                onClick={() => setActiveStep(idx)}
                                className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                                    // Updated color: bg-indigo-600, border-indigo-200
                                    activeStep === idx
                                        ? 'bg-indigo-600 text-white scale-110 shadow-lg'
                                        : 'bg-white/70 dark:bg-slate-800/70 text-gray-700 dark:text-gray-300 border border-indigo-200 dark:border-indigo-700'
                                    }`}
                                whileHover={{ scale: 1.05 }}
                            >
                                {`0${idx + 1}`}
                            </motion.button>
                        ))}
                    </div>

                    <motion.div
                        // Updated border color: border-indigo-200
                        className="p-12 bg-white/80 dark:bg-slate-800/80 rounded-3xl border border-indigo-200 dark:border-indigo-700 backdrop-blur-sm"
                        key={activeStep}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        // TTS double-click added (reads title and description)
                        onDoubleClick={() => handleDoubleClickSpeech(`${solutionSteps[activeStep].title}. ${solutionSteps[activeStep].desc}`)}
                    >
                        <div className="text-6xl mb-6">
                            {solutionSteps[activeStep].icon}
                        </div>
                        {/* Updated color: text-indigo-700 */}
                        <h3 className="text-4xl font-black text-indigo-700 dark:text-indigo-400 mb-4">
                            {solutionSteps[activeStep].title}
                        </h3>
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                            {solutionSteps[activeStep].desc}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* --- */}

            {/* SYSTEM FEATURES / WHY CHOOSE US */}
            <section className="relative py-32 lg:py-40 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
                <motion.div
                    className="text-center mb-20"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <h2
                        className="text-6xl md:text-7xl font-black text-gray-900 dark:text-white mb-6"
                        // TTS double-click added
                        onDoubleClick={() => handleDoubleClickSpeech(`${t('System')} ${t('Innovation and Impact')}`)}
                    >
                        {t('System')} <span className="text-indigo-600 dark:text-indigo-400">{t('Innovation and Impact')}</span>
                    </h2>
                </motion.div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {systemFeatures.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                // Updated class name: feature-card
                                // Updated border color: border-indigo-200
                                className="feature-card p-8 bg-white/90 dark:bg-slate-800/90 rounded-2xl border border-indigo-200 dark:border-indigo-700 shadow-lg backdrop-blur-sm"
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: idx * 0.05 }}
                                viewport={{ once: true, margin: '-100px' }}
                                whileHover={{ y: -5 }}
                                // TTS double-click added
                                onDoubleClick={() => handleDoubleClickSpeech(`${feature.title}. ${feature.desc}`)}
                            >
                                <div className="mb-4">{feature.icon}</div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- */}

            {/* CTA SECTION */}
            {/* Updated gradient color: from-indigo-600 to-purple-600 */}
            <section className="relative py-40 lg:py-48 overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600">
                {/* Background divs have no text */}

                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center cta-section">
                    <motion.h2
                        className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-tight"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        // TTS double-click added
                        onDoubleClick={() => handleDoubleClickSpeech(t('Ready to Implement a Safe Solution?'))}
                    >
                        {t('Ready to Implement a Safe Solution?')}
                    </motion.h2>

                    <motion.p
                        className="text-2xl md:text-3xl text-white/90 mb-12 leading-relaxed max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        viewport={{ once: true }}
                        // TTS double-click added
                        onDoubleClick={() => handleDoubleClickSpeech(t('Join institutions and cities prioritizing public health and environmental sustainability.'))}
                    >
                        {t('Join institutions and cities prioritizing public health and environmental sustainability.')}
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-6 justify-center"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        {/* Updated color: text-indigo-600 */}
                        <button className="px-12 py-5 bg-white text-indigo-600 font-black text-lg rounded-full hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl">
                            {t('Get a Consultation')}
                        </button>

                        <button className="px-12 py-5 border-3 border-white text-white font-black text-lg rounded-full hover:bg-white/20 transition-all flex items-center gap-2">
                            <Cpu className="w-5 h-5" /> {t('View Tech Specs')}
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* --- */}

            {/* FOOTER */}
            {/* Updated color: text-indigo-400 */}
            <footer className="bg-slate-900 text-white py-16 border-t border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div>
                            <h3
                                className="text-3xl font-black text-indigo-400 mb-4"
                                // TTS double-click added
                                onDoubleClick={() => handleDoubleClickSpeech(t('Smart Disposal System'))}
                            >
                                {t('Smart Disposal System')}
                            </h3>
                            <p
                                className="text-slate-400"
                                // TTS double-click added
                                onDoubleClick={() => handleDoubleClickSpeech(t('Safe Disposal, Clean Air, Better Health'))}
                            >
                                {t('Safe Disposal, Clean Air, Better Health')}
                            </p>
                        </div>
                        <div>
                            <h4
                                className="font-semibold text-white mb-4"
                                // TTS double-click added
                                onDoubleClick={() => handleDoubleClickSpeech(t('System'))}
                            >
                                {t('System')}
                            </h4>
                            <ul className="space-y-2 text-slate-400 text-sm">
                                <li><a href="#" className="hover:text-indigo-400 transition" onDoubleClick={() => handleDoubleClickSpeech(t('How it Works'))}>{t('How it Works')}</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition" onDoubleClick={() => handleDoubleClickSpeech(t('Emissions Report'))}>{t('Emissions Report')}</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition" onDoubleClick={() => handleDoubleClickSpeech(t('IoT Dashboard'))}>{t('IoT Dashboard')}</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4
                                className="font-semibold text-white mb-4"
                                // TTS double-click added
                                onDoubleClick={() => handleDoubleClickSpeech(t('Resources'))}
                            >
                                {t('Resources')}
                            </h4>
                            <ul className="space-y-2 text-slate-400 text-sm">
                                <li><a href="#" className="hover:text-indigo-400 transition" onDoubleClick={() => handleDoubleClickSpeech(t('Documentation'))}>{t('Documentation')}</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition" onDoubleClick={() => handleDoubleClickSpeech(t('Safety Guidelines'))}>{t('Safety Guidelines')}</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition" onDoubleClick={() => handleDoubleClickSpeech(t('Case Studies'))}>{t('Case Studies')}</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4
                                className="font-semibold text-white mb-4"
                                // TTS double-click added
                                onDoubleClick={() => handleDoubleClickSpeech(t('Company'))}
                            >
                                {t('Company')}
                            </h4>
                            <ul className="space-y-2 text-slate-400 text-sm">
                                <li><a href="#" className="hover:text-indigo-400 transition" onDoubleClick={() => handleDoubleClickSpeech(t('About Us'))}>{t('About Us')}</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition" onDoubleClick={() => handleDoubleClickSpeech(t('Municipal Partnerships'))}>{t('Municipal Partnerships')}</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition" onDoubleClick={() => handleDoubleClickSpeech(t('Contact'))}>{t('Contact')}</a></li>
                            </ul>
                        </div>
                    </div>
                    <div
                        className="border-t border-slate-700 pt-8 text-center text-slate-500 text-sm"
                        // TTS double-click added
                        onDoubleClick={() => handleDoubleClickSpeech(t('© 2025 Smart Disposal System. Built for a cleaner world.'))}
                    >
                        <p>{t('© 2025 Smart Disposal System. Built for a cleaner world.')}</p>
                    </div>
                </div>
            </footer>

            {/* VoiceBot Placement: */}
            <VoiceBot />
        </div>
    );
};

// Export the new component name
export default SmartDisposalSystem;
