import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SellerDashboard = () => {
    const navigate = useNavigate();
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    const [stats, setStats] = useState({
        totalBlindBoxes: 0,
        listedBlindBoxes: 0,
        totalItems: 0,
        totalSales: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSellerStats();
    }, []);

    const fetchSellerStats = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:7001/api/blindbox/seller/stats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.code === 200) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('获取统计数据失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 检查用户权限
    if (!user || user.role !== 'seller') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-600 mb-2">无权限访问</h2>
                    <p className="text-gray-500 mb-4">只有商家用户才能访问此页面</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
                    >
                        返回首页
                    </button>
                </div>
            </div>
        );
    }

    const managementCards = [
        {
            title: '创建盲盒',
            description: '创建新的盲盒系列，设置价格、库存等信息',
            icon: '📦',
            color: 'bg-blue-500',
            hoverColor: 'hover:bg-blue-600',
            onClick: () => navigate('/seller/blindbox/create')
        },
        {
            title: '管理盲盒',
            description: '查看、编辑、删除已创建的盲盒',
            icon: '📋',
            color: 'bg-green-500',
            hoverColor: 'hover:bg-green-600',
            onClick: () => navigate('/seller/blindbox/manage')
        },
        {
            title: '添加商品',
            description: '为盲盒添加商品，设置概率和稀有度',
            icon: '🎁',
            color: 'bg-purple-500',
            hoverColor: 'hover:bg-purple-600',
            onClick: () => navigate('/seller/item/create')
        },
        {
            title: '查看商城',
            description: '浏览顾客视角的盲盒商城',
            icon: '🏪',
            color: 'bg-orange-500',
            hoverColor: 'hover:bg-orange-600',
            onClick: () => navigate('/blindboxes')
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">商家管理面板</h1>
                    <p className="text-gray-600">欢迎回来，{user.nickname}！在这里管理您的盲盒商品</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">{loading ? '加载中...' : stats.totalBlindBoxes}</div>
                        <div className="text-gray-600">总盲盒数</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">{loading ? '加载中...' : stats.listedBlindBoxes}</div>
                        <div className="text-gray-600">上架盲盒</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-2">{loading ? '加载中...' : stats.totalItems}</div>
                        <div className="text-gray-600">总商品数</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-orange-600 mb-2">{loading ? '加载中...' : stats.totalSales}</div>
                        <div className="text-gray-600">总销量</div>
                    </div>
                </div>

                {/* Management Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {managementCards.map((card, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={card.onClick}
                        >
                            <div className="text-center">
                                <div className="text-4xl mb-4">{card.icon}</div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{card.title}</h3>
                                <p className="text-gray-600 text-sm mb-4">{card.description}</p>
                                <button
                                    className={`w-full ${card.color} ${card.hoverColor} text-white py-2 rounded-lg font-semibold transition-colors`}
                                >
                                    进入管理
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="mt-12 bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">快速操作</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => navigate('/seller/blindbox/create')}
                            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                        >
                            <div className="text-center">
                                <div className="text-2xl mb-2">➕</div>
                                <div className="font-semibold text-gray-700">快速创建盲盒</div>
                            </div>
                        </button>
                        
                        <button
                            onClick={() => navigate('/seller/item/create')}
                            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                        >
                            <div className="text-center">
                                <div className="text-2xl mb-2">🎁</div>
                                <div className="font-semibold text-gray-700">添加盲盒商品</div>
                            </div>
                        </button>
                        
                        <button
                            onClick={() => navigate('/blindboxes')}
                            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                        >
                            <div className="text-center">
                                <div className="text-2xl mb-2">👁️</div>
                                <div className="font-semibold text-gray-700">预览商城效果</div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Tips */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 管理提示</h3>
                    <ul className="text-blue-700 space-y-2">
                        <li>• 创建盲盒时，请确保设置合理的价格和库存</li>
                        <li>• 添加商品时，所有商品概率总和必须为100%</li>
                        <li>• 定期检查库存，及时补充热销盲盒</li>
                        <li>• 可以通过预览功能查看顾客视角的展示效果</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard; 