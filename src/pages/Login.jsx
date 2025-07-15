//:src/pages/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/auth/login', credentials);
            if (response.data.code === 200) {
                // 存储token和用户信息
                localStorage.setItem('token', response.data.result.token);
                localStorage.setItem('user', JSON.stringify(response.data.result.user));

                // 跳转到首页
                navigate('/');
            }
        } catch (error) {
            console.error('登录失败:', error.response?.data);
            alert(error.response?.data?.message || '登录失败');
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">用户登录</h2>
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-gray-700 mb-1">用户名</label>
                    <input
                        type="text"
                        placeholder="请输入用户名"
                        value={credentials.username}
                        onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 mb-1">密码</label>
                    <input
                        type="password"
                        placeholder="请输入密码"
                        value={credentials.password}
                        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
                >
                    登录
                </button>
            </form>

            <div className="mt-4 text-center">
                <span>没有账号? </span>
                <a
                    href="/register"
                    className="text-blue-600 hover:underline"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate('/register');
                    }}
                >
                    立即注册
                </a>
            </div>
        </div>
    );
}