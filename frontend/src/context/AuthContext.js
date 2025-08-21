import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch user profile data
    const fetchUserProfile = async () => {
        try {
            const userData = await authService.getCurrentUser();
            setUser(prevUser => ({ ...prevUser, ...userData }));
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            // If we can't fetch the profile, the token might be invalid
            logout();
        }
    };

    // Check if user is logged in on app start
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setUser({ token });
            fetchUserProfile();
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            setError(null);
            setLoading(true);
            const response = await authService.login(credentials);
            setUser(response);
            // Fetch user profile after successful login
            await fetchUserProfile();
            return response;
        } catch (error) {
            setError(error.message || 'Login failed');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signup = async (userData) => {
        try {
            setError(null);
            setLoading(true);
            const response = await authService.signup(userData);
            // Note: After signup, user is NOT automatically logged in
            // They need to verify their email first
            return response;
        } catch (error) {
            setError(error.message || 'Signup failed');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (profileData) => {
        try {
            setError(null);
            setLoading(true);
            const response = await authService.updateProfile(profileData);
            setUser(prevUser => ({ ...prevUser, ...response }));
            return response;
        } catch (error) {
            setError(error.message || 'Profile update failed');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        try {
            authService.logout();
            setUser(null);
            setError(null);
        } catch (error) {
            setError('Logout failed');
        }
    };

    const clearError = () => {
        setError(null);
    };

    const value = {
        user,
        loading,
        error,
        login,
        signup,
        logout,
        clearError,
        updateProfile,
        userProfile: user,
        isAuthenticated: !!user
    };

    return React.createElement(
        AuthContext.Provider,
        { value: value },
        children
    );
};