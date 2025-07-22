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
import { ProtectedRoute, RedirectIfLoggedIn } from './routerGuards';
import Cart from '../pages/cart/Cart';
import OrderConfirm from '../pages/order/OrderConfirm';
import OrderList from '../pages/order/OrderList';
import OrderDetail from '../pages/order/OrderDetail';
import PrizeList from '../pages/user/PrizeList';
import PayResult from '../pages/order/PayResult';

// 将ProtectedRoute和RedirectIfLoggedIn移到src/router/routerGuards.js
// 这里只保留router对象的导出
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
                path: 'cart',
                element: (
                    <ProtectedRoute>
                        <Cart />
                    </ProtectedRoute>
                )
            },
            {
                path: 'order/confirm',
                element: (
                    <ProtectedRoute>
                        <OrderConfirm />
                    </ProtectedRoute>
                )
            },
            {
                path: 'order/list',
                element: (
                    <ProtectedRoute>
                        <OrderList />
                    </ProtectedRoute>
                )
            },
            {
                path: 'order/detail/:id',
                element: (
                    <ProtectedRoute>
                        <OrderDetail />
                    </ProtectedRoute>
                )
            },
            {
                path: 'order/payresult',
                element: (
                    <ProtectedRoute>
                        <PayResult />
                    </ProtectedRoute>
                )
            },
            {
                path: 'prizes',
                element: (
                    <ProtectedRoute>
                        <PrizeList />
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