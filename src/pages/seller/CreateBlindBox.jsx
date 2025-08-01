import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import { toast } from 'react-toastify';

const CreateBlindBox = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        cover_image: '',
        stock: '',
        status: 1
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
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
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = '盲盒名称不能为空';
        }
        
        if (!formData.description.trim()) {
            newErrors.description = '盲盒描述不能为空';
        }
        
        if (!formData.price || formData.price <= 0) {
            newErrors.price = '请输入有效的价格';
        }
        
        if (!formData.cover_image.trim()) {
            newErrors.cover_image = '封面图片URL不能为空';
        }
        
        if (!formData.stock || formData.stock < 0) {
            newErrors.stock = '请输入有效的库存数量';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
            
            if (!user || !user.id) {
                toast.error('用户信息获取失败，请重新登录');
                return;
            }

            const response = await api.post('/api/blindbox', {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                status: parseInt(formData.status),
                seller_id: user.id  // 自动添加当前用户ID
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.code === 200) {
                toast.success('盲盒创建成功！');
                navigate('/seller/blindbox/manage');
            }
        } catch (error) {
            console.error('创建盲盒失败:', error);
            toast.error(error.response?.data?.message || '创建失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (window.confirm('确定要取消创建吗？未保存的内容将丢失。')) {
            navigate('/seller');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* 返回按钮 */}
                <button
                    onClick={() => navigate('/seller')}
                    className="flex items-center text-gray-600 hover:text-purple-600 mb-8 transition-colors duration-200 group"
                >
                    <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-medium">返回商家管理</span>
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mb-4">
                        <span className="text-3xl">📦</span>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
                        创建新盲盒
                    </h1>
                    <p className="text-base text-gray-600 max-w-2xl mx-auto">
                        填写盲盒信息，创建新的盲盒系列，为顾客带来惊喜体验
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-8 mb-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* 盲盒名称 */}
                        <div>
                            <label className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                <span className="mr-2">🎯</span>
                                盲盒名称 <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="请输入盲盒名称，如：星空系列、海洋奇遇..."
                                className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-lg ${
                                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-2 flex items-center">
                                <span className="mr-1">⚠️</span>
                                {errors.name}
                            </p>}
                        </div>

                        {/* 盲盒描述 */}
                        <div>
                            <label className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                <span className="mr-2">📝</span>
                                盲盒描述 <span className="text-red-500 ml-1">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="详细描述盲盒的内容、特色和亮点，吸引顾客购买..."
                                rows={4}
                                className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-lg resize-none ${
                                    errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-2 flex items-center">
                                <span className="mr-1">⚠️</span>
                                {errors.description}
                            </p>}
                        </div>

                        {/* 价格和库存 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                    <span className="mr-2">💰</span>
                                    价格 (元) <span className="text-red-500 ml-1">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">¥</span>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        className={`w-full pl-12 pr-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-lg ${
                                            errors.price ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    />
                                </div>
                                {errors.price && <p className="text-red-500 text-sm mt-2 flex items-center">
                                    <span className="mr-1">⚠️</span>
                                    {errors.price}
                                </p>}
                            </div>

                            <div>
                                <label className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                    <span className="mr-2">📦</span>
                                    库存数量 <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                    min="0"
                                    className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-lg ${
                                        errors.stock ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                />
                                {errors.stock && <p className="text-red-500 text-sm mt-2 flex items-center">
                                    <span className="mr-1">⚠️</span>
                                    {errors.stock}
                                </p>}
                            </div>
                        </div>

                        {/* 封面图片 */}
                        <div>
                            <label className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                <span className="mr-2">🖼️</span>
                                封面图片URL <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                                type="url"
                                name="cover_image"
                                value={formData.cover_image}
                                onChange={handleInputChange}
                                placeholder="https://example.com/image.jpg"
                                className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-lg ${
                                    errors.cover_image ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                            />
                            {errors.cover_image && <p className="text-red-500 text-sm mt-2 flex items-center">
                                <span className="mr-1">⚠️</span>
                                {errors.cover_image}
                            </p>}
                            
                            {/* 图片预览 */}
                            {formData.cover_image && (
                                <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
                                    <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                                        <span className="mr-2">👁️</span>
                                        图片预览
                                    </p>
                                    <div className="flex items-center space-x-4">
                                        <img
                                            src={formData.cover_image}
                                            alt="预览"
                                            className="w-24 h-24 object-cover rounded-xl border-2 border-white shadow-lg"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/96x96?text=图片加载失败';
                                            }}
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600">图片将作为盲盒的封面展示给顾客</p>
                                            <p className="text-xs text-gray-500 mt-1">建议尺寸：400x400px，格式：JPG/PNG</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 状态 */}
                        <div>
                            <label className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                <span className="mr-2">🔄</span>
                                上架状态
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-lg hover:border-gray-300"
                            >
                                <option value={1}>🚀 立即上架</option>
                                <option value={0}>⏸️ 暂不上架</option>
                            </select>
                        </div>

                        {/* 提交按钮 */}
                        <div className="flex justify-end space-x-6 pt-8 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-8 py-4 border-2 border-gray-300 rounded-2xl text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold text-lg"
                            >
                                取消
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-2xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-btn disabled:transform-none"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                        创建中...
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <span className="mr-2">✨</span>
                                        创建盲盒
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Tips */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-8">
                    <h3 className="text-xl font-bold text-blue-800 mb-6 flex items-center">
                        <span className="mr-3">💡</span>
                        创建提示
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <span className="mr-3 text-blue-500">🎯</span>
                                <div>
                                    <div className="font-semibold text-blue-800">盲盒名称</div>
                                    <div className="text-sm text-blue-700">简洁明了，便于顾客识别和记忆</div>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <span className="mr-3 text-blue-500">📝</span>
                                <div>
                                    <div className="font-semibold text-blue-800">详细描述</div>
                                    <div className="text-sm text-blue-700">介绍盲盒内容和特色，吸引顾客购买</div>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <span className="mr-3 text-blue-500">💰</span>
                                <div>
                                    <div className="font-semibold text-blue-800">合理定价</div>
                                    <div className="text-sm text-blue-700">考虑成本和市场接受度，设置合理价格</div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <span className="mr-3 text-blue-500">📦</span>
                                <div>
                                    <div className="font-semibold text-blue-800">库存管理</div>
                                    <div className="text-sm text-blue-700">根据预期销量设置合适的库存数量</div>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <span className="mr-3 text-blue-500">🖼️</span>
                                <div>
                                    <div className="font-semibold text-blue-800">高质量图片</div>
                                    <div className="text-sm text-blue-700">使用吸引人的封面图片提升购买欲望</div>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <span className="mr-3 text-blue-500">🎁</span>
                                <div>
                                    <div className="font-semibold text-blue-800">后续步骤</div>
                                    <div className="text-sm text-blue-700">创建完成后，记得添加盲盒商品并设置概率</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateBlindBox; 