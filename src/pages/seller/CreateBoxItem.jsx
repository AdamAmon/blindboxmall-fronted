import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
            const response = await axios.get('http://localhost:7001/api/blindbox', {
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
            const response = await axios.post('http://localhost:7001/api/blindbox/items', {
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
                alert('商品添加成功！');
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
            alert(error.response?.data?.message || '添加失败，请重试');
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
                    <h1 className="text-3xl font-bold text-gray-800">添加盲盒商品</h1>
                    <p className="text-gray-600 mt-2">为盲盒添加商品，设置概率和稀有度</p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow-md p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 选择盲盒 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                选择盲盒 <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="blind_box_id"
                                value={formData.blind_box_id}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errors.blind_box_id ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                                <option value="">请选择盲盒</option>
                                {blindBoxes.map((blindBox) => (
                                    <option key={blindBox.id} value={blindBox.id}>
                                        {blindBox.name} - ¥{blindBox.price}
                                    </option>
                                ))}
                            </select>
                            {errors.blind_box_id && <p className="text-red-500 text-sm mt-1">{errors.blind_box_id}</p>}
                        </div>

                        {/* 商品名称 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                商品名称 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="请输入商品名称"
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        {/* 商品图片 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                商品图片URL <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="url"
                                name="image"
                                value={formData.image}
                                onChange={handleInputChange}
                                placeholder="https://example.com/item.jpg"
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errors.image ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                            
                            {/* 图片预览 */}
                            {formData.image && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-600 mb-2">图片预览:</p>
                                    <img
                                        src={formData.image}
                                        alt="预览"
                                        className="w-32 h-32 object-cover rounded-lg border"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/128x128?text=图片加载失败';
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* 稀有度和概率 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    稀有度
                                </label>
                                <select
                                    name="rarity"
                                    value={formData.rarity}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value={1}>普通 (1)</option>
                                    <option value={2}>稀有 (2)</option>
                                    <option value={3}>隐藏 (3)</option>
                                </select>
                                <p className="text-sm text-gray-500 mt-1">
                                    当前选择: {getRarityText(formData.rarity)}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    抽中概率 <span className="text-red-500">*</span>
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
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                        errors.probability ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.probability && <p className="text-red-500 text-sm mt-1">{errors.probability}</p>}
                                <p className="text-sm text-gray-500 mt-1">
                                    概率范围: 0-1 (例如: 0.1 = 10%)
                                </p>
                            </div>
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
                                {loading ? '添加中...' : '添加商品'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Tips */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 添加商品提示</h3>
                    <ul className="text-blue-700 space-y-2">
                        <li>• <strong>稀有度说明:</strong> 1=普通, 2=稀有, 3=隐藏</li>
                        <li>• <strong>概率设置:</strong> 所有商品概率总和必须为1 (100%)</li>
                        <li>• <strong>概率建议:</strong> 普通商品60-80%, 稀有商品15-30%, 隐藏商品1-10%</li>
                        <li>• <strong>图片要求:</strong> 建议使用正方形图片，尺寸建议128x128或更大</li>
                        <li>• <strong>商品名称:</strong> 应该简洁明了，便于识别</li>
                        <li>• 添加完所有商品后，记得检查概率总和是否为100%</li>
                    </ul>
                </div>

                {/* 概率检查提示 */}
                {blindBoxes.length > 0 && (
                    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-yellow-800 mb-3">⚠️ 重要提醒</h3>
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