import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
                alert('用户信息获取失败，请重新登录');
                return;
            }

            const response = await axios.post('http://localhost:7001/api/blindbox', {
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
                alert('盲盒创建成功！');
                navigate('/seller/blindbox/manage');
            }
        } catch (error) {
            console.error('创建盲盒失败:', error);
            alert(error.response?.data?.message || '创建失败，请重试');
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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/seller')}
                        className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        返回商家管理
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">创建新盲盒</h1>
                    <p className="text-gray-600 mt-2">填写盲盒信息，创建新的盲盒系列</p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow-md p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 盲盒名称 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                盲盒名称 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="请输入盲盒名称"
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        {/* 盲盒描述 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                盲盒描述 <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="请输入盲盒描述"
                                rows={4}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errors.description ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>

                        {/* 价格和库存 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    价格 (元) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                        errors.price ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    库存数量 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                    min="0"
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                        errors.stock ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
                            </div>
                        </div>

                        {/* 封面图片 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                封面图片URL <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="url"
                                name="cover_image"
                                value={formData.cover_image}
                                onChange={handleInputChange}
                                placeholder="https://example.com/image.jpg"
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errors.cover_image ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.cover_image && <p className="text-red-500 text-sm mt-1">{errors.cover_image}</p>}
                            
                            {/* 图片预览 */}
                            {formData.cover_image && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-600 mb-2">图片预览:</p>
                                    <img
                                        src={formData.cover_image}
                                        alt="预览"
                                        className="w-32 h-32 object-cover rounded-lg border"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/128x128?text=图片加载失败';
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* 状态 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                上架状态
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value={1}>立即上架</option>
                                <option value={0}>暂不上架</option>
                            </select>
                        </div>

                        {/* 提交按钮 */}
                        <div className="flex justify-end space-x-4 pt-6 border-t">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                取消
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
                            >
                                {loading ? '创建中...' : '创建盲盒'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Tips */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 创建提示</h3>
                    <ul className="text-blue-700 space-y-2">
                        <li>• 盲盒名称应该简洁明了，便于顾客识别</li>
                        <li>• 描述应该详细介绍盲盒的内容和特色</li>
                        <li>• 价格设置要合理，考虑成本和市场接受度</li>
                        <li>• 库存数量建议根据预期销量设置</li>
                        <li>• 封面图片建议使用高质量、吸引人的图片</li>
                        <li>• 创建完成后，记得添加盲盒商品并设置概率</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CreateBlindBox; 