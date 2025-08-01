import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import { toast } from 'react-toastify';

const CreateBoxItem = () => {
    const navigate = useNavigate();
    const [blindBoxes, setBlindBoxes] = useState([]);
    const [formData, setFormData] = useState({
        blind_box_id: '',
        name: '',
        image: '',
        rarity: 1,
        probability: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchBlindBoxes();
    }, []);

    const fetchBlindBoxes = async () => {
        try {
            const response = await api.get('/api/blindbox', {
                params: { limit: 100 },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.code === 200) {
                setBlindBoxes(response.data.data.list);
            }
        } catch (error) {
            console.error('获取盲盒列表失败:', error);
        }
    };

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
        
        if (!formData.blind_box_id) {
            newErrors.blind_box_id = '请选择盲盒';
        }
        
        if (!formData.name.trim()) {
            newErrors.name = '商品名称不能为空';
        }
        
        if (!formData.image.trim()) {
            newErrors.image = '商品图片URL不能为空';
        }
        
        if (!formData.probability || formData.probability <= 0 || formData.probability > 1) {
            newErrors.probability = '请输入有效的概率 (0-1之间)';
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
            const response = await api.post('/api/blindbox/items', {
                ...formData,
                blind_box_id: parseInt(formData.blind_box_id),
                rarity: parseInt(formData.rarity),
                probability: parseFloat(formData.probability)
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.code === 200) {
                toast.success('商品添加成功！');
                // 重置表单
                setFormData({
                    blind_box_id: formData.blind_box_id, // 保持当前盲盒选择
                    name: '',
                    image: '',
                    rarity: 1,
                    probability: ''
                });
            }
        } catch (error) {
            console.error('添加商品失败:', error);
            toast.error(error.response?.data?.message || '添加失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (window.confirm('确定要取消吗？未保存的内容将丢失。')) {
            navigate('/seller');
        }
    };

    const getRarityText = (rarity) => {
        switch (rarity) {
            case 1: return '普通';
            case 2: return '稀有';
            case 3: return '隐藏';
            default: return '普通';
        }
    };

    const getRarityColor = (rarity) => {
        switch (rarity) {
            case 1: return 'text-gray-600 bg-gray-100';
            case 2: return 'text-blue-600 bg-blue-100';
            case 3: return 'text-purple-600 bg-purple-100';
            default: return 'text-gray-600 bg-gray-100';
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
                        <span className="text-3xl">🎁</span>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
                        添加盲盒商品
                    </h1>
                    <p className="text-base text-gray-600 max-w-2xl mx-auto">
                        为盲盒添加商品，设置概率和稀有度，打造独特的抽奖体验
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-8 mb-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* 选择盲盒 */}
                        <div>
                            <label className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                <span className="mr-2">📦</span>
                                选择盲盒 <span className="text-red-500 ml-1">*</span>
                            </label>
                            <select
                                name="blind_box_id"
                                value={formData.blind_box_id}
                                onChange={handleInputChange}
                                className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-lg ${
                                    errors.blind_box_id ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <option value="">请选择要添加商品的盲盒</option>
                                {blindBoxes.map((blindBox) => (
                                    <option key={blindBox.id} value={blindBox.id}>
                                        {blindBox.name} - ¥{blindBox.price}
                                    </option>
                                ))}
                            </select>
                            {errors.blind_box_id && <p className="text-red-500 text-sm mt-2 flex items-center">
                                <span className="mr-1">⚠️</span>
                                {errors.blind_box_id}
                            </p>}
                        </div>

                        {/* 商品名称 */}
                        <div>
                            <label className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                <span className="mr-2">🎯</span>
                                商品名称 <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="请输入商品名称，如：星空手办、海洋徽章..."
                                className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-lg ${
                                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-2 flex items-center">
                                <span className="mr-1">⚠️</span>
                                {errors.name}
                            </p>}
                        </div>

                        {/* 商品图片 */}
                        <div>
                            <label className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                <span className="mr-2">🖼️</span>
                                商品图片URL <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                                type="url"
                                name="image"
                                value={formData.image}
                                onChange={handleInputChange}
                                placeholder="https://example.com/item.jpg"
                                className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-lg ${
                                    errors.image ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                            />
                            {errors.image && <p className="text-red-500 text-sm mt-2 flex items-center">
                                <span className="mr-1">⚠️</span>
                                {errors.image}
                            </p>}
                            
                            {/* 图片预览 */}
                            {formData.image && (
                                <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
                                    <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                                        <span className="mr-2">👁️</span>
                                        图片预览
                                    </p>
                                    <div className="flex items-center space-x-4">
                                        <img
                                            src={formData.image}
                                            alt="预览"
                                            className="w-24 h-24 object-cover rounded-xl border-2 border-white shadow-lg"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/96x96?text=图片加载失败';
                                            }}
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600">图片将作为商品的展示图片</p>
                                            <p className="text-xs text-gray-500 mt-1">建议尺寸：128x128px，格式：JPG/PNG</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 稀有度和概率 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                    <span className="mr-2">⭐</span>
                                    稀有度
                                </label>
                                <select
                                    name="rarity"
                                    value={formData.rarity}
                                    onChange={handleInputChange}
                                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-lg hover:border-gray-300"
                                >
                                    <option value={1}>🟢 普通 (1)</option>
                                    <option value={2}>🔵 稀有 (2)</option>
                                    <option value={3}>🟣 隐藏 (3)</option>
                                </select>
                                <div className="mt-3 p-3 rounded-xl border border-gray-200 bg-gray-50">
                                    <p className="text-sm font-semibold text-gray-700">
                                        当前选择: <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getRarityColor(formData.rarity)}`}>
                                            {getRarityText(formData.rarity)}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                    <span className="mr-2">🎲</span>
                                    抽中概率 <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="probability"
                                    value={formData.probability}
                                    onChange={handleInputChange}
                                    placeholder="0.1"
                                    step="0.001"
                                    min="0"
                                    max="1"
                                    className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-lg ${
                                        errors.probability ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                />
                                {errors.probability && <p className="text-red-500 text-sm mt-2 flex items-center">
                                    <span className="mr-1">⚠️</span>
                                    {errors.probability}
                                </p>}
                                <div className="mt-3 p-3 rounded-xl border border-gray-200 bg-gray-50">
                                    <p className="text-sm text-gray-600">
                                        概率范围: 0-1 (例如: 0.1 = 10%)
                                    </p>
                                    {formData.probability && (
                                        <p className="text-sm font-semibold text-blue-600 mt-1">
                                            当前概率: {(parseFloat(formData.probability) * 100).toFixed(1)}%
                                        </p>
                                    )}
                                </div>
                            </div>
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
                                        添加中...
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <span className="mr-2">✨</span>
                                        添加商品
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Tips */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-8 mb-6">
                    <h3 className="text-xl font-bold text-blue-800 mb-6 flex items-center">
                        <span className="mr-3">💡</span>
                        添加商品提示
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <span className="mr-3 text-blue-500">⭐</span>
                                <div>
                                    <div className="font-semibold text-blue-800">稀有度说明</div>
                                    <div className="text-sm text-blue-700">1=普通, 2=稀有, 3=隐藏</div>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <span className="mr-3 text-blue-500">🎲</span>
                                <div>
                                    <div className="font-semibold text-blue-800">概率设置</div>
                                    <div className="text-sm text-blue-700">所有商品概率总和必须为1 (100%)</div>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <span className="mr-3 text-blue-500">📊</span>
                                <div>
                                    <div className="font-semibold text-blue-800">概率建议</div>
                                    <div className="text-sm text-blue-700">普通60-80%, 稀有15-30%, 隐藏1-10%</div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <span className="mr-3 text-blue-500">🖼️</span>
                                <div>
                                    <div className="font-semibold text-blue-800">图片要求</div>
                                    <div className="text-sm text-blue-700">建议使用正方形图片，尺寸128x128或更大</div>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <span className="mr-3 text-blue-500">🎯</span>
                                <div>
                                    <div className="font-semibold text-blue-800">商品名称</div>
                                    <div className="text-sm text-blue-700">应该简洁明了，便于识别</div>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <span className="mr-3 text-blue-500">✅</span>
                                <div>
                                    <div className="font-semibold text-blue-800">检查概率</div>
                                    <div className="text-sm text-blue-700">添加完所有商品后，记得检查概率总和</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 概率检查提示 */}
                {blindBoxes.length > 0 && (
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-3xl p-6">
                        <h3 className="text-lg font-bold text-yellow-800 mb-3 flex items-center">
                            <span className="mr-2">⚠️</span>
                            重要提醒
                        </h3>
                        <p className="text-yellow-700">
                            请确保每个盲盒的所有商品概率总和为100%。您可以在盲盒管理页面查看和调整商品概率。
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateBoxItem; 