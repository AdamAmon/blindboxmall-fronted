import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import { toast } from 'react-toastify';

const SellerDashboard = () => {
    const navigate = useNavigate();
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    const [stats, setStats] = useState({
        totalBlindBoxes: 0,
        listedBlindBoxes: 0,
        totalItems: 0,
        totalStock: 0,
        totalValue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSellerStats();
    }, []);

    const fetchSellerStats = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/blindbox/seller/stats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.code === 200) {
                setStats(response.data.data);
            } else {
                toast.error(response.data.message || '获取统计数据失败');
            }
        } catch (error) {
            console.error('获取统计数据失败:', error);
            toast.error('获取统计数据失败');
        } finally {
            setLoading(false);
        }
    };

    // 检查用户权限
    if (!user || user.role !== 'seller') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-12 text-center max-w-md">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                        🔒
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">无权限访问</h2>
                    <p className="text-gray-600 mb-8">只有商家用户才能访问此页面</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn"
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
            gradient: 'from-blue-500 to-indigo-600',
            bgGradient: 'from-blue-50 to-indigo-50',
            borderColor: 'border-blue-200',
            onClick: () => navigate('/seller/blindbox/create')
        },
        {
            title: '管理盲盒',
            description: '查看、编辑、删除已创建的盲盒',
            icon: '📋',
            gradient: 'from-green-500 to-emerald-600',
            bgGradient: 'from-green-50 to-emerald-50',
            borderColor: 'border-green-200',
            onClick: () => navigate('/seller/blindbox/manage')
        },
        {
            title: '添加商品',
            description: '为盲盒添加商品，设置概率和稀有度',
            icon: '🎁',
            gradient: 'from-purple-500 to-pink-600',
            bgGradient: 'from-purple-50 to-pink-50',
            borderColor: 'border-purple-200',
            onClick: () => navigate('/seller/item/create')
        },
        {
            title: '查看商城',
            description: '浏览顾客视角的盲盒商城',
            icon: '🏪',
            gradient: 'from-orange-500 to-red-600',
            bgGradient: 'from-orange-50 to-red-50',
            borderColor: 'border-orange-200',
            onClick: () => navigate('/blindboxes')
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400 animate-ping"></div>
                    </div>
                    <p className="mt-6 text-lg text-gray-600 font-medium">正在加载商家数据...</p>
                    <p className="mt-2 text-sm text-gray-500">精彩内容马上呈现</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* 返回按钮 */}
                <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center text-gray-600 hover:text-purple-600 mb-8 transition-colors duration-200 group"
                >
                    <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-medium">返回个人中心</span>
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mb-6">
                        <span className="text-4xl">🏪</span>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                        商家管理面板
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        欢迎回来，<span className="font-bold text-primary">{user.nickname}</span>！在这里管理您的盲盒商品，打造独特的收藏体验
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-6 text-center hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent mb-2">
                            {loading ? '...' : stats.totalBlindBoxes}
                        </div>
                        <div className="text-gray-600 font-medium">总盲盒数</div>
                        <div className="text-xs text-gray-400 mt-1">已创建的盲盒系列</div>
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" style={{width: `${Math.min((stats.totalBlindBoxes / 10) * 100, 100)}%`}}></div>
                        </div>
                    </div>
                    <div className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-6 text-center hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent mb-2">
                            {loading ? '...' : stats.listedBlindBoxes}
                        </div>
                        <div className="text-gray-600 font-medium">上架盲盒</div>
                        <div className="text-xs text-gray-400 mt-1">正在销售的盲盒</div>
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full" style={{width: `${stats.totalBlindBoxes > 0 ? (stats.listedBlindBoxes / stats.totalBlindBoxes) * 100 : 0}%`}}></div>
                        </div>
                    </div>
                    <div className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-6 text-center hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent mb-2">
                            {loading ? '...' : stats.totalItems}
                        </div>
                        <div className="text-gray-600 font-medium">总商品数</div>
                        <div className="text-xs text-gray-400 mt-1">盲盒内的商品总数</div>
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full" style={{width: `${Math.min((stats.totalItems / 50) * 100, 100)}%`}}></div>
                        </div>
                    </div>
                    <div className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-6 text-center hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent mb-2">
                            ¥{loading ? '...' : stats.totalValue?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-gray-600 font-medium">总价值</div>
                        <div className="text-xs text-gray-400 mt-1">库存商品总价值</div>
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full" style={{width: `${Math.min((stats.totalValue / 10000) * 100, 100)}%`}}></div>
                        </div>
                    </div>
                </div>

                {/* 主要内容区域 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* 左侧：管理卡片 */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <span className="mr-3">⚡</span>
                                快速管理
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {managementCards.map((card, index) => (
                                    <div
                                        key={index}
                                        className={`group bg-gradient-to-br ${card.bgGradient} rounded-2xl shadow-lg border ${card.borderColor} p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer`}
                                        onClick={card.onClick}
                                    >
                                        <div className="flex items-center mb-4">
                                            <div className="text-3xl mr-4 group-hover:scale-110 transition-transform duration-300">{card.icon}</div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800">{card.title}</h3>
                                                <p className="text-gray-600 text-sm">{card.description}</p>
                                            </div>
                                        </div>
                                        <button
                                            className={`w-full bg-gradient-to-r ${card.gradient} hover:from-primary/90 hover:to-secondary/90 text-white py-2 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn`}
                                        >
                                            立即操作
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 右侧：业务数据概览 */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <span className="mr-2">📊</span>
                            业务概览
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                <div>
                                    <div className="text-sm text-gray-600">库存剩余</div>
                                    <div className="text-lg font-bold text-green-600">{stats.totalStock || 0}</div>
                                </div>
                                <div className="text-2xl">📦</div>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                <div>
                                    <div className="text-sm text-gray-600">上架率</div>
                                    <div className="text-lg font-bold text-blue-600">
                                        {stats.totalBlindBoxes > 0 
                                            ? `${((stats.listedBlindBoxes / stats.totalBlindBoxes) * 100).toFixed(1)}%`
                                            : '0%'}
                                    </div>
                                </div>
                                <div className="text-2xl">📈</div>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                                <div>
                                    <div className="text-sm text-gray-600">平均商品数</div>
                                    <div className="text-lg font-bold text-purple-600">
                                        {stats.totalBlindBoxes > 0 
                                            ? Math.round(stats.totalItems / stats.totalBlindBoxes)
                                            : 0}
                                    </div>
                                </div>
                                <div className="text-2xl">🎁</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 快速操作区域 */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-8 mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                        <span className="mr-3">🚀</span>
                        快速操作
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button
                            onClick={() => navigate('/seller/blindbox/create')}
                            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
                        >
                            <div className="text-2xl mr-3 group-hover:scale-110 transition-transform duration-200">➕</div>
                            <div className="text-left">
                                <div className="font-bold text-gray-700">快速创建盲盒</div>
                                <div className="text-sm text-gray-500">一键创建新盲盒</div>
                            </div>
                        </button>
                        <button
                            onClick={() => navigate('/seller/item/create')}
                            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
                        >
                            <div className="text-2xl mr-3 group-hover:scale-110 transition-transform duration-200">🎁</div>
                            <div className="text-left">
                                <div className="font-bold text-gray-700">添加盲盒商品</div>
                                <div className="text-sm text-gray-500">为盲盒添加商品</div>
                            </div>
                        </button>
                        <button
                            onClick={() => navigate('/blindboxes')}
                            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
                        >
                            <div className="text-2xl mr-3 group-hover:scale-110 transition-transform duration-200">👁️</div>
                            <div className="text-left">
                                <div className="font-bold text-gray-700">预览商城效果</div>
                                <div className="text-sm text-gray-500">查看顾客视角</div>
                            </div>
                        </button>
                        <button
                            onClick={() => navigate('/seller/stats')}
                            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
                        >
                            <div className="text-2xl mr-3 group-hover:scale-110 transition-transform duration-200">📊</div>
                            <div className="text-left">
                                <div className="font-bold text-gray-700">查看统计数据</div>
                                <div className="text-sm text-gray-500">分析业务表现</div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* 业务提示 */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-8">
                    <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                        <span className="mr-2">💡</span>
                        管理提示
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <span className="mr-3 text-blue-500">📦</span>
                                <div>
                                    <div className="font-semibold text-blue-800">创建盲盒</div>
                                    <div className="text-sm text-blue-700">设置合理的价格和库存，吸引更多顾客</div>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <span className="mr-3 text-blue-500">🎁</span>
                                <div>
                                    <div className="font-semibold text-blue-800">添加商品</div>
                                    <div className="text-sm text-blue-700">所有商品概率总和必须为100%</div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <span className="mr-3 text-blue-500">📊</span>
                                <div>
                                    <div className="font-semibold text-blue-800">库存管理</div>
                                    <div className="text-sm text-blue-700">定期检查库存，及时补充热销盲盒</div>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <span className="mr-3 text-blue-500">👁️</span>
                                <div>
                                    <div className="font-semibold text-blue-800">预览效果</div>
                                    <div className="text-sm text-blue-700">通过预览功能查看顾客视角的展示效果</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard; 