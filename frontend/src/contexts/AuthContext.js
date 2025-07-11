import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(() => {
        return localStorage.getItem('authToken') || null;
    });

    // Helper: update user and persist to localStorage
    const updateUser = (newUser) => {
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    // Helper: update token and persist to localStorage
    const updateToken = (newToken) => {
        setToken(newToken);
        localStorage.setItem('authToken', newToken);
    };

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    const userData = await authService.getCurrentUser();
                    updateUser(userData);
                } catch (error) {
                    console.error('Auth initialization error:', error);
                    localStorage.removeItem('authToken');
                    setToken(null);
                    updateUser(null);
                }
            }
            setLoading(false);
        };

        initAuth();
        // eslint-disable-next-line
    }, [token]);

    const login = async (credentials) => {
        try {
            setLoading(true);
            const response = await authService.login(credentials);

            updateUser(response.user);
            updateToken(response.token);

            toast.success('Login successful!');
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            const message = error.response?.data?.error || 'Login failed';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setLoading(true);
            const response = await authService.register(userData);

            updateUser(response.user);
            updateToken(response.token);

            toast.success('Registration successful!');
            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            const message = error.response?.data?.error || 'Registration failed';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            updateUser(null);
            updateToken(null);
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
            toast.success('Logged out successfully');
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const updatedUser = await authService.updateProfile(profileData);
            updateUser(updatedUser);
            toast.success('Profile updated successfully');
            return { success: true };
        } catch (error) {
            console.error('Profile update error:', error);
            const message = error.response?.data?.error || 'Profile update failed';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const value = {
        user,
        setUser: updateUser,
        token,
        setToken: updateToken,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!token && !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};