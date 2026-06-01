import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from './firebase';

export function useFirebaseData(selectedDevice = 'Thermostat-01') {
  const [telemetry, setTelemetry] = useState({
    temp: 22.4,
    humidity: 52.8,
    gas: 310,
    onlineDevices: 3,
    totalDevices: 5
  });

  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rawTelemetryData, setRawTelemetryData] = useState(null);

  // 1. Subscribe to Firebase Data
  useEffect(() => {
    console.log("Firebase DB instance:", db);
    console.log("Attempting to connect to Firebase Realtime Database...");

    // Listen to Devices
    const devicesRef = ref(db, 'devices');
    const unsubDevices = onValue(devicesRef, (snapshot) => {
      console.log("Devices snapshot received. Exists:", snapshot.exists());
      if (snapshot.exists()) {
        const rawDevices = snapshot.val();
        console.log("Firebase Devices Data:", rawDevices);
        const formattedDevices = Object.entries(rawDevices).map(([id, data]) => ({
          id,
          name: data.name || id,
          zone: data.location || 'Unknown Zone',
          status: data.status || 'offline',
          battery: data.battery || 0,
          signal: 4,
          type: 'temperature',
          value: 'N/A'
        }));
        
        setDevices(formattedDevices);
        setTelemetry(prev => ({
          ...prev,
          totalDevices: formattedDevices.length,
          onlineDevices: formattedDevices.filter(d => d.status === 'online').length
        }));
      }
      setLoading(false); 
    }, (error) => {
      console.error("Firebase Devices ERROR:", error.message);
      setLoading(false);
    });

    // Listen to Telemetry
    const telemetryRef = ref(db, 'telemetry');
    const unsubTelemetry = onValue(telemetryRef, (snapshot) => {
      console.log("Telemetry snapshot received. Exists:", snapshot.exists());
      if (snapshot.exists()) {
        setRawTelemetryData(snapshot.val());
      }
      setLoading(false);
    }, (error) => {
      console.error("Firebase Telemetry ERROR:", error.message);
      setLoading(false);
    });

    // Listen to Alerts
    const alertsRef = ref(db, 'alerts');
    const unsubAlerts = onValue(alertsRef, (snapshot) => {
      console.log("Alerts snapshot received. Exists:", snapshot.exists());
      if (snapshot.exists()) {
        const rawAlerts = snapshot.val();
        console.log("Firebase Alerts Data:", rawAlerts);
        const formattedAlerts = Object.entries(rawAlerts).map(([id, data]) => ({
          id: id,
          type: data.message || 'Unknown Alert',
          device: data.device || 'System',
          severity: data.level === 'warning' ? 'Warning' : 'Critical',
          time: data.time || new Date().toLocaleTimeString(),
          status: 'Active'
        }));
        setAlerts(formattedAlerts);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firebase Alerts ERROR:", error.message);
      setLoading(false);
    });

    return () => {
      unsubDevices();
      unsubTelemetry();
      unsubAlerts();
    };
  }, []);

  // 2. Process Telemetry when selectedDevice or raw telemetry changes
  useEffect(() => {
    if (rawTelemetryData) {
      const deviceTelemetry = rawTelemetryData[selectedDevice];
      if (deviceTelemetry) {
        const timestamps = Object.keys(deviceTelemetry);
        const latestKey = timestamps[timestamps.length - 1];
        const latestReading = deviceTelemetry[latestKey];
        
        if (latestReading) {
          setTelemetry(prev => ({
            ...prev,
            temp: latestReading.temperature !== undefined ? latestReading.temperature : prev.temp,
            humidity: latestReading.humidity !== undefined ? latestReading.humidity : prev.humidity,
            gas: latestReading.gas !== undefined ? latestReading.gas : prev.gas,
          }));
        }
      } else {
        // If device has no telemetry, you could optionally zero it out or leave as is
        // We'll just leave it at its last known value to avoid UI breaking.
      }
    }
  }, [rawTelemetryData, selectedDevice]);

  return { fbTelemetry: telemetry, fbDevices: devices, fbAlerts: alerts, loading };
}
