import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBTU5S3TIW0P1JZd3-vYc6U9AcIQJMxrP4",
  authDomain: "snack-track-a20bb.firebaseapp.com",
  projectId: "snack-track-a20bb",
  storageBucket: "snack-track-a20bb.firebasestorage.app",
  messagingSenderId: "526998114331",
  appId: "1:526998114331:web:8d4527fcd67fdfb2cda8be",
  measurementId: "G-HS1WXW4R6J"
};

const app = initializeApp(firebaseConfig);
// analytics is optional (only available in environments that support it)
let analytics;
try {
  analytics = getAnalytics(app);
} catch (e) {
  // ignore in environments without analytics
}
const auth = getAuth(app);
const db = getFirestore(app);

// export both names to match possible existing imports
export { auth, auth as autenticacao, app, db };