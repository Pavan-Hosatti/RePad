import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Camera, Trash2, Thermometer, Wind, AlertTriangle, CheckCircle, Activity, TrendingDown, Leaf, Zap, Settings, Download, MapPin } from 'lucide-react';

// --- MOCK DATA / SIMULATED BACKEND ---
// The initial state of the system data, now the sole source of truth.
const initialSystemData = {
  systemName: "Block A - Girls Hostel",
  location: "Bengaluru, Karnataka",
  status: "Operational",
  currentCycle: "Idle",
  lastMaintenance: "2025-10-15",
  
  stats: [
    { id: 1, title: "Pads Detected Today", value: 47, unit: "", icon: Camera, color: "text-blue-600", bg: "bg-blue-50", type: "pads" },
    { id: 2, title: "Chamber Temperature", value: 285, unit: "°C", icon: Thermometer, color: "text-red-600", bg: "bg-red-50", type: "temp" },
    { id: 3, title: "Air Quality Index", value: "Good", icon: Wind, color: "text-green-600", bg: "bg-green-50", type: "aqi" },
    { id: 4, title: "CO₂ Emissions", value: "12 ppm", icon: TrendingDown, color: "text-teal-600", bg: "bg-teal-50", type: "co2" },
  ],

  emissions: [
    { time: '08:00', CO: 8, VOC: 15, PM25: 5 },
    { time: '10:00', CO: 12, VOC: 18, PM25: 7 },
    { time: '12:00', CO: 10, VOC: 14, PM25: 6 },
    { time: '14:00', CO: 9, VOC: 16, PM25: 5 },
    { time: '16:00', CO: 11, VOC: 17, PM25: 6 },
    { time: '18:00', CO: 7, VOC: 13, PM25: 4 },
  ],

  wasteProcessed: [
    { month: 'Jun', pads: 820 },
    { month: 'Jul', pads: 950 },
    { month: 'Aug', pads: 1100 },
    { month: 'Sep', pads: 1050 },
    { month: 'Oct', pads: 890 },
  ],

  filterStatus: [
    { name: 'Catalytic Filter', health: 92, color: '#10b981' },
    { name: 'Activated Carbon', health: 78, color: '#f59e0b' },
    { name: 'HEPA Filter', health: 85, color: '#3b82f6' },
  ],

  recentActivity: [
    { id: 1, time: '16:45', event: 'Pad detected & transferred', status: 'success' },
    { id: 2, time: '16:30', event: 'Heating cycle completed', status: 'success' },
    { id: 3, time: '16:15', event: 'Chamber reached 300°C', status: 'info' },
    { id: 4, time: '15:50', event: 'AI vision calibrated', status: 'info' },
  ],

  alerts: [
    { id: 1, type: 'warning', message: 'Activated Carbon filter at 78% - Schedule replacement within 2 weeks', time: '2 hours ago' },
    { id: 2, type: 'info', message: 'System maintenance due in 15 days', time: '1 day ago' },
  ]
};
// --- END MOCK DATA ---

// Utility Components
const StatCard = ({ stat }) => {
  const Icon = stat.icon;
  // Format the value based on if it's a number or string
  const displayValue = typeof stat.value === 'number' ? `${stat.value}${stat.unit}` : stat.value;

  return (
    <div className={`p-5 rounded-xl shadow-lg border border-gray-100 ${stat.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-6 h-6 ${stat.color}`} />
      </div>
      <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
      <p className="text-3xl font-bold text-gray-900">{displayValue}</p>
    </div>
  );
};

const AlertBanner = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return null;
  
  return (
    <div className="space-y-2 mb-6">
      {alerts.map(alert => (
        <div 
          key={alert.id}
          className={`flex items-start gap-3 p-4 rounded-lg ${
            alert.type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-500' : 'bg-blue-50 border-l-4 border-blue-500'
          }`}
        >
          <AlertTriangle className={`w-5 h-5 mt-0.5 ${alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`} />
          <div className="flex-1">
            <p className={`font-medium ${alert.type === 'warning' ? 'text-yellow-900' : 'text-blue-900'}`}>
              {alert.message}
            </p>
            <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Main Dashboard Component
const DisposalDashboard = ({ systemData }) => {
  const { stats, emissions, wasteProcessed, filterStatus, recentActivity, systemName, location, status, currentCycle } = systemData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Leaf className="w-8 h-8 text-green-600" />
              {systemName}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {location}</span>
              <span className={`px-3 py-1 rounded-full font-medium ${
                status === 'Operational' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {status}
              </span>
              <span className="text-gray-500">Current: {currentCycle}</span>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(stat => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Emissions Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Real-Time Emissions Monitoring</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={emissions}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '10px'
                }} 
              />
              <Line type="monotone" dataKey="CO" stroke="#ef4444" strokeWidth={2} name="CO (ppm)" />
              <Line type="monotone" dataKey="VOC" stroke="#f59e0b" strokeWidth={2} name="VOC (ppb)" />
              <Line type="monotone" dataKey="PM25" stroke="#3b82f6" strokeWidth={2} name="PM2.5 (µg/m³)" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-around mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">CO (ppm)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-600">VOC (ppb)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">PM2.5 (µg/m³)</span>
            </div>
          </div>
        </div>

        {/* Filter Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Filter Health Status</h2>
          <div className="space-y-4">
            {filterStatus.map((filter, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{filter.name}</span>
                  <span className="text-lg font-bold" style={{ color: filter.color }}>{filter.health}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${filter.health}%`, backgroundColor: filter.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2">
            <Settings className="w-4 h-4" /> Schedule Maintenance
          </button>
        </div>
      </div>

      {/* Waste Processed & Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Waste Processing Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-teal-500">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Waste Processed</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={wasteProcessed}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="pads" fill="#14b8a6" radius={[8, 8, 0, 0]} name="Pads Processed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-indigo-500">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent System Activity</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentActivity.map(activity => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                {activity.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                ) : (
                  <Activity className="w-5 h-5 text-blue-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.event}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
export default function App() {
  const [systemData, setSystemData] = useState(initialSystemData);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // 1. Initial Setup and Mock User ID
  useEffect(() => {
    // Generate a mock user ID for the dashboard
    setUserId(crypto.randomUUID());
    setIsAuthReady(true);
  }, []);

  // 2. Data Simulation (Simulating a live backend update every 5 seconds)
  useEffect(() => {
    if (!isAuthReady) return;

    const intervalId = setInterval(() => {
      setSystemData(prevData => {
        // Find and update "Pads Detected Today"
        const newStats = prevData.stats.map(stat => {
          if (stat.type === 'pads') {
            // Increment pads count randomly by 1-3
            const newPads = stat.value + Math.floor(Math.random() * 3) + 1;
            return { ...stat, value: newPads };
          }
          if (stat.type === 'temp') {
            // Fluctuate temperature slightly around a setpoint (e.g., 280-290)
            const fluctuation = (Math.random() * 4) - 2; // -2 to +2
            const newTemp = Math.max(275, Math.min(295, Math.round(285 + fluctuation)));
            return { ...stat, value: newTemp };
          }
          return stat;
        });

        // Add a new random activity event every minute (simulated by 10 seconds)
        const newActivity = { 
            id: Date.now(), 
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), 
            event: Math.random() < 0.5 ? 'Air Quality sensor polled' : 'System check initiated', 
            status: 'info' 
        };
        
        return { 
            ...prevData, 
            stats: newStats,
            recentActivity: [newActivity, ...prevData.recentActivity].slice(0, 5) // Keep the 5 newest
        };
      });
    }, 5000); // Update data every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [isAuthReady]);

  if (!isAuthReady) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mr-4"></div>
        <span className="text-gray-700 text-lg">Loading Disposal System...</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Trash2 className="w-7 h-7 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">AI Smart Disposal</h1>
          </div>
          <div className="text-sm text-gray-500 font-mono">
            System User ID: {userId}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AlertBanner alerts={systemData.alerts} />
        <DisposalDashboard systemData={systemData} />
      </div>

      {/* Footer */}
      <footer className="mt-12 py-6 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-lg font-bold text-green-700 mb-1">
            "Clean Disposal. Healthy Future. Sustainable Tomorrow."
          </p>
          <p className="text-sm text-gray-500">
            AI-Powered Smart Sanitary Pad Disposal System | Built for Excellence
          </p>
        </div>
      </footer>
    </div>
  );
}
