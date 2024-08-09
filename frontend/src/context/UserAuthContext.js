// src/context/UserAuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    
} from "firebase/auth";
import { auth } from "./firebase"; // Ensure the path is correct
const userAuthContext = createContext();

export function UserAuthContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [followers, setFollowers] = useState([]);
    const [postCount, setPostCount] = useState(0);

    function logIn(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }
    function signUp(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }
    function logOut() {
        return signOut(auth);
    }
    function googleSignIn() {
        const googleAuthProvider = new GoogleAuthProvider();
        return signInWithPopup(auth, googleAuthProvider);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log("Auth", currentUser);
            setUser(currentUser);
            // Fetch user followers and set state
            // setFollowers(fetchUserFollowers(currentUser.uid)); // Implement this function as needed
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const canPost = () => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        if (followers.length === 0) {
            if (hours === 10 && minutes >= 0 && minutes <= 30 && postCount < 1) {
                return true;
            }
            return false;
        } else if (followers.length < 10) {
            return postCount < 2;
        } else {
            return true;
        }
    };

    const incrementPostCount = () => {
        setPostCount(postCount + 1);
    };

    return (
        <userAuthContext.Provider
            value={{ user, logIn, signUp, logOut, googleSignIn, followers, setFollowers, canPost, incrementPostCount }}
        >
            {children}
        </userAuthContext.Provider>
    );
}

export function useUserAuth() {
    return useContext(userAuthContext);
}
