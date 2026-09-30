import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Api } from "../api/api";
import { View, ActivityIndicator, AppState } from 'react-native';

const AuthContext = createContext(null);

const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour

const DEFAULT_STATE = {
  isAuthenticated: false,
  role: null,
  employeeId: "",
  employeeName: "",
  employeeSpId: null,
  companyName: "",
  clientCompany: "",
  profession: "",
  loginTimestamp: null,
};

export function AuthProvider({ children }) {
  const [state, setState] = useState(DEFAULT_STATE);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const appStateRef = useRef(AppState.currentState);

  // Load persisted auth state on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const saved = await AsyncStorage.getItem("attendanceAppState");
        if (saved) {
          const parsed = JSON.parse(saved);
          // Check session timeout immediately on load
          if (parsed.loginTimestamp && Date.now() - parsed.loginTimestamp > SESSION_TIMEOUT_MS) {
            // Session expired — clear it
            await AsyncStorage.removeItem("attendanceAppState");
          } else {
            setState(parsed);
          }
        }
      } catch (e) {
        console.error("Failed to load auth state", e);
      } finally {
        setIsInitializing(false);
      }
    };
    loadState();
  }, []);

  // Check session timeout when app comes back to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App just came to foreground — check if session expired
        const saved = await AsyncStorage.getItem("attendanceAppState");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.loginTimestamp && Date.now() - parsed.loginTimestamp > SESSION_TIMEOUT_MS) {
            await AsyncStorage.removeItem("attendanceAppState");
            setState(DEFAULT_STATE);
          }
        }
      }
      appStateRef.current = nextAppState;
    });
    return () => subscription.remove();
  }, []);

  const saveState = async (newState) => {
    setState(newState);
    try {
      await AsyncStorage.setItem("attendanceAppState", JSON.stringify(newState));
    } catch (e) {
      console.error("Failed to save auth state", e);
    }
  };

  const login = async (employeeId, pin) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await Api.login(employeeId, pin);

      if (!res.success) {
        throw new Error(res.message || 'Invalid credentials');
      }

      const isManagerOrAdmin =
        res.role === 'Admin' ||
        res.role === 'Manager' ||
        res.employeeName?.includes('Admin') ||
        res.employeeName?.includes('Manager');

      await saveState({
        isAuthenticated: true,
        token: res.token,
        role: res.role || (isManagerOrAdmin ? 'Admin' : 'Worker'),
        employeeId: res.employeeId || '',
        employeeName: res.employeeName || '',
        employeeSpId: res.spId || null,
        companyName: res.companyName || '',
        clientCompany: res.clientCompany || '',
        profession: res.profession || '',
        loginTimestamp: Date.now(),
      });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("attendanceAppState");
    } catch (e) {}
    setState(DEFAULT_STATE);
  };

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#051424' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ state, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
