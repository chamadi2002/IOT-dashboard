// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD4i1QlBErbZi52Qj383BCfrfkFVZfsDJg",
    authDomain: "iot-dashboard-5e31d.firebaseapp.com",
    projectId: "iot-dashboard-5e31d",
    storageBucket: "iot-dashboard-5e31d.firebasestorage.app",
    messagingSenderId: "390115644522",
    appId: "1:390115644522:web:5812ca3ad8396281516613",
    measurementId: "G-9HRE2BV14H",
    databaseURL: "https://iot-dashboard-5e31d-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getDatabase(app);