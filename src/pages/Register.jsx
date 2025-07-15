//:src/pages/Register.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


export default function Register() {
    const [form, setForm] = useState({
        username: '',
        password: '',
        nickname: '',
        avatar: '',
        email: '',
        phone: '',
        role: 'customer'
    });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 使用代理后的API地址
            const response = await axios.post('/api/auth/register', form);
            if (response.data.code === 200) {
                navigate('/login');
            }
        } catch (error) {
            console.error('注册失败:', error.response?.data);
            alert(error.response?.data?.message || '注册失败');
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">用户注册</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 mb-1">用户名*</label>
                    <input
                        type="text"
                        value={form.username}
                        onChange={(e) => setForm({...form, username: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="3-50个字符"
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 mb-1">密码*</label>
                    <input
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({...form, password: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="至少6位"
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 mb-1">昵称*</label>
                    <input
                        type="text"
                        value={form.nickname}
                        onChange={(e) => setForm({...form, nickname: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="2-50个字符"
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 mb-1">角色*</label>
                    <select
                        value={form.role}
                        onChange={(e) => setForm({...form, role: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md"
                    >
                        <option value="customer">顾客</option>
                        <option value="seller">商家</option>
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700 mb-1">头像URL</label>
                    <input
                        type="text"
                        value={form.avatar}
                        onChange={(e) => setForm({...form, avatar: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="https://example.com/avatar.jpg"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 mb-1">邮箱</label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({...form, email: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="user@example.com"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 mb-1">手机号</label>
                    <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({...form, phone: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="13800138000"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                >
                    注册
                </button>
            </form>

            <div className="mt-4 text-center">
                <span>已有账号? </span>
                <a
                    href="/login"
                    className="text-blue-600 hover:underline"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate('/login');
                    }}
                >
                    立即登录
                </a>
            </div>
        </div>
    );
}
