import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check if token is expired
                if (decoded.exp * 1000 > Date.now()) {
                    setUser(decoded);
                } else {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                }
            } catch (e) {
                console.error("Invalid token", e);
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const response = await api.post('/token/', { username, password });
        const { access, refresh } = response.data;
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        const decoded = jwtDecode(access);
        setUser(decoded);
        return response;
    };

    const register = async (userData) => {
        return await api.post('/register/', userData);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
