import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import reactLogo from '../../assets/react.svg';

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
            const response = await axios.post('/api/auth/login', credentials);
            if (response.data.success === true) {
                localStorage.setItem('token', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
                
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
        <div className="min-h-screen w-full flex items-center justify-center relative bg-gradient-to-br from-green-100 to-blue-200">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
                <div className="flex flex-col items-center mb-8">
                    <img src={reactLogo} alt="盲盒商城Logo" className="w-16 h-16 mb-2" />
                    <h1 className="text-3xl font-extrabold text-gray-800 mb-1">欢迎登录盲盒商城</h1>
                    <p className="text-gray-500">开启你的潮玩惊喜之旅</p>
                </div>
                {error && (
                    <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-center text-sm">
                        {error}
                    </div>
                )}
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-gray-700 mb-1 font-medium">
                            用户名
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            </span>
                            <input
                                id="username"
                                type="text"
                                autoComplete="username"
                                placeholder="请输入用户名"
                                value={credentials.username}
                                onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                                className="w-full px-10 py-2 border rounded-md focus:ring-2 focus:ring-green-400 focus:outline-none"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-gray-700 mb-1 font-medium">
                            密码
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="8" rx="4"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            </span>
                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                placeholder="请输入密码"
                                value={credentials.password}
                                onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                                className="w-full px-10 py-2 border rounded-md focus:ring-2 focus:ring-green-400 focus:outline-none"
                                required
                                disabled={loading}
                                onKeyDown={e => { if (e.key === 'Enter') handleLogin(e); }}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className={`w-full py-2 rounded-md font-semibold transition text-lg ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                        disabled={loading}
                    >
                        {loading ? '登录中...' : '登录'}
                    </button>
                </form>
                <div className="mt-6 text-center text-gray-600">
                    <span>没有账号？</span>
                    <button
                        className="ml-1 text-blue-600 hover:underline font-medium"
                        onClick={() => navigate('/register')}
                        disabled={loading}
                    >
                        立即注册
                    </button>
                </div>
            </div>
        </div>
    );
}