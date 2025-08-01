import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import { toast } from 'react-toastify';
import reactLogo from '../../assets/react.svg';

const DEFAULT_AVATAR = 'https://avatars.githubusercontent.com/u/583231?v=4';

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        nickname: '',
        avatar: '',
        email: '',
        phone: '',
        role: 'customer'
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [avatarError, setAvatarError] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    // 表单验证
    const validateForm = () => {
        const newErrors = {};

        // 用户名验证
        if (!formData.username.trim()) {
            newErrors.username = '用户名不能为空';
        } else if (formData.username.length < 3) {
            newErrors.username = '用户名至少3个字符';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = '用户名只能包含字母、数字和下划线';
        }

        // 密码验证
        if (!formData.password) {
            newErrors.password = '密码不能为空';
        } else if (formData.password.length < 6) {
            newErrors.password = '密码至少6个字符';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = '密码必须包含大小写字母和数字';
        }

        // 确认密码验证
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = '请确认密码';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = '两次输入的密码不一致';
        }

        // 昵称验证
        if (!formData.nickname.trim()) {
            newErrors.nickname = '昵称不能为空';
        } else if (formData.nickname.length < 2) {
            newErrors.nickname = '昵称至少2个字符';
        }

        // 邮箱验证
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = '请输入有效的邮箱地址';
        }

        // 手机号验证
        if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) {
            newErrors.phone = '请输入有效的手机号';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // 清除对应字段的错误
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        
        if (name === 'avatar') setAvatarError(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await api.post('/api/auth/register', {
                username: formData.username,
                password: formData.password,
                nickname: formData.nickname,
                avatar: formData.avatar || DEFAULT_AVATAR,
                email: formData.email,
                phone: formData.phone,
                role: formData.role
            });
            
            if (response.data.success) {
                toast.success('注册成功！请登录您的账户');
                navigate('/login');
            } else {
                toast.error(response.data.message || '注册失败，请重试');
            }
        } catch (error) {
            console.error('注册失败:', error);
            const errorMessage = error.response?.data?.message || error.message || '注册失败，请稍后再试';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getAvatarDisplay = (avatar, nickname) => {
        if (avatarError || !avatar) {
            return (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                    {nickname?.charAt(0) || 'U'}
                </div>
            );
        }
        return (
            <img
                src={avatar}
                alt="头像"
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                onError={() => setAvatarError(true)}
                onLoad={() => setAvatarError(false)}
            />
        );
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
            {/* 背景装饰 */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-600/5 via-transparent to-blue-600/5"></div>
                <div className="absolute top-20 left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
            </div>

            {/* 注册卡片 - 居中显示 */}
            <div className="relative z-10 w-full max-w-2xl mx-auto px-8">
                {/* 品牌区域 */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-xl mb-6">
                        <img src={reactLogo} alt="Logo" className="w-12 h-12" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
                        盲盒商城
                    </h1>
                    <div className="flex items-center justify-center space-x-3 text-gray-600 mb-3">
                        <div className="w-12 h-px bg-gradient-to-r from-transparent to-gray-300"></div>
                        <span className="text-base font-medium">创建账户</span>
                        <div className="w-12 h-px bg-gradient-to-l from-transparent to-gray-300"></div>
                    </div>
                    <p className="text-gray-500">加入我们，开启您的盲盒探索之旅</p>
                </div>

                {/* 注册表单卡片 */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 基本信息区域 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* 用户名 */}
                            <div>
                                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                                    用户名 <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="username"
                                        type="text"
                                        name="username"
                                        placeholder="请输入用户名"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className={`block w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 bg-white/70 backdrop-blur-sm ${
                                            errors.username ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
                                        }`}
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                                {errors.username && (
                                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                                )}
                            </div>

                            {/* 昵称 */}
                            <div>
                                <label htmlFor="nickname" className="block text-sm font-semibold text-gray-700 mb-2">
                                    昵称 <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="nickname"
                                        type="text"
                                        name="nickname"
                                        placeholder="请输入昵称"
                                        value={formData.nickname}
                                        onChange={handleChange}
                                        className={`block w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 bg-white/70 backdrop-blur-sm ${
                                            errors.nickname ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
                                        }`}
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                                {errors.nickname && (
                                    <p className="mt-1 text-sm text-red-600">{errors.nickname}</p>
                                )}
                            </div>
                        </div>

                        {/* 密码区域 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* 密码 */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                    密码 <span className="text-red-500">*</span>
                                </label>
                                {/* 密码输入框 */}
                                <div className="relative group">
                                    {/* 左侧图标+可见性按钮 */}
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 left-0 pl-4 flex items-center bg-transparent border-none outline-none z-10"
                                        tabIndex={-1}
                                        onClick={e => { e.preventDefault(); setShowPassword(s => !s); }}
                                        style={{ background: 'none' }}
                                    >
                                        {showPassword ? (
                                            <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        )}
                                    </button>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="请输入密码"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`block w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 bg-white/70 backdrop-blur-sm ${
                                            errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
                                        }`}
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            {/* 确认密码 */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                    确认密码 <span className="text-red-500">*</span>
                                </label>
                                {/* 确认密码输入框 */}
                                <div className="relative group">
                                    {/* 左侧图标+可见性按钮 */}
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 left-0 pl-4 flex items-center bg-transparent border-none outline-none z-10"
                                        tabIndex={-1}
                                        onClick={e => { e.preventDefault(); setShowConfirmPassword(s => !s); }}
                                        style={{ background: 'none' }}
                                    >
                                        {showConfirmPassword ? (
                                            <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )}
                                    </button>
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        placeholder="请再次输入密码"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`block w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 bg-white/70 backdrop-blur-sm ${
                                            errors.confirmPassword ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
                                        }`}
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                                )}
                            </div>
                        </div>

                        {/* 联系信息区域 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* 邮箱 */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                    邮箱
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        placeholder="user@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`block w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 bg-white/70 backdrop-blur-sm ${
                                            errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
                                        }`}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {/* 手机号 */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                                    手机号
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        placeholder="13800138000"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={`block w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 bg-white/70 backdrop-blur-sm ${
                                            errors.phone ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
                                        }`}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                {errors.phone && (
                                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                )}
                            </div>
                        </div>

                        {/* 角色和头像区域 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* 角色选择 */}
                            <div>
                                <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                                    角色 <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <select
                                        id="role"
                                        value={formData.role}
                                        onChange={e => setFormData({...formData, role: e.target.value})}
                                        className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                                        disabled={isSubmitting}
                                    >
                                        <option value="customer">顾客</option>
                                        <option value="seller">商家</option>
                                    </select>
                                </div>
                            </div>

                            {/* 头像预览 */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    头像预览
                                </label>
                                <div className="flex items-center space-x-4">
                                    {getAvatarDisplay(formData.avatar, formData.nickname)}
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            name="avatar"
                                            placeholder="头像URL（可选）"
                                            value={formData.avatar}
                                            onChange={handleChange}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                                            disabled={isSubmitting}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">留空将使用默认头像</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 注册按钮 */}
                        <button
                            type="submit"
                            className={`w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl text-base font-semibold text-white transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-purple-500/20 ${
                                isSubmitting 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                            }`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    注册中...
                                </div>
                            ) : (
                                '立即注册'
                            )}
                        </button>
                    </form>

                    {/* 登录链接 */}
                    <div className="mt-8 text-center">
                        <div className="flex items-center justify-center space-x-2 text-gray-600 mb-4">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-300"></div>
                            <span className="text-sm">已有账户？</span>
                            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-300"></div>
                        </div>
                        <button
                            className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold transition-colors group"
                            onClick={() => navigate('/login')}
                            disabled={isSubmitting}
                        >
                            立即登录
                            <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* 底部装饰 */}
                <div className="mt-8 text-center">
                    <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                        <span>安全注册</span>
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        <span>隐私保护</span>
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        <span>快速体验</span>
                    </div>
                </div>
            </div>
        </div>
    );
}