import React, { useState, useEffect } from 'react';
import {
  Activity,
  Cpu,
  Database,
  ShieldAlert,
  FileText,
  Settings,
  Thermometer,
  Droplets,
  Wind,
  Radio,
  Battery,
  Signal,
  Wifi,
  Bell,
  Sun,
  Moon,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Menu,
  X,
  ChevronRight,
  Info,
  Download,
  Plus,
  Search,
  Filter,
  Trash2,
  Sliders,
  User,
  Zap,
  Check
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useFirebaseData } from './useFirebaseData';
import Login from './Login';
import { ref, update } from 'firebase/database';
import { db } from './firebase';

function App() {
  // --- STATE ---
  const [selectedDevice, setSelectedDevice] = useState('Thermostat-01');
  const { fbTelemetry, fbDevices, fbAlerts, loading } = useFirebaseData(selectedDevice);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [timePeriod, setTimePeriod] = useState('Hourly'); // 'Hourly' | 'Daily' | 'Weekly'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'AQISensor-04 disconnected', time: '13 min ago', read: false, type: 'critical' },
    { id: 2, text: 'GasSensor-03 battery below 20%', time: '45 min ago', read: false, type: 'warning' },
    { id: 3, text: 'Firmware updated on DEV-001', time: '2 hours ago', read: true, type: 'info' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // --- DYNAMIC TELEMETRY DATA ---
  const [telemetry, setTelemetry] = useState({
    temp: 22.4,
    humidity: 52.8,
    gas: 310,
    onlineDevices: 3,
    totalDevices: 5
  });

  // --- DEVICES STATE ---
  const [devices, setDevices] = useState([

  ]);

  // --- ALERTS STATE ---
  const [alerts, setAlerts] = useState([

  ]);

  // --- RECENT ACTIVITY STATE ---
  const [activities, setActivities] = useState([
    { id: 1, type: 'green', text: 'Device came online: Pressure-05', time: '2 min ago' },
    { id: 2, type: 'red', text: 'Alert triggered: AQISensor-04 disconnected', time: '13 min ago' },
    { id: 3, type: 'amber', text: 'Device went offline: AQISensor-04', time: '45 min ago' },
    { id: 4, type: 'blue', text: 'Firmware/config update: DEV-001 updated to v2.1', time: '2 hours ago' },
    { id: 5, type: 'green', text: 'Device reconnected: Thermostat-01', time: '5 hours ago' }
  ]);

  // --- SETTINGS STATE ---
  const [tempThreshold, setTempThreshold] = useState(28);
  const [gasThreshold, setGasThreshold] = useState(400);
  const [syncInterval, setSyncInterval] = useState(5); // in seconds
  const [profileName, setProfileName] = useState('Admin Operator');
  const [profileRole, setProfileRole] = useState('System Architect');

  // --- CHART HISTORICAL DATA STATE ---
  const [chartData, setChartData] = useState({
    Hourly: [
      { time: '02:00', temp: 21.4, hum: 54.2, gas: 290 },
      { time: '03:00', temp: 21.6, hum: 53.9, gas: 295 },
      { time: '04:00', temp: 21.5, hum: 53.5, gas: 300 },
      { time: '05:00', temp: 21.8, hum: 53.0, gas: 285 },
      { time: '06:00', temp: 22.0, hum: 52.4, gas: 310 },
      { time: '07:00', temp: 22.1, hum: 52.9, gas: 305 },
      { time: '08:00', temp: 22.3, hum: 52.5, gas: 320 },
      { time: '09:00', temp: 22.5, hum: 52.1, gas: 315 },
      { time: '10:00', temp: 22.4, hum: 52.8, gas: 310 }
    ],
    Daily: [
      { time: 'Mon', temp: 21.2, hum: 55.0, gas: 280 },
      { time: 'Tue', temp: 21.8, hum: 54.1, gas: 295 },
      { time: 'Wed', temp: 22.5, hum: 53.2, gas: 340 },
      { time: 'Thu', temp: 22.1, hum: 52.8, gas: 310 },
      { time: 'Fri', temp: 22.4, hum: 52.0, gas: 305 },
      { time: 'Sat', temp: 21.9, hum: 51.5, gas: 290 },
      { time: 'Sun', temp: 22.2, hum: 52.8, gas: 310 }
    ],
    Weekly: [
      { time: 'Wk 18', temp: 20.8, hum: 56.5, gas: 270 },
      { time: 'Wk 19', temp: 21.5, hum: 55.0, gas: 290 },
      { time: 'Wk 20', temp: 22.0, hum: 54.2, gas: 305 },
      { time: 'Wk 21', temp: 22.4, hum: 52.8, gas: 310 }
    ]
  });

  // --- EFFECT: LIVE CLOCK ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- EFFECT: THEME CLASSIFICATION ---
  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove('theme-light');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.add('theme-light');
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // --- EFFECT: SYNC FIREBASE DATA ---
  useEffect(() => {
    if (!loading) {
      setTelemetry(prev => ({ ...prev, ...fbTelemetry }));

      // Update Chart
      setChartData(dataPrev => {
        const hourlyCopy = [...dataPrev.Hourly];
        const lastPoint = { ...hourlyCopy[hourlyCopy.length - 1] };
        hourlyCopy[hourlyCopy.length - 1] = {
          ...lastPoint,
          temp: fbTelemetry.temp,
          hum: fbTelemetry.humidity,
          gas: fbTelemetry.gas
        };
        return { ...dataPrev, Hourly: hourlyCopy };
      });

      // We map the incoming Firebase alerts to our local state if they aren't there yet
      if (fbAlerts && fbAlerts.length > 0) {
        setAlerts(prev => {
          const newAlerts = fbAlerts.filter(fa => !prev.find(pa => pa.id === fa.id));
          if (newAlerts.length > 0) {
            // Add new alerts to the activities log
            setActivities(act => [
              ...newAlerts.map(a => ({
                id: Date.now() + Math.random(),
                type: a.severity === 'Critical' ? 'red' : 'amber',
                text: `Alert triggered: ${a.device} ${a.type}`,
                time: 'Just now'
              })),
              ...act
            ]);
          }
          return [...newAlerts, ...prev];
        });
      }

      // Update the devices if available
      if (fbDevices && fbDevices.length > 0) {
        setDevices(prev => {
          const updatedDevices = [...prev];
          fbDevices.forEach(fbDev => {
            const index = updatedDevices.findIndex(d => d.name === fbDev.name);
            if (index !== -1) {
              updatedDevices[index] = { ...updatedDevices[index], ...fbDev, battery: Number(fbDev.battery) };
            } else {
              updatedDevices.push({ ...fbDev, battery: Number(fbDev.battery) });
            }
          });
          return updatedDevices;
        });
      }

      setLastSyncTime(new Date());
    }
  }, [fbTelemetry, fbDevices, fbAlerts, loading]);

  // --- ACTIONS ---
  const handleAcknowledgeAlert = (alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'Acknowledged' } : a));
  };

  const handleResolveAlert = (alertId, deviceId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'Resolved' } : a));
    // Clear warning status on device if resolved
    if (deviceId) {
      setDevices(prev => prev.map(d => d.name === deviceId ? { ...d, status: 'online' } : d));
    }
  };

  const handleAddDevice = () => {
    const nextId = `DEV-00${devices.length + 1}`;
    const newDev = {
      id: nextId,
      name: `AuxSensor-0${devices.length + 1}`,
      zone: 'Zone C',
      status: 'online',
      battery: 100,
      signal: 4,
      type: 'auxiliary',
      value: 'Normal'
    };
    setDevices([...devices, newDev]);
    setTelemetry(prev => ({ ...prev, totalDevices: prev.totalDevices + 1, onlineDevices: prev.onlineDevices + 1 }));
    setActivities(prev => [
      { id: Date.now(), type: 'green', text: `Device provisioned: ${newDev.name}`, time: 'Just now' },
      ...prev
    ]);
  };

  const toggleDeviceStatus = (deviceId) => {
    setDevices(prev => prev.map(d => {
      if (d.id === deviceId) {
        const nextStatus = d.status === 'online' ? 'offline' : 'online';

        // update telemetry device count
        setTelemetry(t => {
          const change = nextStatus === 'online' ? 1 : -1;
          return {
            ...t,
            onlineDevices: Math.max(0, Math.min(t.totalDevices, t.onlineDevices + change))
          };
        });

        // Add activity timeline
        setActivities(act => [
          {
            id: Date.now(),
            type: nextStatus === 'online' ? 'green' : 'amber',
            text: `Device status changed: ${d.name} is now ${nextStatus}`,
            time: 'Just now'
          },
          ...act
        ]);

        const nextBattery = nextStatus === 'offline' ? 0 : d.battery === 0 ? 80 : d.battery;

        // Update Firebase
        update(ref(db, `devices/${deviceId}`), {
          status: nextStatus,
          battery: nextBattery
        }).catch(err => console.error("Error updating device status in Firebase:", err));

        return {
          ...d,
          status: nextStatus,
          battery: nextBattery,
          signal: nextStatus === 'offline' ? 0 : 4
        };
      }
      return d;
    }));
  };

  const triggerDevicePing = (deviceName) => {
    setActivities(act => [
      { id: Date.now(), type: 'blue', text: `Ping response from ${deviceName} · Latency 14ms`, time: 'Just now' },
      ...act
    ]);
  };

  const handleClearResolvedAlerts = () => {
    setAlerts(prev => prev.filter(a => a.status !== 'Resolved'));
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Get active alerts count
  const activeAlertsCount = alerts.filter(a => a.status === 'Active' || a.status === 'Acknowledged').length;
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // --- STAT CALCULATIONS FOR SUMMARY (2x2) ---
  const currentChartSet = chartData[timePeriod];
  const avgTemp = (currentChartSet.reduce((acc, c) => acc + c.temp, 0) / currentChartSet.length).toFixed(1);
  const avgHum = (currentChartSet.reduce((acc, c) => acc + c.hum, 0) / currentChartSet.length).toFixed(1);
  const maxTemp = Math.max(...currentChartSet.map(c => c.temp)).toFixed(1);
  const minTemp = Math.min(...currentChartSet.map(c => c.temp)).toFixed(1);

  // Styles based on mode
  const glassStyle = darkMode ? 'glass-dark text-slate-100' : 'glass-light text-slate-900';
  const textTitleStyle = darkMode ? 'text-slate-100' : 'text-slate-800';
  const textSubtitleStyle = darkMode ? 'text-slate-400' : 'text-slate-500';
  const borderStyle = darkMode ? 'border-white/10' : 'border-slate-200';
  const subCardBg = darkMode ? 'bg-slate-900/60' : 'bg-slate-50';

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} darkMode={darkMode} />;
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-all duration-300 ${darkMode ? 'bg-[#0a0f1e] text-slate-200' : 'bg-[#f8fafc] text-slate-800'}`}>

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 1. SIDEBAR (190px fixed on desktop) */}
      <aside className={`fixed top-0 bottom-0 left-0 z-40 w-[190px] border-r ${borderStyle} ${darkMode ? 'bg-[#0a0f1e] md:bg-transparent' : 'bg-[#f8fafc] md:bg-transparent'} ${glassStyle} transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} flex flex-col justify-between p-4`}>
        <div>
          {/* Logo & Header */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-heading font-bold text-sm tracking-wide block bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">ApexIoT</span>
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Enterprise Suite</span>
            </div>
            <button className="md:hidden ml-auto" onClick={() => setSidebarOpen(false)}>
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {[
              { name: 'Dashboard', icon: Activity },
              { name: 'Devices', icon: Cpu, badge: devices.length },
              { name: 'Analytics', icon: Database },
              { name: 'Alerts', icon: ShieldAlert, badge: activeAlertsCount },
              { name: 'Reports', icon: FileText },
              { name: 'Settings', icon: Settings }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.name);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${isActive
                    ? 'bg-blue-600/15 text-blue-400 border-l-2 border-blue-500'
                    : 'hover:bg-slate-500/10 text-slate-400 hover:text-slate-200'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.badge !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${item.name === 'Alerts' && activeAlertsCount > 0
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-slate-500/20 text-slate-400'
                        }`}>
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3 h-3 text-blue-400" />}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-3 pt-4 border-t border-slate-500/10">
          {/* Status indicators */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeAlertsCount > 0 ? 'bg-amber-400' : 'bg-green-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${activeAlertsCount > 0 ? 'bg-amber-500 glow-amber' : 'bg-green-500 glow-green'}`}></span>
            </span>
            <span className="text-[10px] font-medium text-slate-400 uppercase">
              {activeAlertsCount > 0 ? 'Warnings Active' : 'All Systems Nominal'}
            </span>
          </div>

          {/* Live clock */}
          <div className="bg-slate-500/5 p-2 rounded border border-slate-500/10 text-center">
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">System Clock</span>
            <span className="text-xs font-mono font-bold tracking-widest text-brand-primary">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          <div className="text-[9px] text-slate-500 flex justify-between">
            <span>v1.4.2</span>
            <span>OS: Win-x64</span>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 md:pl-[190px] flex flex-col min-h-screen">

        {/* 2. TOP HEADER */}
        <header className={`sticky top-0 z-30 border-b ${borderStyle} ${glassStyle} px-4 py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg hover:bg-slate-500/10 text-slate-400"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-sm md:text-base font-bold tracking-tight m-0 flex items-center gap-2">
                IoT Monitoring System
                <span className="hidden sm:inline text-xs font-normal text-slate-500 bg-slate-500/10 px-2 py-0.5 rounded-full">v1.4.2</span>
              </h1>
              <p className="text-[10px] md:text-xs text-slate-500 m-0">
                Real-time telemetry · <span className="text-blue-500 font-medium">ApexIoT Global Grid</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Sync Timestamp indicator */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500">
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Synced: {lastSyncTime.toLocaleTimeString()}</span>
            </div>

            {/* Device Selector */}
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium outline-none transition-all cursor-pointer ${darkMode
                ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700'
                : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                }`}
            >
              {fbDevices.length > 0 ? (
                fbDevices.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))
              ) : (
                <option value="Thermostat-01">Thermostat-01</option>
              )}
            </select>

            {/* Dark/Light mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-slate-500/10 text-slate-400 hover:text-slate-200 transition-colors"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-600" />}
            </button>

            {/* Notifications panel toggle */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-slate-500/10 text-slate-400 hover:text-slate-200 transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {showNotifications && (
                <div className={`absolute right-0 mt-2 w-72 rounded-xl shadow-xl border ${borderStyle} p-3 z-50 ${darkMode ? 'bg-[#0f172a] text-slate-200' : 'bg-white text-slate-800'}`}>
                  <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-500/10">
                    <span className="text-xs font-bold font-heading">Notifications</span>
                    <button
                      onClick={handleMarkAllNotificationsRead}
                      className="text-[10px] text-blue-500 hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-2 rounded-lg text-[11px] ${n.read ? 'opacity-60' : 'bg-blue-500/5'}`}>
                        <div className="flex justify-between font-semibold">
                          <span className={n.type === 'critical' ? 'text-red-400' : n.type === 'warning' ? 'text-amber-400' : 'text-blue-400'}>
                            {n.type.toUpperCase()}
                          </span>
                          <span className="text-slate-500 text-[9px]">{n.time}</span>
                        </div>
                        <p className="mt-0.5 text-slate-300 dark:text-slate-300">{n.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-500/20">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-inner">
                {profileName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-[11px] font-bold leading-tight">{profileName}</span>
                <span className="block text-[9px] text-slate-500 leading-none">{profileRole}</span>
              </div>
            </div>
          </div>
        </header>

        {/* CONTAINER FOR VIEWS */}
        <div className="flex-1 p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">

          {/* ======================================= */}
          {/* TAB 1: DASHBOARD VIEW                   */}
          {/* ======================================= */}
          {activeTab === 'Dashboard' && (
            <>
              {/* 3. KPI CARDS (4-column grid) */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Temp Card */}
                <div className={`kpi-card kpi-corner-orange p-5 rounded-xl shadow-lg ${glassStyle} flex flex-col justify-between min-h-[130px]`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider block font-bold">Temperature <span className="lowercase font-normal text-[10px] ml-1 opacity-70">({selectedDevice})</span></span>
                      <span className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-orange-400 mt-1 block">
                        {telemetry.temp.toFixed(1)}°C
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-400">
                      <Thermometer className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-500 mt-3">
                    <TrendingUp className="w-4 h-4 text-orange-400" />
                    <span>Average historical: 22.0°C</span>
                  </div>
                </div>

                {/* Humidity Card */}
                <div className={`kpi-card kpi-corner-blue p-5 rounded-xl shadow-lg ${glassStyle} flex flex-col justify-between min-h-[130px]`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider block font-bold">Humidity <span className="lowercase font-normal text-[10px] ml-1 opacity-70">({selectedDevice})</span></span>
                      <span className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-cyan-400 mt-1 block">
                        {telemetry.humidity.toFixed(1)}%
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                      <Droplets className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-green-500/15 text-green-400">
                      STABLE
                    </span>
                    <span className="text-sm text-slate-500">Zone B fluctuates</span>
                  </div>
                </div>

                {/* Gas / AQI Card */}
                <div className={`kpi-card kpi-corner-purple p-5 rounded-xl shadow-lg ${glassStyle} flex flex-col justify-between min-h-[130px]`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider block font-bold">Gas / AQI <span className="lowercase font-normal text-[10px] ml-1 opacity-70">({selectedDevice})</span></span>
                      <span className={`text-3xl md:text-4xl font-heading font-bold tracking-tight mt-1 block ${telemetry.gas > gasThreshold ? 'text-red-400 animate-pulse' : 'text-purple-400'}`}>
                        {telemetry.gas} <span className="text-sm font-normal text-slate-500">ppm</span>
                      </span>
                    </div>
                    <div className={`p-2.5 rounded-lg text-purple-400 ${telemetry.gas > gasThreshold ? 'bg-red-500/15 text-red-400' : 'bg-purple-500/10'}`}>
                      <Wind className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-500 mt-3">
                    <AlertTriangle className={`w-4 h-4 ${telemetry.gas > gasThreshold ? 'text-red-400' : 'text-purple-400'}`} />
                    <span>Threshold: {gasThreshold} ppm</span>
                  </div>
                </div>

                {/* Active Devices Card */}
                <div className={`kpi-card kpi-corner-green p-5 rounded-xl shadow-lg ${glassStyle} flex flex-col justify-between min-h-[130px]`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider block font-bold">Active Devices</span>
                      <span className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-green-400 mt-1 block">
                        {telemetry.onlineDevices} <span className="text-sm font-normal text-slate-500">/ {telemetry.totalDevices}</span>
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-green-500/10 text-green-400">
                      <Wifi className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-3 text-sm text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 glow-red"></span>
                    <span>{telemetry.totalDevices - telemetry.onlineDevices} offline sensor(s)</span>
                  </div>
                </div>
              </section>

              {/* 4. REAL-TIME TREND CHARTS & STAT SUMMARY */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Trends Container */}
                <div className={`lg:col-span-2 p-5 rounded-xl shadow-lg ${glassStyle} flex flex-col space-y-4`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-heading font-bold text-base m-0">Environmental Trend Charts</h3>
                      <p className="text-xs text-slate-500">Continuous telemetry area mapping</p>
                    </div>

                    {/* Chart time switcher */}
                    <div className="flex bg-slate-500/10 p-0.5 rounded-lg border border-slate-500/15">
                      {['Hourly', 'Daily', 'Weekly'].map(period => (
                        <button
                          key={period}
                          onClick={() => setTimePeriod(period)}
                          className={`text-xs px-3 py-1.5 rounded-md font-bold transition-all ${timePeriod === period
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3-Column subgrid inside for the charts */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Temperature Area Chart */}
                    <div className={`p-3 rounded-lg border ${borderStyle} ${subCardBg} flex flex-col justify-between`}>
                      <div className="mb-2">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Temperature Trend (°C)</span>
                        <span className="text-xs text-orange-400 font-bold font-mono">{telemetry.temp.toFixed(1)}°C</span>
                      </div>
                      <div className="h-28 w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                          <AreaChart data={currentChartSet} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                            <XAxis dataKey="time" tick={{ fontSize: 8 }} stroke={darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} />
                            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 8 }} stroke={darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} />
                            <Tooltip contentStyle={{ fontSize: '10px', background: darkMode ? '#1e293b' : '#fff', borderColor: 'rgba(0,0,0,0.1)' }} />
                            <Area type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} dot={false} fillOpacity={1} fill="url(#colorTemp)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Humidity Area Chart */}
                    <div className={`p-3 rounded-lg border ${borderStyle} ${subCardBg} flex flex-col justify-between`}>
                      <div className="mb-2">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Humidity Trend (%)</span>
                        <span className="text-xs text-cyan-400 font-bold font-mono">{telemetry.humidity.toFixed(1)}%</span>
                      </div>
                      <div className="h-28 w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                          <AreaChart data={currentChartSet} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                            <XAxis dataKey="time" tick={{ fontSize: 8 }} stroke={darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} />
                            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 8 }} stroke={darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} />
                            <Tooltip contentStyle={{ fontSize: '10px', background: darkMode ? '#1e293b' : '#fff', borderColor: 'rgba(0,0,0,0.1)' }} />
                            <Area type="monotone" dataKey="hum" stroke="#06b6d4" strokeWidth={2} dot={false} fillOpacity={1} fill="url(#colorHum)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Gas Level Area Chart */}
                    <div className={`p-3 rounded-lg border ${borderStyle} ${subCardBg} flex flex-col justify-between`}>
                      <div className="mb-2">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Gas Level Trend (ppm)</span>
                        <span className="text-xs text-purple-400 font-bold font-mono">{telemetry.gas} ppm</span>
                      </div>
                      <div className="h-28 w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                          <AreaChart data={currentChartSet} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorGas" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                            <XAxis dataKey="time" tick={{ fontSize: 8 }} stroke={darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} />
                            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 8 }} stroke={darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} />
                            <Tooltip contentStyle={{ fontSize: '10px', background: darkMode ? '#1e293b' : '#fff', borderColor: 'rgba(0,0,0,0.1)' }} />
                            <Area type="monotone" dataKey="gas" stroke="#a855f7" strokeWidth={2} dot={false} fillOpacity={1} fill="url(#colorGas)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 7. ENVIRONMENTAL SUMMARY (2x2 Stat Grid) */}
                <div className={`p-5 rounded-xl shadow-lg ${glassStyle} flex flex-col justify-between`}>
                  <div>
                    <h3 className="font-heading font-bold text-base m-0">Environmental Summary</h3>
                    <p className="text-xs text-slate-500">aggregated system metrics ({timePeriod})</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 my-4">
                    <div className={`p-3 rounded-lg border ${borderStyle} ${subCardBg}`}>
                      <span className="text-xs text-slate-400 block uppercase font-bold">Avg Temp</span>
                      <span className="text-base font-bold font-mono tracking-tight text-orange-400">{avgTemp}°C</span>
                    </div>
                    <div className={`p-3 rounded-lg border ${borderStyle} ${subCardBg}`}>
                      <span className="text-xs text-slate-400 block uppercase font-bold">Avg Humidity</span>
                      <span className="text-base font-bold font-mono tracking-tight text-cyan-400">{avgHum}%</span>
                    </div>
                    <div className={`p-3 rounded-lg border ${borderStyle} ${subCardBg}`}>
                      <span className="text-xs text-slate-400 block uppercase font-bold">Max Temperature</span>
                      <span className="text-base font-bold font-mono tracking-tight text-red-400">{maxTemp}°C</span>
                    </div>
                    <div className={`p-3 rounded-lg border ${borderStyle} ${subCardBg}`}>
                      <span className="text-xs text-slate-400 block uppercase font-bold">Min Temperature</span>
                      <span className="text-base font-bold font-mono tracking-tight text-blue-400">{minTemp}°C</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 bg-slate-500/5 p-2.5 rounded flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span>Values dynamically aggregate historical record inputs.</span>
                  </div>
                </div>

              </section>

              {/* DEVICE STATUS & ALERT CENTER */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 5. DEVICE STATUS PANEL */}
                <div className={`lg:col-span-2 p-5 rounded-xl shadow-lg ${glassStyle} flex flex-col space-y-4`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-heading font-bold text-base m-0">Live Device Status</h3>
                      <p className="text-xs text-slate-500">Active sensors & connectivity logs</p>
                    </div>
                    <button
                      onClick={handleAddDevice}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Provision Device</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-500/10 text-slate-500 text-xs uppercase font-bold">
                          <th className="pb-2">Device ID / Name</th>
                          <th className="pb-2">Location</th>
                          <th className="pb-2">Status</th>
                          <th className="pb-2">Battery</th>
                          <th className="pb-2 text-center">Signal</th>
                          <th className="pb-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-500/10">
                        {devices.map(device => {
                          const isWarning = device.status === 'warning';
                          const isOffline = device.status === 'offline';
                          const isOnline = device.status === 'online';

                          return (
                            <tr key={device.id} className="hover:bg-slate-500/5 transition-colors">
                              <td className="py-2.5">
                                <div className="font-bold flex items-center gap-1.5">
                                  <span className="relative flex h-2 w-2">
                                    {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                                    {isWarning && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>}
                                    {isOffline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}

                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-green-500 glow-green' : isWarning ? 'bg-amber-500 glow-amber' : 'bg-red-500 glow-red'
                                      }`}></span>
                                  </span>
                                  <span>{device.name}</span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{device.id} · {device.value}</span>
                              </td>
                              <td className="py-2.5 text-slate-400">{device.zone}</td>
                              <td className="py-2.5">
                                <span className={`text-[10px] font-bold uppercase ${isOnline ? 'text-green-400' : isWarning ? 'text-amber-400' : 'text-red-400'
                                  }`}>
                                  {device.status}
                                </span>
                              </td>
                              <td className="py-2.5">
                                <div className="flex items-center gap-1.5">
                                  <Battery className={`w-3.5 h-3.5 ${device.battery > 50 ? 'text-green-400' : device.battery > 25 ? 'text-amber-400' : 'text-red-400'
                                    }`} />
                                  <div className="w-12 bg-slate-500/20 h-1.5 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${device.battery > 50 ? 'bg-green-500' : device.battery > 25 ? 'bg-amber-500' : 'bg-red-500'
                                        }`}
                                      style={{ width: `${device.battery}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-[10px] font-mono font-bold text-slate-400">{device.battery}%</span>
                                </div>
                              </td>
                              <td className="py-2.5">
                                <div className="flex items-end justify-center gap-0.5 h-3">
                                  {[1, 2, 3, 4, 5].map(bar => (
                                    <span
                                      key={bar}
                                      className={`w-0.5 rounded-full ${bar <= device.signal
                                        ? device.signal >= 4 ? 'bg-green-500' : device.signal >= 3 ? 'bg-amber-500' : 'bg-red-500'
                                        : 'bg-slate-500/20'
                                        }`}
                                      style={{ height: `${bar * 20}%` }}
                                    ></span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-2.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => triggerDevicePing(device.name)}
                                    className="px-2 py-0.5 text-[9px] font-bold border border-slate-500/20 hover:border-slate-500/40 rounded text-slate-400 hover:text-slate-200"
                                    title="Ping Sensor"
                                    disabled={isOffline}
                                  >
                                    Ping
                                  </button>
                                  <button
                                    onClick={() => toggleDeviceStatus(device.id)}
                                    className={`px-2 py-0.5 text-[9px] font-bold rounded ${isOffline
                                      ? 'bg-green-600/20 text-green-400 hover:bg-green-600/35'
                                      : 'bg-red-600/20 text-red-400 hover:bg-red-600/35'
                                      }`}
                                  >
                                    {isOffline ? 'Power On' : 'Kill'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 6. ALERT CENTER */}
                <div className={`p-5 rounded-xl shadow-lg ${glassStyle} flex flex-col space-y-4`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-bold text-sm m-0">Alert Center</h3>
                      {activeAlertsCount > 0 && (
                        <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                          {activeAlertsCount}
                        </span>
                      )}
                    </div>
                    {alerts.some(a => a.status === 'Resolved') && (
                      <button
                        onClick={handleClearResolvedAlerts}
                        className="text-[9px] text-slate-500 hover:text-slate-300 flex items-center gap-1 font-semibold"
                      >
                        <Trash2 className="w-3 h-3" />
                        Clear Resolved
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5 overflow-y-auto max-h-[260px] pr-1">
                    {alerts.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2 opacity-50" />
                        <span className="text-xs">No active alerts reported</span>
                      </div>
                    ) : (
                      alerts.map(alert => {
                        const isCritical = alert.severity === 'Critical';
                        const isWarning = alert.severity === 'Warning';
                        const isNormal = alert.severity === 'Normal';

                        return (
                          <div
                            key={alert.id}
                            className={`p-3 rounded-lg border ${borderStyle} ${alert.status === 'Resolved'
                              ? 'opacity-50 bg-slate-500/5'
                              : isCritical
                                ? 'bg-red-500/5 border-red-500/20'
                                : isWarning
                                  ? 'bg-amber-500/5 border-amber-500/20'
                                  : 'bg-green-500/5 border-green-500/20'
                              }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${isCritical
                                  ? 'bg-red-500/20 text-red-400'
                                  : isWarning
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'bg-green-500/20 text-green-400'
                                  }`}>
                                  {alert.severity}
                                </span>
                                <h4 className="text-xs font-bold font-heading mt-1.5 text-slate-200 dark:text-slate-100">{alert.type}</h4>
                                <span className="text-[10px] text-slate-500 block mt-0.5">Device: {alert.device} · {alert.time}</span>
                              </div>

                              {/* Alert action toggle */}
                              {alert.status === 'Active' && (
                                <button
                                  onClick={() => handleAcknowledgeAlert(alert.id)}
                                  className="text-[9px] bg-slate-500/20 hover:bg-slate-500/35 text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded font-bold"
                                >
                                  Ack
                                </button>
                              )}
                              {alert.status === 'Acknowledged' && (
                                <button
                                  onClick={() => handleResolveAlert(alert.id, alert.device)}
                                  className="text-[9px] bg-green-600/20 hover:bg-green-600/30 text-green-400 px-2 py-0.5 rounded font-bold"
                                >
                                  Resolve
                                </button>
                              )}
                              {alert.status === 'Resolved' && (
                                <span className="text-[9px] text-green-500 font-bold flex items-center gap-0.5">
                                  <CheckCircle className="w-3 h-3" /> Resolved
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </section>

              {/* SMART INSIGHTS & RECENT ACTIVITY FEED */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 8. SMART INSIGHTS */}
                <div className={`lg:col-span-2 p-5 rounded-xl shadow-lg ${glassStyle} flex flex-col space-y-4`}>
                  <div>
                    <h3 className="font-heading font-bold text-sm m-0">Smart Insights</h3>
                    <p className="text-[10px] text-slate-500">Autonomous diagnostic telemetry analysis</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Stability Card */}
                    <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/10 hover:border-blue-500/20 transition-all flex gap-3">
                      <div className="text-blue-400 mt-0.5 font-bold">📊</div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-300 dark:text-slate-100 font-heading">System Stability Stable</h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          All environmental parameters are within standard thresholds. Fluctuations in Zone A are self-correcting.
                        </p>
                      </div>
                    </div>

                    {/* Anomaly Card */}
                    <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/10 hover:border-blue-500/20 transition-all flex gap-3">
                      <div className="text-amber-400 mt-0.5">⚠️</div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-300 dark:text-slate-100 font-heading">Zone A Gas Anomaly</h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          AQISensor-04 went offline 13 mins ago. Gas levels in Zone A have increased by 12% over the last hour.
                        </p>
                      </div>
                    </div>

                    {/* Battery Maintenance Card */}
                    <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/10 hover:border-blue-500/20 transition-all flex gap-3">
                      <div className="text-red-400 mt-0.5">🔋</div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-300 dark:text-slate-100 font-heading">Low Battery Maintenance</h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          GasSensor-03 battery is critically low (18%). Schedule a battery replacement within 24 hours.
                        </p>
                      </div>
                    </div>

                    {/* Environmental Trend Card */}
                    <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/10 hover:border-blue-500/20 transition-all flex gap-3">
                      <div className="text-purple-400 mt-0.5">🌡️</div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-300 dark:text-slate-100 font-heading">Micro-climate Trend</h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          Temperature in Zone B has remained stable at 22.4°C ±0.2°C, while humidity is starting a downward trend.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 9. RECENT ACTIVITY FEED */}
                <div className={`p-5 rounded-xl shadow-lg ${glassStyle} flex flex-col space-y-4 relative`}>
                  <div>
                    <h3 className="font-heading font-bold text-sm m-0">Recent Activity Feed</h3>
                    <p className="text-[10px] text-slate-500">Live system state transitions</p>
                  </div>

                  <div className="timeline-line space-y-4 pl-8 relative">
                    {activities.slice(0, 5).map(act => {
                      let dotColor = 'bg-green-500 glow-green';
                      if (act.type === 'red') dotColor = 'bg-red-500 glow-red';
                      if (act.type === 'amber') dotColor = 'bg-amber-500 glow-amber';
                      if (act.type === 'blue') dotColor = 'bg-blue-500';

                      return (
                        <div key={act.id} className="relative flex flex-col items-start text-xs">
                          {/* Timeline dot */}
                          <span className={`absolute -left-[29px] top-1.5 w-3 h-3 rounded-full ${dotColor}`}></span>

                          <span className="font-semibold text-slate-300 dark:text-slate-200">{act.text}</span>
                          <span className="text-[10px] text-slate-500 mt-0.5">{act.time}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </section>
            </>
          )}

          {/* ======================================= */}
          {/* TAB 2: DEVICES VIEW                     */}
          {/* ======================================= */}
          {activeTab === 'Devices' && (
            <div className={`p-5 rounded-xl shadow-lg ${glassStyle} space-y-4`}>
              <div className="flex justify-between items-center pb-2 border-b border-slate-500/10">
                <div>
                  <h2 className="text-base font-bold font-heading m-0">Connected Sensor Registry</h2>
                  <p className="text-xs text-slate-500">Configure thresholds, names, and zones for all nodes</p>
                </div>
                <button
                  onClick={handleAddDevice}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register New Sensor</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {devices.map(device => {
                  const isOffline = device.status === 'offline';
                  return (
                    <div
                      key={device.id}
                      className={`p-4 rounded-xl border ${borderStyle} ${subCardBg} flex flex-col justify-between space-y-3 relative overflow-hidden`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono block uppercase">{device.id}</span>
                          <h3 className="text-sm font-bold font-heading text-slate-200 dark:text-slate-100">{device.name}</h3>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${device.status === 'online'
                          ? 'bg-green-500/15 text-green-400'
                          : device.status === 'warning'
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-red-500/15 text-red-400'
                          }`}>
                          {device.status}
                        </span>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-500/5 p-2 rounded">
                          <span className="text-[9px] text-slate-500 uppercase block font-bold">Zone/Location</span>
                          <span className="font-semibold text-slate-300 dark:text-slate-200">{device.zone}</span>
                        </div>
                        <div className="bg-slate-500/5 p-2 rounded">
                          <span className="text-[9px] text-slate-500 uppercase block font-bold">Telemetry Value</span>
                          <span className="font-semibold text-slate-300 dark:text-slate-200 font-mono">{device.value}</span>
                        </div>
                      </div>

                      {/* Battery and signal details */}
                      <div className="space-y-1.5 text-xs border-t border-slate-500/5 pt-2">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Battery Level:</span>
                          <span className={`font-bold ${device.battery > 50 ? 'text-green-400' : 'text-amber-400'}`}>{device.battery}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Signal Strength:</span>
                          <span className="text-slate-300 font-bold">{device.signal}/5 Bars</span>
                        </div>
                      </div>

                      {/* Device Action toolbar */}
                      <div className="flex gap-2 pt-2 border-t border-slate-500/5">
                        <button
                          onClick={() => triggerDevicePing(device.name)}
                          disabled={isOffline}
                          className="flex-1 py-1 text-xs font-semibold bg-slate-500/10 hover:bg-slate-500/20 text-slate-300 rounded border border-slate-500/10 disabled:opacity-50 disabled:pointer-events-none"
                        >
                          Ping Diagnostics
                        </button>
                        <button
                          onClick={() => toggleDeviceStatus(device.id)}
                          className={`flex-1 py-1 text-xs font-semibold rounded text-white ${isOffline ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'
                            }`}
                        >
                          {isOffline ? 'Power On' : 'Decommission'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* TAB 3: ANALYTICS VIEW                   */}
          {/* ======================================= */}
          {activeTab === 'Analytics' && (
            <div className={`p-5 rounded-xl shadow-lg ${glassStyle} space-y-6`}>
              <div className="flex justify-between items-center pb-2 border-b border-slate-500/10">
                <div>
                  <h2 className="text-base font-bold font-heading m-0">Historical Analytics Suite</h2>
                  <p className="text-xs text-slate-500">Compare metrics across time scales and analyze sensor trends</p>
                </div>
                <div className="flex bg-slate-500/10 p-0.5 rounded-lg border border-slate-500/15">
                  {['Hourly', 'Daily', 'Weekly'].map(period => (
                    <button
                      key={period}
                      onClick={() => setTimePeriod(period)}
                      className={`text-xs px-3 py-1 rounded-md font-bold transition-all ${timePeriod === period
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of big detailed charts */}
              <div className="space-y-6">
                <div className={`p-4 rounded-xl border ${borderStyle} ${subCardBg}`}>
                  <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3">Temperature Telemetry (monitored vs safe range)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={currentChartSet} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorTempBig" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.6} />
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                        <XAxis dataKey="time" stroke={darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"} />
                        <YAxis stroke={darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"} />
                        <Tooltip contentStyle={{ background: darkMode ? '#1e293b' : '#fff', borderColor: 'rgba(0,0,0,0.1)' }} />
                        <Area type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorTempBig)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Humidity Big */}
                  <div className={`p-4 rounded-xl border ${borderStyle} ${subCardBg}`}>
                    <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">Humidity Levels Trend</h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={currentChartSet} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorHumBig" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                          <XAxis dataKey="time" stroke={darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"} />
                          <YAxis stroke={darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"} />
                          <Tooltip contentStyle={{ background: darkMode ? '#1e293b' : '#fff', borderColor: 'rgba(0,0,0,0.1)' }} />
                          <Area type="monotone" dataKey="hum" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorHumBig)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Gas Level Big */}
                  <div className={`p-4 rounded-xl border ${borderStyle} ${subCardBg}`}>
                    <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">Air Quality / Gas Levels</h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={currentChartSet} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorGasBig" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.6} />
                              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                          <XAxis dataKey="time" stroke={darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"} />
                          <YAxis stroke={darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"} />
                          <Tooltip contentStyle={{ background: darkMode ? '#1e293b' : '#fff', borderColor: 'rgba(0,0,0,0.1)' }} />
                          <Area type="monotone" dataKey="gas" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorGasBig)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* TAB 4: ALERTS VIEW                      */}
          {/* ======================================= */}
          {activeTab === 'Alerts' && (
            <div className={`p-5 rounded-xl shadow-lg ${glassStyle} space-y-4`}>
              <div className="flex justify-between items-center pb-2 border-b border-slate-500/10">
                <div>
                  <h2 className="text-base font-bold font-heading m-0">Alert Incident Log</h2>
                  <p className="text-xs text-slate-500">Acknowledge, isolate, or resolve current telemetry issues</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setAlerts(prev => prev.map(a => ({ ...a, status: 'Resolved' })));
                      setDevices(d => d.map(dev => ({ ...dev, status: 'online' })));
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg border border-green-500/20"
                  >
                    Resolve All Active
                  </button>
                  {alerts.some(a => a.status === 'Resolved') && (
                    <button
                      onClick={handleClearResolvedAlerts}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-500/15 hover:bg-slate-500/25 text-slate-300 rounded-lg border border-slate-500/20"
                    >
                      Purge Logs
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {alerts.map(alert => {
                  const isCritical = alert.severity === 'Critical';
                  const isWarning = alert.severity === 'Warning';
                  return (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-xl border ${borderStyle} ${subCardBg} flex justify-between items-center`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${isCritical ? 'bg-red-500/10 text-red-400' : isWarning ? 'bg-amber-500/10 text-amber-400' : 'bg-green-500/10 text-green-400'
                          }`}>
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold font-heading">{alert.type}</h3>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isCritical ? 'bg-red-500/20 text-red-400' : isWarning ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'
                              }`}>
                              {alert.severity}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">Sensor: <span className="font-semibold">{alert.device}</span> · Logged at: {alert.time}</p>
                          <div className="mt-2 flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-500">Status:</span>
                            <span className={`text-[10px] font-bold ${alert.status === 'Active' ? 'text-red-400' : alert.status === 'Acknowledged' ? 'text-amber-400' : 'text-green-400'
                              }`}>{alert.status}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {alert.status === 'Active' && (
                          <button
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="px-3 py-1.5 text-xs font-semibold bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 rounded-lg"
                          >
                            Acknowledge
                          </button>
                        )}
                        {alert.status === 'Acknowledged' && (
                          <button
                            onClick={() => handleResolveAlert(alert.id, alert.device)}
                            className="px-3 py-1.5 text-xs font-semibold bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg"
                          >
                            Resolve Alert
                          </button>
                        )}
                        {alert.status === 'Resolved' && (
                          <span className="text-xs text-green-500 font-semibold flex items-center gap-1">
                            <Check className="w-4 h-4" /> Ready & Clean
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* TAB 5: REPORTS VIEW                     */}
          {/* ======================================= */}
          {activeTab === 'Reports' && (
            <div className={`p-5 rounded-xl shadow-lg ${glassStyle} space-y-6`}>
              <div className="pb-2 border-b border-slate-500/10">
                <h2 className="text-base font-bold font-heading m-0">Compliance & System Reports</h2>
                <p className="text-xs text-slate-500">Download formatted telemetry records and uptime charts</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PDF generation mock */}
                <div className={`p-4 rounded-xl border ${borderStyle} ${subCardBg} flex flex-col justify-between space-y-4`}>
                  <div className="space-y-2">
                    <span className="text-[10px] text-blue-400 uppercase font-bold block">Environmental Compliance Audit</span>
                    <h3 className="text-sm font-bold font-heading">Monthly Air Quality & Gas report</h3>
                    <p className="text-xs text-slate-400">Contains average hourly gas levels, incident timeline records, and calibration checks for active sensors.</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg">
                      <Download className="w-4 h-4" />
                      <span>Download PDF Report</span>
                    </button>
                    <button className="px-3 py-2 text-xs font-semibold bg-slate-500/15 hover:bg-slate-500/25 text-slate-300 rounded-lg border border-slate-500/10">
                      Preview
                    </button>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${borderStyle} ${subCardBg} flex flex-col justify-between space-y-4`}>
                  <div className="space-y-2">
                    <span className="text-[10px] text-green-400 uppercase font-bold block">Hardware Status Summary</span>
                    <h3 className="text-sm font-bold font-heading">Sensor battery & hardware diagnostics</h3>
                    <p className="text-xs text-slate-400">Reports battery drainage telemetry, signal strength indicators, and logs decommission events.</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold bg-green-600 hover:bg-green-500 text-white rounded-lg">
                      <Download className="w-4 h-4" />
                      <span>Download CSV Sheet</span>
                    </button>
                    <button className="px-3 py-2 text-xs font-semibold bg-slate-500/15 hover:bg-slate-500/25 text-slate-300 rounded-lg border border-slate-500/10">
                      Preview
                    </button>
                  </div>
                </div>
              </div>

              {/* Mock Report Table preview */}
              <div className={`p-4 rounded-xl border ${borderStyle} ${subCardBg} space-y-3`}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Telemetry History Log (Latest entries)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-500/10 font-sans uppercase font-bold text-[9px]">
                        <th className="pb-2">Timestamp</th>
                        <th className="pb-2">Source Sensor</th>
                        <th className="pb-2">Sensor Type</th>
                        <th className="pb-2 text-right">Value recorded</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-500/10 text-slate-400">
                      <tr>
                        <td className="py-2">2026-06-01 10:27:00</td>
                        <td>Thermostat-01</td>
                        <td>Temperature</td>
                        <td className="text-right text-orange-400 font-bold">{telemetry.temp.toFixed(1)}°C</td>
                      </tr>
                      <tr>
                        <td className="py-2">2026-06-01 10:27:00</td>
                        <td>Humidity-02</td>
                        <td>Humidity</td>
                        <td className="text-right text-cyan-400 font-bold">{telemetry.humidity.toFixed(1)}%</td>
                      </tr>
                      <tr>
                        <td className="py-2">2026-06-01 10:27:00</td>
                        <td>GasSensor-03</td>
                        <td>Gas Level</td>
                        <td className="text-right text-purple-400 font-bold">{telemetry.gas} ppm</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* TAB 6: SETTINGS VIEW                     */}
          {/* ======================================= */}
          {activeTab === 'Settings' && (
            <div className={`p-5 rounded-xl shadow-lg ${glassStyle} space-y-6`}>
              <div className="pb-2 border-b border-slate-500/10">
                <h2 className="text-base font-bold font-heading m-0">System configuration Settings</h2>
                <p className="text-xs text-slate-500">Configure alert thresholds and live sync updates</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Telemetry thresholds */}
                <div className={`p-4 rounded-xl border ${borderStyle} ${subCardBg} space-y-4`}>
                  <div className="flex items-center gap-2 text-blue-400">
                    <Sliders className="w-5 h-5" />
                    <h3 className="text-sm font-bold font-heading m-0">Alert thresholds</h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 font-bold">Temperature warning threshold (°C)</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="15"
                          max="40"
                          value={tempThreshold}
                          onChange={(e) => setTempThreshold(Number(e.target.value))}
                          className="flex-1 accent-blue-500 h-1.5 rounded-lg bg-slate-500/20 appearance-none"
                        />
                        <span className="font-mono text-xs font-bold text-orange-400 min-w-[40px] text-right">{tempThreshold}°C</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 font-bold">Gas level Warning threshold (ppm)</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="100"
                          max="800"
                          value={gasThreshold}
                          onChange={(e) => setGasThreshold(Number(e.target.value))}
                          className="flex-1 accent-blue-500 h-1.5 rounded-lg bg-slate-500/20 appearance-none"
                        />
                        <span className="font-mono text-xs font-bold text-purple-400 min-w-[40px] text-right">{gasThreshold} ppm</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 font-bold">Telemetry Live Sync Interval (seconds)</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="1"
                          max="15"
                          value={syncInterval}
                          onChange={(e) => setSyncInterval(Number(e.target.value))}
                          className="flex-1 accent-blue-500 h-1.5 rounded-lg bg-slate-500/20 appearance-none"
                        />
                        <span className="font-mono text-xs font-bold text-cyan-400 min-w-[40px] text-right">{syncInterval}s</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile card */}
                <div className={`p-4 rounded-xl border ${borderStyle} ${subCardBg} space-y-4`}>
                  <div className="flex items-center gap-2 text-blue-400">
                    <User className="w-5 h-5" />
                    <h3 className="text-sm font-bold font-heading m-0">Operator Profile</h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Operator Name</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className={`w-full px-3 py-1.5 text-xs rounded-lg border ${borderStyle} bg-slate-500/5 focus:outline-none focus:border-blue-500`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">System Role</label>
                      <input
                        type="text"
                        value={profileRole}
                        onChange={(e) => setProfileRole(e.target.value)}
                        className={`w-full px-3 py-1.5 text-xs rounded-lg border ${borderStyle} bg-slate-500/5 focus:outline-none focus:border-blue-500`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* 10. FOOTER */}
        <footer className={`mt-auto border-t ${borderStyle} ${glassStyle} px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-slate-500`}>
          <div>
            <span>ApexIoT · All rights reserved</span>
          </div>
          <div>
            <span>System v1.4.2</span>
          </div>
          <div className="flex items-center gap-1">
            <RefreshCw className="w-3 h-3 text-blue-500" />
            <span>↻ Last sync: {lastSyncTime.toLocaleTimeString()}</span>
          </div>
        </footer>

      </main>

    </div>
  );
}

export default App;
