
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


// Your web app's Firebase configuration
const firebaseConfig = {
  "apiKey": "AIzaSyALTWBrB0s_-BrXXd5KbmBN6roSOloyIFE",
  "authDomain": "studio-8182373574-a1bcb.firebaseapp.com",
  "projectId": "studio-8182373574-a1bcb",
  "storageBucket": "studio-8182373574-a1bcb.appspot.com",
  "messagingSenderId": "582602115508",
  "appId": "1:582602115508:web:4f27ab2909363e94cb0ae1",
  "measurementId": ""
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
