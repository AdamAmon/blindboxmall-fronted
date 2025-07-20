import React from 'react';
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    const token = localStorage.getItem('token');

    if (!user || !token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        switch (user.role) {
            case 'admin':
                return <Navigate to="/admin" replace />;
            case 'seller':
                return <Navigate to="/seller" replace />;
            case 'customer':
            default:
                return <Navigate to="/blindboxes" replace />;
        }
    }

    return children;
};

export const RedirectIfLoggedIn = ({ children }) => {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    const token = localStorage.getItem('token');

    if (user && token) {
        switch (user.role) {
            case 'admin':
                return <Navigate to="/admin" replace />;
            case 'seller':
                return <Navigate to="/seller" replace />;
            case 'customer':
            default:
                return <Navigate to="/blindboxes" replace />;
        }
    }

    return children;
};