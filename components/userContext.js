import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const bootstrapUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("@user");
        if (storedUser && isMounted) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.warn("Não foi possível carregar o usuário salvo:", error);
      }
    };

    bootstrapUser();

    const unsubscribe = onAuthStateChanged(auth, async (userFirebase) => {
      if (!isMounted) return;

      if (userFirebase) {
        let userData = {
          uid: userFirebase.uid,
          email: userFirebase.email || "",
        };

        try {
          const docRef = doc(db, "user", userFirebase.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            userData = { ...userData, ...docSnap.data() };
          }
        } catch (error) {
          console.warn("Falha ao buscar dados adicionais do usuário:", error);
        }

        setUser(userData);
        await AsyncStorage.setItem("@user", JSON.stringify(userData));
      } else {
        setUser(null);
        await AsyncStorage.removeItem("@user");
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};