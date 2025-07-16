import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // 添加提交状态
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // 验证密码是否匹配
        if (formData.password !== formData.confirmPassword) {
            setError('两次输入的密码不一致');
            return;
        }

        // 添加表单验证
        if (!formData.username || !formData.password || !formData.nickname) {
            setError('请填写必填字段');
            return;
        }

        setIsSubmitting(true); // 开始提交

        try {
            const response = await axios.post('/api/auth/register', {
                username: formData.username,
                password: formData.password,
                nickname: formData.nickname,
                avatar: formData.avatar,
                email: formData.email,
                phone: formData.phone,
                role: formData.role
            });

            if (response.data.code === 200) {
                navigate('/login');
            } else {
                setError(response.data.message || '注册失败，请重试');
            }
        } catch (error) {
            console.error('注册失败:', error);
            // 改进错误处理
            const errorMessage = error.response?.data?.message ||
                error.message ||
                '注册失败，请稍后再试';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false); // 结束提交
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">用户注册</h2>

            {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* 用户名 */}
                <div>
                    <label htmlFor="username" className="block text-gray-700 mb-1">
                        用户名*
                    </label>
                    <input
                        id="username"
                        type="text"
                        name="username"
                        placeholder="请输入用户名"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    />
                </div>

                {/* 密码 */}
                <div>
                    <label htmlFor="password" className="block text-gray-700 mb-1">
                        密码*
                    </label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        placeholder="请输入密码"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    />
                </div>

                {/* 确认密码 */}
                <div>
                    <label htmlFor="confirmPassword" className="block text-gray-700 mb-1">
                        确认密码*
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        name="confirmPassword"
                        placeholder="请再次输入密码"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    />
                </div>

                {/* 昵称 */}
                <div>
                    <label htmlFor="nickname" className="block text-gray-700 mb-1">
                        昵称*
                    </label>
                    <input
                        id="nickname"
                        type="text"
                        name="nickname"
                        placeholder="请输入昵称"
                        value={formData.nickname}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="role" className="block text-gray-700 mb-1">角色*</label>
                    <select
                        id="role"
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md"
                    >
                        <option value="customer">顾客</option>
                        <option value="seller">商家</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="avatar" className="block text-gray-700 mb-1">头像URL</label>
                    <input
                        id="avatar"
                        type="text"
                        value={formData.avatar}
                        onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="https://example.com/avatar.jpg"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-gray-700 mb-1">邮箱</label>
                    <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="user@example.com"
                    />
                </div>

                <div>
                    <label htmlFor="phone" className="block text-gray-700 mb-1">手机号</label>
                    <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="13800138000"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-2 rounded-md transition ${
                        isSubmitting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                >
                    {isSubmitting ? '注册中...' : '注册'}
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