import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const BlindBoxDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blindBox, setBlindBox] = useState(null);
    const [boxItems, setBoxItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [drawQuantity, setDrawQuantity] = useState(1);
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

    const fetchBlindBoxDetail = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:7001/api/blindbox/${id}`);
            if (response.data.code === 200) {
                setBlindBox(response.data.data);
            }
        } catch (error) {
            console.error('获取盲盒详情失败:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchBoxItems = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:7001/api/blindbox/${id}/items`);
            if (response.data.code === 200) {
                setBoxItems(response.data.data);
            }
        } catch (error) {
            console.error('获取盲盒商品失败:', error);
        }
    }, [id]);

    useEffect(() => {
        fetchBlindBoxDetail();
        fetchBoxItems();
    }, [fetchBlindBoxDetail, fetchBoxItems]);

    // 加入购物车逻辑
    const handleAddToCart = async () => {
        if (!user) {
            alert('请先登录');
            navigate('/login');
            return;
        }
        try {
            await axios.post('http://localhost:7001/api/cart/add', {
                user_id: user.id,
                blind_box_id: parseInt(id),
                quantity: drawQuantity
            });
            toast.success('已加入购物车');
        } catch {
            toast.error('加入购物车失败');
        }
    };

    const getRarityColor = (rarity) => {
        switch (rarity) {
            case 1: return 'bg-gray-100 text-gray-800';
            case 2: return 'bg-blue-100 text-blue-800';
            case 3: return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">加载中...</p>
                </div>
            </div>
        );
    }

    if (!blindBox) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-600 mb-2">盲盒不存在</h2>
                    <button
                        onClick={() => navigate('/blindboxes')}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
                    >
                        返回盲盒列表
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/blindboxes')}
                    className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    返回盲盒列表
                </button>

                {/* Blind Box Info */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                    <div className="md:flex">
                        <div className="md:w-1/2">
                            <img
                                src={blindBox.cover_image}
                                alt={blindBox.name}
                                className="w-full h-96 object-cover"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/400x400?text=盲盒图片';
                                }}
                            />
                        </div>
                        <div className="md:w-1/2 p-6">
                            <h1 className="text-3xl font-bold text-gray-800 mb-4">{blindBox.name}</h1>
                            <p className="text-gray-600 mb-6">{blindBox.description}</p>
                            
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">价格:</span>
                                    <span className="text-3xl font-bold text-purple-600">¥{blindBox.price}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">库存:</span>
                                    <span className="font-semibold">{blindBox.stock}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">状态:</span>
                                    <span className={`px-2 py-1 rounded-full text-sm font-semibold ${
                                        blindBox.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {blindBox.status === 1 ? '上架中' : '已下架'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">评论数:</span>
                                    <span className="font-semibold">{blindBox.comment_count}</span>
                                </div>
                            </div>

                            {/* Draw Section */}
                            {blindBox.status === 1 && blindBox.stock > 0 && (
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold mb-4">加入购物车</h3>
                                    <div className="flex items-center space-x-4 mb-4">
                                        <label className="text-gray-600">数量:</label>
                                        <select
                                            value={drawQuantity}
                                            onChange={(e) => setDrawQuantity(Number(e.target.value))}
                                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            {[1, 2, 3, 4, 5].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                        <span className="text-gray-600">
                                            总价: ¥{(blindBox.price * drawQuantity).toFixed(2)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleAddToCart}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
                                    >
                                        加入购物车
                                    </button>
                                </div>
                            )}

                            {blindBox.stock === 0 && (
                                <div className="border-t pt-6">
                                    <div className="text-center text-red-600 font-semibold">
                                        库存不足，暂时无法抽奖
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Box Items */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">盲盒商品</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {boxItems.map((item) => (
                            <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="text-center">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-32 h-32 object-cover mx-auto mb-4 rounded-lg"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/128x128?text=商品图片';
                                        }}
                                    />
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.name}</h3>
                                    <div className="flex justify-center items-center space-x-2 mb-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRarityColor(item.rarity)}`}>
                                            {getRarityText(item.rarity)}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            概率: {(item.probability * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 已移除抽奖结果弹窗 */}
            </div>
        </div>
    );
};

export default BlindBoxDetail; 