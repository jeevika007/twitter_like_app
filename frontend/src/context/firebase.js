import { initializeApp } from "firebase/app";
import { getAuth,onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyC1UsxjORHhL9LfqNkl_wsTJ2rV3eDSvy0",
    authDomain: "twitter-clone-eb901.firebaseapp.com",
    projectId: "twitter-clone-eb901",
    storageBucket: "twitter-clone-eb901.appspot.com",
    messagingSenderId: "434624553161",
    appId: "1:434624553161:web:25fea1e9cf538e6ad8ad18"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('User is signed in:', user);
    } else {
        console.log('No user is signed in');
    }
});

export default app;