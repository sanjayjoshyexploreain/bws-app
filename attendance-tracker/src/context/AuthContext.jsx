import React, { createContext, useContext, useState, useEffect } from "react";
import { Api } from "../api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem("attendanceAppState");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {
          isAuthenticated: false,
          role: null,
          employeeId: "",
          employeeName: "",
          employeeSpId: null,
          companyName: "",
          clientCompany: "",
          profession: "",
          loginTimestamp: null
        };
      }
    }
    return {
      isAuthenticated: false,
      role: null,
      employeeId: "",
      employeeName: "",
      employeeSpId: null,
      companyName: "",
      clientCompany: "",
      profession: "",
      loginTimestamp: null
    };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const SESSION_TIMEOUT = 60 * 60 * 1000 // 1 hour in ms
    
    const checkSession = () => {
      const saved = localStorage.getItem('attendanceAppState')
      if (!saved) return
      
      try {
        const parsed = JSON.parse(saved)
        
        if (!parsed.isAuthenticated) return
        if (!parsed.loginTimestamp) {
          // No timestamp — old session, force logout
          localStorage.removeItem('attendanceAppState')
          setState({
            isAuthenticated: false,
            role: null,
            employeeId: '',
            employeeName: '',
            employeeSpId: null,
            companyName: '',
            clientCompany: '',
            profession: '',
            loginTimestamp: null
          })
          return
        }
        
        const elapsed = Date.now() - parsed.loginTimestamp
        if (elapsed > SESSION_TIMEOUT) {
          // Session expired — force logout
          localStorage.removeItem('attendanceAppState')
          setState({
            isAuthenticated: false,
            role: null,
            employeeId: '',
            employeeName: '',
            employeeSpId: null,
            companyName: '',
            clientCompany: '',
            profession: '',
            loginTimestamp: null
          })
        }
      } catch {
        localStorage.removeItem('attendanceAppState')
      }
    }
    
    // Check immediately on load
    checkSession()
    
    // Check every minute while app is open
    const interval = setInterval(checkSession, 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    localStorage.setItem("attendanceAppState", JSON.stringify(state));
  }, [state]);

  const login = async (employeeId, pin) => {
    setIsLoading(true);
    setError(null);
    try {
      // We remove the hardcoded admin bypass because we now use the API.

      const res = await Api.login(employeeId, pin);

      if (!res.success) {
        throw new Error(res.message || 'Invalid credentials');
      }

      const isManagerOrAdmin = employeeId === pin || res.role === 'Admin' || res.role === 'Manager' || res.employeeName?.includes('Admin') || res.employeeName?.includes('Manager');

      setState({
        isAuthenticated: true,
        role: isManagerOrAdmin ? 'Admin' : 'Worker',
        employeeId: res.employeeId,
        employeeName: res.employeeName,
        employeeSpId: res.spId,
        companyName: res.companyName || '',
        clientCompany: res.clientCompany || '',
        profession: res.profession || '',
        loginTimestamp: Date.now()
      });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("attendanceAppState");
    setState({
      isAuthenticated: false,
      role: null,
      employeeId: "",
      employeeName: "",
      employeeSpId: null,
      companyName: "",
      clientCompany: "",
      profession: "",
      loginTimestamp: null
    });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
