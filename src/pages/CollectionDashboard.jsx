import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Droplet, Sun, Cloud, Leaf, Thermometer, Zap, Activity, Shield, Trello, Layers, ShoppingBag, Eye, Edit, Clock, MapPin, Settings, ChevronLeft, CheckCircle, AlertTriangle, Cpu, TrendingUp, Calendar, Hash, Target, GitBranch, Briefcase, X, Menu, Trash2, Gauge, Users, Package, Clock4, Database, DollarSign } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';

import { useTranslation } from 'react-i18next';

// --- FIX: Mock 't' function defined here to prevent "t is not defined" errors
// on top-level constant initialization. It returns the input string,
// ensuring valid data that can be scanned by translation tools. ---
const t = (key, options) => {
    // If the key is an object (i18n pluralization/context), return the base string
    if (typeof key === 'object' && key !== null) {
        return key.toString(); // Fallback for complex keys
    }
    // Return the key itself (which is the English string)
    return key;
};
// --------------------------------------------------------------------------

// --- Mandatory Global Firebase Initialization Variables ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' && __firebase_config ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// --- Utility Functions ---

/**
 * Simulates a PDF download for a Collections Report.
 * @param {string} content - The main body content for the report.
 * @param {string} filename - The name of the file to download.
 */
const simulatePDFDownload = (content, filename) => {
    // t() is used for report headers/footers
    const reportContent = `
${t('SANITARY WASTE COLLECTIONS REPORT')}
---------------------------------
${t('Report Title')}: ${filename.replace('.pdf', '')}
${t('Date')}: ${new Date().toLocaleDateString()}
${t('Time')}: ${new Date().toLocaleTimeString()}

${content}

--- ${t('End of SMART-BIN Report')} ---
`;
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// --- Mock Data Structure (Updated for Collections) ---
const mockDisposalData = {
    // t() is applied to user-visible strings
    facilityName: t("Community Center Facility"),
    location: t("Bengaluru, Karnataka, India"),
    totalBins: 120,
    currentCollection: t("Daily Collection Cycle"),
    lastUpdate: new Date().toLocaleTimeString(),
    
    // Core KPIs
    stats: [
        // t() is applied to 'title' and 'status'
        { id: 1, title: t("Average Bin Fill Level"), value: "58%", status: t("Normal"), icon: Gauge, color: "text-blue-500", bg: "bg-blue-100/50" },
        { id: 2, title: t("Total Weekly Collections"), value: "2.4 MT", status: t("High"), icon: Package, color: "text-green-500", bg: "bg-green-100/50" },
        { id: 3, title: t("Bins Requiring Service"), value: "5", status: t("Urgent"), icon: AlertTriangle, color: "text-red-500", bg: "bg-red-100/50", route: 'serviceLog' },
        { id: 4, title: t("Avg Pad Thickness (mm)"), value: "2.5 mm", status: t("Standard"), icon: Layers, color: "text-indigo-500", bg: "bg-indigo-100/50" },
    ],
    
    // Detailed Bin/Sensor Data
    bins: [
        // t() is applied to 'name', 'location', 'status', and value if it contains a translation-ready string
        { id: 'B-001', name: t("Bin 1: Ladies Restroom"), location: t("Block A, Floor 2"), status: t("Full"), fillLevel: 95, icon: Trash2, statusColor: 'red', units: '%' },
        { id: 'B-002', name: t("Bin 2: Cafeteria"), location: t("Ground Floor"), status: t("Operational"), fillLevel: 45, icon: Trash2, statusColor: 'green', units: '%' },
        { id: 'B-003', name: t("Bin 3: Staff Area"), location: t("Block B, Floor 1"), status: t("Warning"), fillLevel: 82, icon: Trash2, statusColor: 'yellow', units: '%' },
    ],

    // Collection Route Optimizations (Replacing Crop Predictions)
    routeOptimizations: [
        // t() is applied to 'route', 'depot', and 'details'
        { id: 'R-01', route: t("North Zone Daily"), depot: t("Depot 1"), efficiency: "98%", timeSaved: t("+35 min"), confidence: 95, details: t("Optimized path based on real-time bin levels. Recommended vehicles: 2."), route: 'routeDetails', factors: { fill: 90, traffic: 80, time: 95 } },
        { id: 'R-02', route: t("South Zone Weekend"), depot: t("Depot 2"), efficiency: "78%", timeSaved: t("-10 min"), confidence: 60, details: t("Sub-optimal due to unexpected road closures. Manual review needed."), route: 'routeDetails', factors: { fill: 60, traffic: 70, time: 85 } },
    ],

    // Historical Time-Series Data
    weeklyCollections: [
        // t() is applied to 'day'
        { day: t("Sun"), collections: 250, weight: 350 },
        { day: t("Mon"), collections: 320, weight: 450 },
        { day: t("Tue"), collections: 300, weight: 420 },
        { day: t("Wed"), collections: 350, weight: 480 },
        { day: t("Thu"), collections: 310, weight: 430 },
        { day: t("Fri"), collections: 400, weight: 550 },
        { day: t("Sat"), collections: 280, weight: 380 },
    ],
    
    // Service/Maintenance Logs
    serviceLogs: [
        // t() is applied to 'servicedBy', 'bin', 'issue', 'severity', and 'action'
        { id: 1, date: '2025-10-15', servicedBy: t('Technician A'), bin: 'B-001', issue: t('Full sensor failure'), severity: t('High'), action: t('Replaced sensor unit') },
        { id: 2, date: '2025-10-14', servicedBy: t('Technician B'), bin: 'B-003', issue: t('Misalignment'), severity: t('Medium'), action: t('Recalibrated scale') },
        { id: 3, date: '2025-10-12', servicedBy: t('Internal Team'), bin: 'B-002', issue: t('Battery check'), severity: t('None'), action: t('Confirmed health (85%)') },
    ],

    // Monthly Pad Type Trends (Replacing Water History)
    padTypeTrend: [
        // t() is applied to 'month' and 'type'
        { month: t('June'), type: t('Regular'), count: 120 }, 
        { month: t('July'), type: t('Regular'), count: 150 }, 
        { month: t('August'), type: t('Regular'), count: 135 }, 
        { month: t('Sep'), type: t('Regular'), count: 180 }, 
        { month: t('Oct'), type: t('Regular'), count: 110 }
    ],
};


// ----------------------------------------------------------------------------------
// --- Utility Components ---
// ----------------------------------------------------------------------------------

const CollectionsChart = ({ weeklyCollections }) => {
    const { t } = useTranslation();
    
    const data = weeklyCollections.map(w => ({
        name: w.day,
        Count: w.collections,
        Weight: w.weight, 
    }));

    return (
        <div className="bg-white/80 dark:bg-gray-800/80 shadow-xl rounded-xl p-6 border-t-4 border-emerald-500 h-96">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('Weekly Collections: Count vs. Weight (kg)')}</h3>
            <ResponsiveContainer width="100%" height="85%">
                <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc5" />
                    <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis yAxisId="left" orientation="left" stroke="#10b981" style={{ fontSize: '12px' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" style={{ fontSize: '12px' }} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #ccc', borderRadius: '8px', padding: '10px' }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="Count" fill="#10b981" radius={[4, 4, 0, 0]} name={t('Pad Count (Units)')} />
                    <Bar yAxisId="right" dataKey="Weight" fill="#3b82f6" radius={[4, 4, 0, 0]} name={t('Waste Weight (kg)')} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

const SmartBinCard = ({ bin, handleViewDetails }) => {
    const { t } = useTranslation();
    
    const statusClasses = useMemo(() => {
        switch (t(bin.status)) { 
            case t('Operational'): return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-800/30';
            case t('Warning'): return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-800/30';
            case t('Full'): 
            case t('Error'): return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-800/30';
            default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800/30';
        }
    }, [bin.status, t]);

    const Icon = useMemo(() => Trash2, []);

    return (
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-5 border-l-4 border-indigo-500 flex flex-col justify-between h-full hover:shadow-2xl transition duration-300">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <Icon className="w-6 h-6 text-indigo-500" />
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusClasses}`}>
                        {t(bin.status)}
                    </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">{t(bin.name)}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1"><MapPin className="w-3 h-3"/>{t(bin.location)} ({bin.id})</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t('Fill Level')}:</p>
                <p className="text-4xl font-extrabold text-gray-800 dark:text-gray-200 mb-4">{bin.fillLevel}%</p>
            </div>
            <button
                onClick={() => handleViewDetails('binDetails', bin.id)}
                className="w-full text-indigo-600 dark:text-indigo-400 py-2 rounded-lg font-semibold border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition duration-150 flex items-center justify-center gap-2"
            >
                <Database className="w-4 h-4" /> {t('View History')}
            </button>
        </div>
    );
};

const RouteOptimizationCard = ({ optimization, navigate }) => {
    const { t } = useTranslation();
    
    return (
        <div 
            className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-5 border-l-4 border-purple-500 cursor-pointer hover:shadow-2xl hover:scale-[1.01] transition duration-300"
            onClick={() => navigate('routeDetails', optimization.id)}
        >
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t(optimization.route)}</h3>
                <span className="text-xs font-medium text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-800/30 px-3 py-1 rounded-full">{t(optimization.depot)}</span>
            </div>
            <p className="text-4xl font-extrabold text-purple-600 dark:text-purple-400 mb-1">{optimization.efficiency}</p>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-3">
                <p>{t('Time Change')}: <span className={`font-semibold ${optimization.timeSaved.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{t(optimization.timeSaved)}</span></p>
                <p>{t('Confidence')}: <span className="font-semibold text-gray-800 dark:text-gray-200">{optimization.confidence}%</span></p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t(optimization.details)}</p>
        </div>
    );
};

const KPIStatCard = ({ stat, handleNavigation }) => {
    const { t } = useTranslation();
    
    const Icon = stat.icon;
    const isClickable = stat.route;

    return (
        <div 
            className={`p-5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 ${isClickable ? 'cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all duration-200' : ''}`}
            style={{ backgroundColor: stat.bg.replace('/50', '/80').replace('bg-', '') }}
            onClick={() => isClickable && handleNavigation(stat.route)}
        >
            <div className="flex items-center justify-between">
                <Icon className={`w-6 h-6 ${stat.color} p-1 rounded-full`} />
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stat.color} ${stat.bg.replace('/50', '')}`}>{t(stat.status)}</span>
            </div>
            <p className="mt-3 text-lg font-medium text-gray-600 dark:text-gray-300">{t(stat.title)}</p>
            <p className="text-4xl font-extrabold text-gray-900 dark:text-white mt-1">{t(stat.value)}</p>
        </div>
    );
};

// ----------------------------------------------------------------------------------
// --- NEW PAGE VIEW: COLLECTIONS DASHBOARD (Replacing IrrigationSystem) ---
// ----------------------------------------------------------------------------------

/**
 * Main dashboard for the SMART-BIN collections and logistics data.
 * @param {object} props 
 * @param {function} props.navigate - Function to change the view/page.
 * @param {object} [props.mockData={}] - Collection data, defaults to {} to prevent destructuring errors.
 */
const CollectionsDashboard = ({ navigate, mockData = {} }) => {
    const { t } = useTranslation();
    
    // Using default array values for safe destructuring even if mockData is late/undefined
    const { 
        facilityName, 
        location, 
        totalBins, 
        currentCollection, 
        lastUpdate, 
        stats = [], 
        bins = [], 
        routeOptimizations = [], 
        weeklyCollections = [], 
        serviceLogs = [] 
    } = mockData;

    // State for the "Disposal Cycle Control" equivalent
    const [cycleMode, setCycleMode] = useState('AUTO'); // AUTO or MANUAL
    const [isSaving, setIsSaving] = useState(false);

    const saveSettings = async () => {
        setIsSaving(true);
        console.log(t(`Applying Cycle Mode: ${cycleMode}`));
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSaving(false);
    }

    return (
        <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <button
                onClick={() => navigate('dashboard')} 
                className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mb-6 font-medium transition duration-150"
            >
                <ChevronLeft className="w-5 h-5 mr-1" /> {t('Back to Main Dashboard')}
            </button>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3"><Trash2 className="w-6 h-6 text-indigo-500" /> {t('SMART-BIN Collections Dashboard')}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">{t(facilityName || 'N/A')} - {t(location || 'N/A')} | {t('Total Bins')}: {totalBins || 'N/A'}</p>

            {/* --- 1. Core KPIs Section --- */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                {stats.map(stat => (
                    <KPIStatCard key={stat.id} stat={stat} handleNavigation={navigate} />
                ))}
            </div>
            
            {/* --- 2. System Control & Collections Chart --- */}
            <div className="grid md:grid-cols-3 gap-8 mb-8">
                {/* System Control Panel */}
                <div className="md:col-span-1 bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 border-l-4 border-indigo-500 h-full">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-indigo-500" /> {t('Collection Cycle Control')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('Set the mode for autonomous service scheduling.')}</p>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setCycleMode('AUTO')}
                            className={`flex-1 py-3 rounded-xl font-semibold transition duration-200 ${
                                cycleMode === 'AUTO' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                            }`}
                        >
                            {t('AUTO-Schedule')}
                        </button>
                        <button
                            onClick={() => setCycleMode('MANUAL')}
                            className={`flex-1 py-3 rounded-xl font-semibold transition duration-200 ${
                                cycleMode === 'MANUAL' ? 'bg-red-600 text-white shadow-lg shadow-red-500/50' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                            }`}
                        >
                            {t('MANUAL Dispatch')}
                        </button>
                    </div>
                    <button 
                        onClick={saveSettings} 
                        className={`w-full py-3 mt-6 rounded-xl font-semibold transition duration-300 shadow-md flex items-center justify-center gap-2 ${
                            isSaving ? 'bg-gray-400 cursor-wait' : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> {t('Applying Settings...')}
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5" /> {t('Apply Cycle Settings')}
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => simulatePDFDownload(JSON.stringify(mockData), `${t('Collections-Report')}_${new Date().toISOString().slice(0, 10)}.pdf`)}
                        className="w-full py-2 mt-4 text-indigo-600 dark:text-indigo-400 border border-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition duration-150"
                    >
                        {t('Download Collections Report')}
                    </button>
                </div>
                
                {/* Collections Chart */}
                <div className="md:col-span-2">
                    <CollectionsChart weeklyCollections={weeklyCollections} />
                </div>
            </div>
            
            {/* --- 3. Bin Status Grid --- */}
            <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 border-t-4 border-blue-500 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Cpu className="w-5 h-5 text-blue-500" /> {t('Smart Bin Live Status')}</h2>
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {bins.map(bin => (
                        <SmartBinCard key={bin.id} bin={bin} handleViewDetails={navigate} />
                    ))}
                </div>
            </div>

            {/* --- 4. Route Optimization & Service Log --- */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Route Optimization */}
                <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 border-t-4 border-purple-500">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><GitBranch className="w-5 h-5 text-purple-500" /> {t('Logistics: Route Optimizations')}</h2>
                    <div className="grid gap-4">
                        {routeOptimizations.map(opt => (
                            <RouteOptimizationCard key={opt.id} optimization={opt} navigate={navigate} />
                        ))}
                    </div>
                </div>

                {/* Service Log */}
                <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 border-t-4 border-amber-500">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-amber-500" /> {t('Recent Service & Maintenance Log')}</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <th className="py-3 px-3">{t('Date')}</th>
                                    <th className="py-3 px-3">{t('Bin ID')}</th>
                                    <th className="py-3 px-3">{t('Issue')}</th>
                                    <th className="py-3 px-3">{t('Action')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {serviceLogs.slice(0, 5).map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition duration-100">
                                        <td className="py-4 px-3 text-sm font-medium text-gray-900 dark:text-white">{log.date}</td>
                                        <td className="py-4 px-3 text-sm text-gray-700 dark:text-gray-300">{log.bin}</td>
                                        <td className="py-4 px-3 text-sm text-red-500 dark:text-red-400">{t(log.issue)}</td>
                                        <td className="py-4 px-3 text-sm text-gray-500 dark:text-gray-400">{t(log.action)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button
                        onClick={() => navigate('serviceLog')}
                        className="mt-4 w-full text-sm text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-medium transition duration-150 flex items-center justify-center gap-1"
                    >
                        <Clock4 className="w-4 h-4" /> {t('View Full History')}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------------------
// --- MAIN APP COMPONENT (for context) ---
// ----------------------------------------------------------------------------------

const Farm2MarketApp = () => {
    // Replaced 'irrigation' with new views. 'dashboard' remains the entry point.
    const [view, setView] = useState('dashboard'); // 'dashboard', 'collections', 'binDetails', 'routeDetails', 'serviceLog'
    const [selectedId, setSelectedId] = useState(null);

    // Initialise Firebase (Developer-facing)
    useEffect(() => {
        try {
            const app = initializeApp(firebaseConfig, appId);
            const auth = getAuth(app);
            // Example of Firebase Auth logic
            if (initialAuthToken) {
                signInWithCustomToken(auth, initialAuthToken)
                    .then(() => console.log("Signed in with custom token."))
                    .catch((error) => console.error("Custom token sign-in failed:", error));
            } else if (!auth.currentUser) {
                signInAnonymously(auth)
                    .then(() => console.log("Signed in anonymously."))
                    .catch((error) => console.error("Anonymous sign-in failed:", error));
            }

            onAuthStateChanged(auth, (user) => {
                if (user) {
                    console.log(`User state changed: ${user.uid}`);
                }
            });

        } catch (e) {
            console.warn("Firebase initialization skipped or failed:", e.message);
        }
    }, []);

    const navigate = useCallback((targetView, id = null) => {
        setView(targetView);
        setSelectedId(id);
        window.scrollTo(0, 0);
    }, []);

    const renderView = () => {
        const dashboardData = mockDisposalData; 

        if (view === 'dashboard') {
            const binCount = dashboardData.bins.length;
            // Accessing elements safely using index
            const avgFill = dashboardData.stats[0]?.value || 'N/A';
            const binsNeedingService = dashboardData.stats[2]?.value || 'N/A';

            // t() applied to the main dashboard content.
            return (
                <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">{t('Welcome to SMART-BIN Intelligence')}</h1>
                    <p className="text-xl text-indigo-600 dark:text-indigo-400 mb-8">{t(dashboardData.facilityName)}</p>
                    <div className="flex justify-center space-x-6 mb-10">
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                             <p className="text-4xl font-bold text-teal-600">{binCount}</p>
                             <p className="text-sm text-gray-500">{t('Total Deployed Bins')}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                             <p className="text-4xl font-bold text-purple-600">{avgFill}</p>
                             <p className="text-sm text-gray-500">{t('Average Fill Level')}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                             <p className="text-4xl font-bold text-red-600">{binsNeedingService}</p>
                             <p className="text-sm text-gray-500">{t('Bins Requiring Immediate Service')}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('collections')}
                        className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-xl hover:bg-indigo-700 transition duration-300 flex items-center justify-center mx-auto"
                    >
                        <Trello className="w-5 h-5 mr-2" /> {t('Go to Collections Dashboard')}
                    </button>
                </div>
            );
        }
        
        // The new Collections Dashboard View - Correctly passes mockData
        if (view === 'collections') {
            return <CollectionsDashboard navigate={navigate} mockData={dashboardData} />;
        }

        // Placeholder for sub-detail views
        if (view === 'binDetails') {
            const bin = dashboardData.bins.find(b => b.id === selectedId);
            return (
                <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
                    <button onClick={() => navigate('collections')} className="flex items-center text-indigo-600 dark:text-indigo-400 mb-6 font-medium"><ChevronLeft className="w-5 h-5 mr-1" /> {t('Back to Collections')}</button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('Bin Details: ')} {t(bin?.name || 'N/A')} ({selectedId})</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t('Fill Level')}: <span className="font-bold text-4xl">{bin?.fillLevel || 'N/A'}%</span></p>
                    <p className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">{t('Detailed sensor data and history for this bin would be displayed here.')}</p>
                </div>
            );
        }
        
        if (view === 'routeDetails') {
            const route = dashboardData.routeOptimizations.find(r => r.id === selectedId);
            return (
                <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
                    <button onClick={() => navigate('collections')} className="flex items-center text-indigo-600 dark:text-indigo-400 mb-6 font-medium"><ChevronLeft className="w-5 h-5 mr-1" /> {t('Back to Collections')}</button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('Route Optimization Details: ')} {t(route?.route || 'N/A')}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t('Efficiency')}: <span className="font-bold text-4xl">{route?.efficiency || 'N/A'}</span></p>
                    <p className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">{t('A map view and step-by-step route guide would be shown here.')}</p>
                </div>
            );
        }

        if (view === 'serviceLog') {
             return (
                 <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
                    <button onClick={() => navigate('collections')} className="flex items-center text-indigo-600 dark:text-indigo-400 mb-6 font-medium"><ChevronLeft className="w-5 h-5 mr-1" /> {t('Back to Collections')}</button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('Full Service and Maintenance History')}</h1>
                    <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                         <h2 className="text-xl font-semibold mb-3">{t('Service Records')}</h2>
                         {dashboardData.serviceLogs.map(log => (
                             <div key={log.id} className="border-b border-gray-200 dark:border-gray-700 py-2 last:border-b-0">
                                 <p className="font-medium text-gray-900 dark:text-white">{log.date} - {t(log.issue)}</p>
                                 <p className="text-sm text-gray-500 dark:text-gray-400">{t('Bin')}: {log.bin} | {t('Action')}: {t(log.action)} | {t('By')}: {t(log.servicedBy)}</p>
                             </div>
                         ))}
                    </div>
                </div>
             );
        }

        return <div className="p-8 text-red-500">{t('View not found!')}</div>;
    };

    return (
        <div className="font-sans antialiased bg-gray-50 dark:bg-gray-900">
            {renderView()}
        </div>
    );
};

// --- Export the main component (or the new page component for review) ---
export default Farm2MarketApp;

// Note: If you only need the page component, use:
// export default CollectionsDashboard;