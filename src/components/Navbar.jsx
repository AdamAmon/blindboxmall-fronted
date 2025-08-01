import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser, useToken, triggerUserStateChange } from '../hooks/useUser';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [avatarError, setAvatarError] = useState(false);
    
    // 使用自定义 Hook 获取用户信息和 token
    const user = useUser();
    const token = useToken();

    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // 触发用户状态变化事件，通知所有组件更新
        triggerUserStateChange();
        navigate('/login');
    }, [navigate]);

    const handleMenuToggle = useCallback(() => {
        setIsMenuOpen(prev => !prev);
    }, []);

    const handleNavigation = useCallback((path) => {
        navigate(path);
        setIsMenuOpen(false);
    }, [navigate]);

    const handleAvatarError = useCallback((e) => {
        setAvatarError(true);
        e.target.style.display = 'none'; // 隐藏失败的图片
    }, []);

    const getNavItems = useCallback(() => {
        if (!user) return [];
        
        switch (user.role) {
            case 'admin':
                return [
                    { name: '管理员面板', path: '/admin', icon: '🔒' },
                    { name: '盲盒管理', path: '/seller', icon: '📦' },
                    { name: '优惠券管理', path: '/coupon/manage', icon: '🎫' },
                    { name: '浏览盲盒', path: '/blindboxes', icon: '🎲' },
                    { name: '玩家秀', path: '/shows', icon: '🌟' },
                    { name: '购物车', path: '/cart', icon: '🛒' },
                    { name: '个人中心', path: '/profile', icon: '👤' }
                ];
            case 'seller':
                return [
                    { name: '商家管理', path: '/seller', icon: '🏪' },
                    { name: '创建盲盒', path: '/seller/blindbox/create', icon: '➕' },
                    { name: '管理盲盒', path: '/seller/blindbox/manage', icon: '📋' },
                    { name: '浏览盲盒', path: '/blindboxes', icon: '🎲' },
                    { name: '玩家秀', path: '/shows', icon: '🌟' },
                    { name: '购物车', path: '/cart', icon: '🛒' },
                    { name: '个人中心', path: '/profile', icon: '👤' }
                ];
            case 'customer':
            default:
                return [
                    { name: '盲盒商城', path: '/blindboxes', icon: '🎲' },
                    { name: '优惠券中心', path: '/coupon/center', icon: '🎫' },
                    { name: '我的优惠券', path: '/coupon/my', icon: '💳' },
                    { name: '玩家秀', path: '/shows', icon: '🌟' },
                    { name: '购物车', path: '/cart', icon: '🛒' },
                    { name: '个人中心', path: '/profile', icon: '👤' }
                ];
        }
    }, [user]);

    const navItems = getNavItems();

    // 获取头像显示内容
    const getAvatarDisplay = () => {
        if (avatarError || !user.avatar) {
            return (
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.nickname ? user.nickname.charAt(0).toUpperCase() : 'U'}
                </div>
            );
        }
        return (
            <img
                src={user.avatar}
                alt="用户头像"
                className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                onError={handleAvatarError}
            />
        );
    };

    // 未登录时显示品牌、登录、注册按钮
    if (!user || !token) {
        return (
            <nav className="bg-gradient-to-r from-primary to-secondary shadow-lg sticky top-0 z-50" data-testid="navbar">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
                    <div className="flex items-center">
                        <span className="text-3xl mr-3">🎁</span>
                        <span className="text-xl font-bold text-black font-brand drop-shadow-lg">盲盒商城</span>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => navigate('/login')}
                            className="px-6 py-2 bg-white text-primary rounded-full font-bold shadow-btn hover:shadow-lg transition-all duration-200 hover:scale-105"
                        >
                            登录
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="px-6 py-2 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-white hover:text-primary transition-all duration-200 hover:scale-105"
                        >
                            注册
                        </button>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="bg-gradient-to-r from-primary to-secondary shadow-lg sticky top-0 z-50" data-testid="navbar">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="text-3xl mr-3">🎁</span>
                            <span className="text-xl font-bold text-gray-800 font-brand drop-shadow-lg">盲盒商城</span>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-2">
                        {navItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                                    location.pathname === item.path
                                        ? 'bg-white text-primary shadow-lg scale-105'
                                        : 'text-white hover:bg-white hover:text-primary hover:shadow-lg hover:scale-105'
                                }`}
                            >
                                <span className="mr-2">{item.icon}</span>
                                {item.name}
                            </button>
                        ))}
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        {/* User Info */}
                        <div className="hidden md:flex items-center space-x-3">
                            {getAvatarDisplay()}
                            <div className="text-gray-800">
                                <div className="text-sm font-bold">{user.nickname}</div>
                                <div className="text-xs opacity-90">
                                    {user.role === 'admin' ? '管理员' : 
                                     user.role === 'seller' ? '商家' : '顾客'}
                                </div>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-btn hover:shadow-lg transition-all duration-200 hover:scale-105"
                        >
                            退出登录
                        </button>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                onClick={handleMenuToggle}
                                className="text-white hover:text-gray-200 focus:outline-none p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-4 pt-4 pb-6 space-y-2 bg-white rounded-t-3xl shadow-card mt-2">
                            {navItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => handleNavigation(item.path)}
                                    className={`block w-full text-left px-4 py-3 rounded-xl text-base font-bold transition-all duration-200 ${
                                        location.pathname === item.path
                                            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                                            : 'text-gray-700 hover:bg-gray-100 hover:scale-105'
                                    }`}
                                >
                                    <span className="mr-3">{item.icon}</span>
                                    {item.name}
                                </button>
                            ))}
                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <div className="flex items-center px-4 py-3">
                                    {getAvatarDisplay()}
                                    <div className="flex-1 ml-3">
                                        <div className="text-sm font-bold text-gray-700">{user.nickname}</div>
                                        <div className="text-xs text-gray-500">
                                            {user.role === 'admin' ? '管理员' : 
                                             user.role === 'seller' ? '商家' : '顾客'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
