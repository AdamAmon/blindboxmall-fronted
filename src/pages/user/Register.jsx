import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DEFAULT_AVATAR = 'https://avatars.githubusercontent.com/u/583231?v=4'; // 可换为其他默认头像

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [avatarError, setAvatarError] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (name === 'avatar') setAvatarError(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError('两次输入的密码不一致');
            return;
        }
        if (!formData.username || !formData.password || !formData.nickname) {
            setError('请填写必填字段');
            return;
        }
        setIsSubmitting(true);
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
            const errorMessage = error.response?.data?.message || error.message || '注册失败，请稍后再试';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative bg-gradient-to-br from-blue-400 via-purple-300 to-blue-200 overflow-hidden">
            <svg className="absolute inset-0 w-full h-full z-0" style={{pointerEvents:'none'}} xmlns="http://www.w3.org/2000/svg">
                <circle cx="20%" cy="20%" r="120" fill="#fff" fillOpacity="0.08" />
                <circle cx="80%" cy="30%" r="80" fill="#fff" fillOpacity="0.06" />
                <rect x="60%" y="70%" width="200" height="80" rx="40" fill="#fff" fillOpacity="0.07" />
                <g opacity="0.08">
                  <rect x="10%" y="60%" width="120" height="120" rx="30" fill="#fff" />
                  <circle cx="70%" cy="80%" r="60" fill="#fff" />
                </g>
            </svg>
            <div className="relative z-10 w-full flex items-center justify-center">
                <div className="bg-white/90 rounded-2xl shadow-2xl px-8 py-12 w-[420px] md:w-[480px] lg:w-[520px] flex flex-col items-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center w-full">用户注册</h2>
                    {error && (
                        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-center text-sm w-full">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4 w-full">
                        <div>
                            <label htmlFor="username" className="block text-gray-700 mb-1">用户名*</label>
                            <input id="username" type="text" name="username" placeholder="请输入用户名" value={formData.username} onChange={handleChange} className="w-full px-3 py-2 border rounded-md text-center" required />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-gray-700 mb-1">密码*</label>
                            <input id="password" type="password" name="password" placeholder="请输入密码" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border rounded-md text-center" required />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-gray-700 mb-1">确认密码*</label>
                            <input id="confirmPassword" type="password" name="confirmPassword" placeholder="请再次输入密码" value={formData.confirmPassword} onChange={handleChange} className="w-full px-3 py-2 border rounded-md text-center" required />
                        </div>
                        <div>
                            <label htmlFor="nickname" className="block text-gray-700 mb-1">昵称*</label>
                            <input id="nickname" type="text" name="nickname" placeholder="请输入昵称" value={formData.nickname} onChange={handleChange} className="w-full px-3 py-2 border rounded-md text-center" required />
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-gray-700 mb-1">角色*</label>
                            <select id="role" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 border rounded-md text-center">
                                <option value="customer">顾客</option>
                                <option value="seller">商家</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="avatar" className="block text-gray-700 mb-1">头像URL</label>
                            <input id="avatar" type="text" name="avatar" value={formData.avatar} onChange={handleChange} className="w-full px-3 py-2 border rounded-md text-center" placeholder="https://example.com/avatar.jpg" />
                            <div className="flex flex-col items-center mt-2">
                                <img
                                    src={avatarError || !formData.avatar ? DEFAULT_AVATAR : formData.avatar}
                                    alt="头像预览"
                                    className="w-20 h-20 rounded-full border object-cover bg-gray-100"
                                    onError={() => setAvatarError(true)}
                                    onLoad={() => setAvatarError(false)}
                                />
                                <span className="text-xs text-gray-400 mt-1">头像预览</span>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-gray-700 mb-1">邮箱</label>
                            <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border rounded-md text-center" placeholder="user@example.com" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-gray-700 mb-1">手机号</label>
                            <input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border rounded-md text-center" placeholder="13800138000" />
                        </div>
                        <button type="submit" disabled={isSubmitting} className={`w-full py-2 rounded-md transition text-lg font-semibold ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}>{isSubmitting ? '注册中...' : '注册'}</button>
                    </form>
                    <div className="mt-4 text-center w-full">
                        <span>已有账号? </span>
                        <a href="/login" className="text-blue-600 hover:underline" onClick={e => {e.preventDefault();navigate('/login');}}>立即登录</a>
                    </div>
                </div>
            </div>
        </div>
    );
}