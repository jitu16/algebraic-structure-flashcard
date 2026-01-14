/* src/firebase.ts */
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAIyve7JZp_0E3MNutgFkX0cAm9DqzfqC4",
  authDomain: "algebraic-structure-explorer.firebaseapp.com",
  projectId: "algebraic-structure-explorer",
  storageBucket: "algebraic-structure-explorer.firebasestorage.app",
  messagingSenderId: "195740710356",
  appId: "1:195740710356:web:132e427e9790fdc2705241",
  measurementId: "G-J5YLN1TFLL"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
