import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import Login from '../pages/user/Login';
import Register from '../pages/user/Register';
import Profile from '../pages/user/Profile';
import BlindBoxList from '../pages/blindbox/BlindBoxList';
import BlindBoxDetail from '../pages/blindbox/BlindBoxDetail';
import SellerDashboard from '../pages/seller/SellerDashboard';
import CreateBlindBox from '../pages/seller/CreateBlindBox';
import ManageBlindBoxes from '../pages/seller/ManageBlindBoxes';
import ManageBoxItems from '../pages/seller/ManageBoxItems';
import CreateBoxItem from '../pages/seller/CreateBoxItem';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ErrorBoundary from '../components/ErrorBoundary';

// 路由守卫组件
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    const token = localStorage.getItem('token');

    if (!user || !token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // 根据用户角色重定向到相应页面
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

// 已登录用户重定向组件
const RedirectIfLoggedIn = ({ children }) => {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    const token = localStorage.getItem('token');

    if (user && token) {
        // 根据用户角色重定向到相应页面
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

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        errorElement: <ErrorBoundary />,
        children: [
            {
                index: true,
                element: <Navigate to="/login" replace />
            },
            {
                path: 'login',
                element: (
                    <RedirectIfLoggedIn>
                        <Login />
                    </RedirectIfLoggedIn>
                )
            },
            {
                path: 'register',
                element: (
                    <RedirectIfLoggedIn>
                        <Register />
                    </RedirectIfLoggedIn>
                )
            },
            {
                path: 'profile',
                element: (
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                )
            },
            {
                path: 'blindboxes',
                element: (
                    <ProtectedRoute>
                        <BlindBoxList />
                    </ProtectedRoute>
                )
            },
            {
                path: 'blindbox/:id',
                element: (
                    <ProtectedRoute>
                        <BlindBoxDetail />
                    </ProtectedRoute>
                )
            },
            {
                path: 'seller',
                element: (
                    <ProtectedRoute allowedRoles={['seller', 'admin']}>
                        <SellerDashboard />
                    </ProtectedRoute>
                )
            },
            {
                path: 'seller/blindbox/create',
                element: (
                    <ProtectedRoute allowedRoles={['seller', 'admin']}>
                        <CreateBlindBox />
                    </ProtectedRoute>
                )
            },
            {
                path: 'seller/blindbox/manage',
                element: (
                    <ProtectedRoute allowedRoles={['seller', 'admin']}>
                        <ManageBlindBoxes />
                    </ProtectedRoute>
                )
            },
            {
                path: 'seller/blindbox/:blindBoxId/items',
                element: (
                    <ProtectedRoute allowedRoles={['seller', 'admin']}>
                        <ManageBoxItems />
                    </ProtectedRoute>
                )
            },
            {
                path: 'seller/item/create',
                element: (
                    <ProtectedRoute allowedRoles={['seller', 'admin']}>
                        <CreateBoxItem />
                    </ProtectedRoute>
                )
            },

            {
                path: 'admin',
                element: (
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                )
            }
        ]
    }
]);

export default router;