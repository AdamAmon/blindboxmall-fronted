import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import reactLogo from '../../assets/react.svg';
import { triggerUserStateChange } from '../../hooks/useUser';

export default function Login() {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        // 登录前清理旧token，防止带上无效token导致401
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(true);
        try {
            const response = await api.post('/api/auth/login', credentials);
            if (response.data.success === true) {
                localStorage.setItem('token', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
                
                // 触发用户状态变化事件，通知所有组件更新
                triggerUserStateChange();
                
                // 根据用户角色跳转到相应页面
                const user = response.data.data.user;
                switch (user.role) {
                    case 'admin':
                        navigate('/admin');
                        break;
                    case 'seller':
                        navigate('/seller');
                        break;
                    case 'customer':
                    default:
                        navigate('/blindboxes');
                        break;
                }
            } else {
                setError(response.data.message || '登录失败');
            }
        } catch (error) {
            console.error('登录失败:', error.response?.data);
            const errorMsg = error.response?.data?.message || '登录失败';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
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

            {/* 登录卡片 - 居中显示 */}
            <div className="relative z-10 w-full max-w-md mx-auto px-8">
                {/* 品牌区域 */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl shadow-2xl mb-8">
                        <img src={reactLogo} alt="Logo" className="w-14 h-14" />
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
                        盲盒商城
                    </h1>
                    <div className="flex items-center justify-center space-x-3 text-gray-600 mb-4">
                        <div className="w-12 h-px bg-gradient-to-r from-transparent to-gray-300"></div>
                        <span className="text-base font-medium">欢迎回来</span>
                        <div className="w-12 h-px bg-gradient-to-l from-transparent to-gray-300"></div>
                    </div>
                    <p className="text-gray-500 text-lg">登录您的账户，开启盲盒探索之旅</p>
                </div>

                {/* 登录表单卡片 */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-10">
                    {/* 错误提示 */}
                    {error && (
                        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700 font-medium">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 登录表单 */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-3">
                                用户名
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
                                    autoComplete="username"
                                    placeholder="请输入您的用户名"
                                    value={credentials.username}
                                    onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                                    className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                                密码
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    placeholder="请输入您的密码"
                                    value={credentials.password}
                                    onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                                    className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                                    required
                                    disabled={loading}
                                    onKeyDown={e => { if (e.key === 'Enter') handleLogin(e); }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl text-base font-semibold text-white transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-purple-500/20 ${
                                loading 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                            }`}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    登录中...
                                </div>
                            ) : (
                                '立即登录'
                            )}
                        </button>
                    </form>

                    {/* 注册链接 */}
                    <div className="mt-8 text-center">
                        <div className="flex items-center justify-center space-x-2 text-gray-600 mb-4">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-300"></div>
                            <span className="text-sm">还没有账户？</span>
                            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-300"></div>
                        </div>
                        <button
                            className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold transition-colors group"
                            onClick={() => navigate('/register')}
                            disabled={loading}
                        >
                            立即注册
                            <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* 底部装饰 */}
                <div className="mt-8 text-center">
                    <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                        <span>安全登录</span>
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        <span>隐私保护</span>
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        <span>7×24小时服务</span>
                    </div>
                </div>
            </div>
        </div>
    );
}