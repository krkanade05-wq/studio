// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-8182373574-a1bcb",
  "appId": "1:582602115508:web:4f27ab2909363e94cb0ae1",
  "apiKey": "AIzaSyDis2q5AQb3PxxUKF54cTOIWeaTO1BIllw",
  "authDomain": "studio-8182373574-a1bcb.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "582602115508"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}


export { app };
