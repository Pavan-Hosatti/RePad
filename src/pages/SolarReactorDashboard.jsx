import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const SmartPadDisposal = () => {
    const [activeTab, setActiveTab] = useState('monitoring');
    const [systemStatus, setSystemStatus] = useState('operational');
    const [detectionActive, setDetectionActive] = useState(true);
    const [chamberTemp, setChamberTemp] = useState(25);
    const [targetTemp] = useState(350);
    const [padsDetected, setPadsDetected] = useState(0);
    const [padsProcessed, setPadsProcessed] = useState(1253); // Starting with a higher initial count
    const [processingStage, setProcessingStage] = useState('idle');
    
    // Emissions start at safe background levels
    const [emissions, setEmissions] = useState({
        co: 0.02, // ppm
        voc: 0.01, // ppm
        pm25: 3.2, // μg/m³
        nox: 0.005 // ppm
    });

    // Filter health degrades over time
    const [filterStatus, setFilterStatus] = useState({
        catalytic: 95,
        carbon: 87, // This one will drop to trigger the alert
        hepa: 92
    });

    const [envImpact, setEnvImpact] = useState({
        co2Saved: 350.5,
        wasteReduced: 1470,
        ecoBricks: 105,
        toxinsPrevented: 180.3
    });

    const [alerts, setAlerts] = useState([
        { id: 1, type: 'info', message: 'System initialization complete', time: '1 hr ago' },
    ]);

    // --- State Logic Helpers ---

    const addAlert = (type, message) => {
        const time = 'Just now';
        setAlerts(prev => [{ id: Date.now(), type, message, time }, ...prev.slice(0, 4)]);
    };

    const updateSystemStatus = useCallback((stage) => {
        if (stage === 'idle') {
            setSystemStatus('operational');
        } else if (stage === 'compaction' || stage === 'sterilization') {
            setSystemStatus('processing');
        } else {
            setSystemStatus('active');
        }
    }, []);

    // --- Simulation Effects ---

    // 1. Simulate ML detection and Anomaly Injection
    useEffect(() => {
        if (detectionActive && processingStage === 'idle') {
            const interval = setInterval(() => {
                if (Math.random() > 0.6) {
                    setPadsDetected(prev => prev + 1);
                    const confidence = Math.random() * 8 + 92; // 92% to 100%

                    if (confidence < 95 && padsDetected >= 3) {
                        addAlert('warning', `Low confidence detection (Pad ${padsDetected + 1}) - Confidence: ${confidence.toFixed(1)}%. Re-scanning.`);
                    } else if (Math.random() > 0.95) {
                        addAlert('error', `ML Error: Object classification failed. Human review requested.`);
                    } else {
                        addAlert('success', `Pad detected - Confidence: ${confidence.toFixed(1)}%`);
                    }
                }
            }, 3000); // Faster detection rate
            return () => clearInterval(interval);
        }
    }, [detectionActive, processingStage, padsDetected]);

    // 2. Start processing when queue builds up
    useEffect(() => {
        if (padsDetected >= 5 && processingStage === 'idle') {
            startProcessing();
        }
    }, [padsDetected, processingStage]);

    // 3. Filter Degradation Effect (Simulates wear over time)
    useEffect(() => {
        // Degrade filter health slightly based on processed count
        setFilterStatus(prev => ({
            ...prev,
            carbon: Math.max(70, 95 - Math.floor(padsProcessed / 50)), // Carbon drops faster
            catalytic: Math.max(80, 95 - Math.floor(padsProcessed / 100)),
        }));
        
        // Trigger a predictive maintenance alert if carbon filter is low
        if (filterStatus.carbon < 80) {
            const alertExists = alerts.some(a => a.id === 'carbon-alert');
            if (!alertExists) {
                 // Using a fixed ID to prevent spamming
                setAlerts(prev => [{ 
                    id: 'carbon-alert', 
                    type: 'warning', 
                    message: `PREDICTIVE: Carbon filter health critical (${filterStatus.carbon}%) - Requires replacement soon.`, 
                    time: 'Just now' 
                }, ...prev.filter(a => a.id !== 'carbon-alert').slice(0, 4)]);
            }
        } else {
            // Remove the warning if filter health recovers/is good
             setAlerts(prev => prev.filter(a => a.id !== 'carbon-alert'));
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [padsProcessed, filterStatus.carbon]);

    // --- Core Processing Logic ---

    const startProcessing = useCallback(async () => {
        const stages = [
            { name: 'transfer', duration: 2500, temp: 25 },
            { name: 'heating', duration: 7000, temp: 350 },
            { name: 'sterilization', duration: 4000, temp: 350 },
            { name: 'filtration', duration: 4500, temp: 250 },
            { name: 'cooling', duration: 3000, temp: 100 },
            { name: 'compaction', duration: 2000, temp: 50 }
        ];

        const initialPadsInBatch = padsDetected;
        
        for (const stage of stages) {
            setProcessingStage(stage.name);
            updateSystemStatus(stage.name);

            // Animate temperature
            const tempInterval = setInterval(() => {
                setChamberTemp(prev => {
                    const diff = stage.temp - prev;
                    return prev + (diff * 0.08);
                });
            }, 100);

            // Dynamic Emissions based on stage
            if (stage.name === 'heating' || stage.name === 'sterilization') {
                setEmissions({
                    co: Math.random() * 0.2 + 0.1, // High CO before filter works
                    voc: Math.random() * 0.1 + 0.05, 
                    pm25: Math.random() * 5 + 10, // High particulates
                    nox: Math.random() * 0.02 + 0.01
                });
            } else if (stage.name === 'filtration' || stage.name === 'cooling') {
                setEmissions(prev => ({
                    co: Math.max(0.01, prev.co * 0.5), // Drop emissions during filtration
                    voc: Math.max(0.005, prev.voc * 0.5),
                    pm25: Math.max(1.0, prev.pm25 * 0.4),
                    nox: Math.max(0.002, prev.nox * 0.5)
                }));
            } else {
                 setEmissions({ co: 0.02, voc: 0.01, pm25: 3.2, nox: 0.005 }); // Reset to background
            }

            await new Promise(resolve => setTimeout(resolve, stage.duration));
            clearInterval(tempInterval);
        }

        // --- Processing Completion ---
        setPadsProcessed(prev => prev + initialPadsInBatch);
        setPadsDetected(0);
        setProcessingStage('idle');
        setChamberTemp(25);
        updateSystemStatus('idle');

        // Update Environmental Impact
        setEnvImpact(prev => ({
            co2Saved: prev.co2Saved + (initialPadsInBatch * 0.5),
            wasteReduced: prev.wasteReduced + (initialPadsInBatch * 1.5), // Use smaller units for realism (kg)
            ecoBricks: prev.ecoBricks + Math.floor(initialPadsInBatch / 10),
            toxinsPrevented: prev.toxinsPrevented + (initialPadsInBatch * 0.3)
        }));

        addAlert('success', `Batch complete: ${initialPadsInBatch} pads sterilized & compacted.`);
        setEmissions({ co: 0.02, voc: 0.01, pm25: 3.2, nox: 0.005 }); // Final emissions reset
    }, [padsDetected, updateSystemStatus]);


    // --- UI/Style Helpers ---
    
    const getStageColor = (stage) => {
        const colors = {
            idle: 'bg-gray-400',
            transfer: 'bg-blue-500',
            heating: 'bg-orange-500',
            sterilization: 'bg-red-500',
            filtration: 'bg-green-500',
            cooling: 'bg-cyan-500',
            compaction: 'bg-purple-500'
        };
        return colors[stage] || 'bg-gray-400';
    };

    const getTempColor = (temp) => {
        if (temp < 100) return 'text-blue-400';
        if (temp < 200) return 'text-yellow-400';
        if (temp < 300) return 'text-orange-400';
        return 'text-red-400';
    };

    const getFilterColor = (percent) => {
        if (percent >= 85) return 'bg-green-500';
        if (percent >= 75) return 'bg-yellow-500';
        return 'bg-red-500';
    };
    
    const getEmissionStatusColor = (value, safeLimit, dangerLimit) => {
        if (value > dangerLimit) return 'text-red-400';
        if (value > safeLimit) return 'text-yellow-400';
        return 'text-green-400';
    };

    const EmissionCard = ({ title, value, unit, safe, danger }) => (
        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-purple-500/50 transition duration-300">
            <p className="text-gray-400 text-sm mb-2 flex justify-between items-center">
                <span>{title}</span>
                <span className={`text-xs font-semibold ${getEmissionStatusColor(value, safe, danger)}`}>
                    {value > danger ? 'DANGER' : value > safe ? 'HIGH' : 'SAFE'}
                </span>
            </p>
            <p className={`text-3xl font-bold ${getEmissionStatusColor(value, safe, danger)}`}>
                {value.toFixed(3)}
            </p>
            <p className="text-gray-500 text-xs mt-1">{unit} • Limit: &lt;{safe.toFixed(2)}</p>
        </div>
    );

    const FilterBar = ({ name, percent, prediction }) => (
        <div>
            <div className="flex justify-between items-center mb-2">
                <p className="text-gray-300 text-sm">{name}</p>
                <p className={`font-bold ${getFilterColor(percent)}`}>{percent}%</p>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                    className={`h-2 rounded-full ${getFilterColor(percent)}`}
                    style={{ width: `${percent}%` }}
                    initial={{ width: '100%' }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1 }}
                />
            </div>
            <p className="text-xs text-gray-500 mt-1">{prediction}</p>
        </div>
    );

    // --- JSX Render ---

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">🤖 AI Smart Pad Disposal System</h1>
                            <p className="text-gray-300">Real-time monitoring & intelligent waste management</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`px-4 py-2 rounded-lg font-semibold border ${
                                systemStatus === 'operational' ? 'bg-green-500/20 text-green-400 border-green-500' :
                                systemStatus === 'processing' ? 'bg-red-500/20 text-red-400 border-red-500' :
                                'bg-blue-500/20 text-blue-400 border-blue-500'
                            }`}>
                                <span className={`inline-block w-2 h-2 rounded-full bg-current ${systemStatus !== 'operational' ? 'animate-pulse' : ''} mr-2`}></span>
                                {systemStatus.toUpperCase()}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {['monitoring', 'analytics', 'maintenance'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                                activeTab === tab 
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50' 
                                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* --- Monitoring Tab --- */}
                {activeTab === 'monitoring' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Detection & Processing */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* AI Detection Status */}
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        📹 AI Camera Detection
                                    </h2>
                                    <button
                                        onClick={() => setDetectionActive(!detectionActive)}
                                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                            detectionActive 
                                                ? 'bg-green-500 text-white' 
                                                : 'bg-gray-600 text-gray-300'
                                        }`}
                                    >
                                        {detectionActive ? 'Active' : 'Paused'}
                                    </button>
                                </div>
                                
                                {/* Video Feed using public/Final_pad.mp4 with ML Overlay */}
                                <div className="bg-black rounded-xl mb-4 h-64 relative overflow-hidden">
                                    {detectionActive ? (
                                        <>
                                            <video 
                                                autoPlay 
                                                loop 
                                                muted 
                                                playsInline
                                                className="w-full h-full object-cover rounded-xl opacity-70"
                                            >
                                                {/* Assuming Final_pad.mp4 is in your public folder */}
                                                <source src="/Final_pad.mp4" type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                            {/* ML Tracking Overlay - Border removed */}
                                            <motion.div
                                                className="absolute inset-0 flex items-center justify-center"
                                                animate={{ 
                                                    scale: [1, 1.02, 1], 
                                                }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                            >
                                                <div className="w-1/2 h-1/2 border-transparent border-dashed rounded-lg" 
                                                    // This was the border you asked to remove. It's now transparent.
                                                ></div>
                                                <p className={`absolute bottom-4 left-4 font-semibold text-sm ${processingStage === 'idle' && padsDetected >= 5 ? 'text-orange-400' : 'text-green-400'}`}>
                                                     {processingStage === 'idle' && padsDetected >= 5 ? '🛑 QUEUE FULL - STARTING BATCH' : '✓ Scanning Active'}
                                                </p>
                                            </motion.div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg">
                                            Video Feed Paused
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
                                        <p className="text-blue-400 text-sm mb-1">Detected (Queue)</p>
                                        <p className="text-3xl font-bold text-white">{padsDetected}</p>
                                    </div>
                                    <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30">
                                        <p className="text-green-400 text-sm mb-1">Total Processed</p>
                                        <p className="text-3xl font-bold text-white">{padsProcessed}</p>
                                    </div>
                                    <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/30">
                                        <p className="text-purple-400 text-sm mb-1">Current Batch Size</p>
                                        <p className="text-3xl font-bold text-white">{padsDetected}</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Processing Pipeline */}
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20"
                            >
                                <h2 className="text-xl font-bold text-white mb-4">⚙️ Processing Pipeline</h2>
                                
                                <div className="space-y-3 mb-6">
                                    {['transfer', 'heating', 'sterilization', 'filtration', 'cooling', 'compaction'].map((stage, idx) => (
                                        <div key={stage} className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                processingStage === stage ? getStageColor(stage) : 'bg-gray-600'
                                            } transition-all`}>
                                                {processingStage === stage ? (
                                                    <motion.span 
                                                        initial={{ scale: 0.5 }}
                                                        animate={{ scale: 1.2 }}
                                                        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                                                        className="text-white"
                                                    >
                                                        ●
                                                    </motion.span>
                                                ) : (
                                                    <span className="text-gray-400">{idx + 1}</span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`font-semibold ${
                                                    processingStage === stage ? 'text-white' : 'text-gray-400'
                                                }`}>
                                                    {stage.charAt(0).toUpperCase() + stage.slice(1)}
                                                </p>
                                            </div>
                                            {processingStage === stage && (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                    <span className="text-green-400 text-sm font-semibold">Active</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Temperature Monitor */}
                                <div className="bg-black/30 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-gray-400 text-sm">Chamber Temperature</p>
                                        <p className={`text-2xl font-bold ${getTempColor(chamberTemp)}`}>
                                            {Math.round(chamberTemp)}°C
                                        </p>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                                        <motion.div
                                            className={`h-3 ${
                                                chamberTemp < 100 ? 'bg-blue-500' :
                                                chamberTemp < 200 ? 'bg-yellow-500' :
                                                chamberTemp < 300 ? 'bg-orange-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${(chamberTemp / 400) * 100}%` }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(chamberTemp / 400) * 100}%` }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>0°C</span>
                                        <span>Target: {targetTemp}°C</span>
                                        <span>400°C Max</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Emissions Monitoring */}
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20"
                            >
                                <h2 className="text-xl font-bold text-white mb-4">🔬 Real-Time Emissions</h2>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <EmissionCard title="Carbon Monoxide (CO)" value={emissions.co} unit="ppm" safe={0.1} danger={0.25} />
                                    <EmissionCard title="VOCs" value={emissions.voc} unit="ppm" safe={0.05} danger={0.1} />
                                    <EmissionCard title="PM2.5" value={emissions.pm25} unit="μg/m³" safe={12} danger={25} />
                                    <EmissionCard title="NOx" value={emissions.nox} unit="ppm" safe={0.02} danger={0.05} />
                                </div>

                                <div className={`mt-4 rounded-lg p-3 border ${
                                    emissions.pm25 > 25 || emissions.co > 0.25 
                                        ? 'bg-red-500/10 border-red-500/30' 
                                        : 'bg-green-500/10 border-green-500/30'
                                }`}>
                                    <p className={`text-sm font-semibold ${
                                        emissions.pm25 > 25 || emissions.co > 0.25 ? 'text-red-400' : 'text-green-400'
                                    }`}>
                                        {emissions.pm25 > 25 || emissions.co > 0.25 
                                            ? '❗️ High Emission Detected. Check Filters.' 
                                            : '✓ All emissions within safe limits'}
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Column - Filters & Alerts */}
                        <div className="space-y-6">
                            
                            {/* Filter Status */}
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20"
                            >
                                <h2 className="text-xl font-bold text-white mb-4">🛡️ Multi-Layer Filtration</h2>
                                
                                <div className="space-y-4">
                                    <FilterBar 
                                        name="Catalytic Converter" 
                                        percent={filterStatus.catalytic} 
                                        prediction="CO → CO₂ conversion efficiency"
                                    />
                                    <FilterBar 
                                        name="Activated Carbon" 
                                        percent={filterStatus.carbon} 
                                        prediction="VOCs & toxin adsorption capacity"
                                    />
                                    <FilterBar 
                                        name="HEPA Filter" 
                                        percent={filterStatus.hepa} 
                                        prediction="PM2.5/PM10 retention capability"
                                    />
                                </div>
                            </motion.div>

                            {/* Environmental Impact */}
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30"
                            >
                                <h2 className="text-xl font-bold text-white mb-4">🌍 Cumulative Impact</h2>
                                
                                <div className="space-y-3">
                                    <div className="bg-black/20 rounded-lg p-3">
                                        <p className="text-green-400 text-sm mb-1">CO₂ Emissions Offset</p>
                                        <p className="text-2xl font-bold text-white">{envImpact.co2Saved.toFixed(1)} kg</p>
                                    </div>
                                    <div className="bg-black/20 rounded-lg p-3">
                                        <p className="text-green-400 text-sm mb-1">Total Waste Diverted</p>
                                        <p className="text-2xl font-bold text-white">{envImpact.wasteReduced.toFixed(0)} kg</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Alerts */}
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20"
                            >
                                <h2 className="text-xl font-bold text-white mb-4">🔔 System Alerts</h2>
                                
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {alerts.map(alert => {
                                        let icon = 'ℹ️';
                                        let style = 'bg-blue-500/10 border-blue-500/30';
                                        if (alert.type === 'success') { icon = '✅'; style = 'bg-green-500/10 border-green-500/30'; }
                                        if (alert.type === 'warning') { icon = '⚠️'; style = 'bg-yellow-500/10 border-yellow-500/30'; }
                                        if (alert.type === 'error') { icon = '❌'; style = 'bg-red-500/10 border-red-500/30'; }

                                        return (
                                            <div 
                                                key={alert.id}
                                                className={`p-3 rounded-lg border ${style}`}
                                            >
                                                <p className="text-white text-sm flex items-start">
                                                    <span className="mr-2 flex-shrink-0">{icon}</span> {alert.message}
                                                </p>
                                                <p className="text-gray-500 text-xs mt-1 text-right">{alert.time}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}

                {/* --- Analytics Tab (unchanged) --- */}
                {activeTab === 'analytics' && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
                            <p className="text-gray-400 text-sm mb-2">Total Pads Processed (Lifetime)</p>
                            <p className="text-4xl font-bold text-white mb-2">{padsProcessed}</p>
                            <p className="text-green-400 text-sm">↑ 23% vs last month</p>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
                            <p className="text-gray-400 text-sm mb-2">Average Processing Time</p>
                            <p className="text-4xl font-bold text-white mb-2">18.5m</p>
                            <p className="text-green-400 text-sm">↓ 12% improvement</p>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
                            <p className="text-gray-400 text-sm mb-2">Energy Efficiency</p>
                            <p className="text-4xl font-bold text-white mb-2">87%</p>
                            <p className="text-yellow-400 text-sm">→ Stable</p>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
                            <p className="text-gray-400 text-sm mb-2">System Uptime</p>
                            <p className="text-4xl font-bold text-white mb-2">99.8%</p>
                            <p className="text-green-400 text-sm">Excellent</p>
                        </div>
                    </motion.div>
                )}

                {/* --- Maintenance Tab --- */}
                {activeTab === 'maintenance' && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6">🔧 Predictive Maintenance</h2>
                        
                        <div className="space-y-4">
                            {/* Carbon Filter Alert - Dynamic based on state */}
                            <div className={`${filterStatus.carbon < 80 ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-green-500/10 border border-green-500/30'} rounded-lg p-4`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className={`${filterStatus.carbon < 80 ? 'text-yellow-400' : 'text-green-400'} font-semibold`}>Activated Carbon Filter</p>
                                        <p className="text-gray-400 text-sm">
                                            {filterStatus.carbon < 80 
                                                ? `Replacement recommended in ${Math.ceil((filterStatus.carbon - 70) * 1.5)} days (Health: ${filterStatus.carbon}%)` 
                                                : `Good condition • Next check: 45 days (Health: ${filterStatus.carbon}%)`}
                                        </p>
                                    </div>
                                    {filterStatus.carbon < 80 ? (
                                        <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600">
                                            Schedule
                                        </button>
                                    ) : (
                                        <span className="text-green-400 font-bold">✓ OK</span>
                                    )}
                                </div>
                            </div>

                            {/* Other Filters (Based on static logic for simplicity) */}
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-green-400 font-semibold">HEPA Filter</p>
                                        <p className="text-gray-400 text-sm">Good condition • Next check: 45 days</p>
                                    </div>
                                    <span className="text-green-400 font-bold">✓ OK</span>
                                </div>
                            </div>

                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-green-400 font-semibold">Heating Chamber</p>
                                        <p className="text-gray-400 text-sm">Optimal performance • Last serviced: 7 days ago</p>
                                    </div>
                                    <span className="text-green-400 font-bold">✓ OK</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default SmartPadDisposal;