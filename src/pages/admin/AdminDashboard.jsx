import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import { toast } from 'react-toastify';
import { useUser } from '../../hooks/useUser';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [blindBoxes, setBlindBoxes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [editingBox, setEditingBox] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [stats, setStats] = useState({
        totalBlindBoxes: 0,
        activeBlindBoxes: 0,
        totalItems: 0,
        totalSales: 0
    });
    
    // 使用自定义 Hook 获取用户信息
    const user = useUser();

    // hooks必须在组件顶层调用
    const fetchBlindBoxes = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/blindbox', {
                params: {
                    page: currentPage,
                    limit: 10,
                    keyword: searchKeyword
                },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.code === 200) {
                setBlindBoxes(response.data.data.list);
                setTotalPages(response.data.data.totalPages);
            }
        } catch {
            console.error('获取盲盒列表失败');
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchKeyword]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await api.get('/api/blindbox', {
                params: { limit: 1000 },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.code === 200) {
                const allBlindBoxes = response.data.data.list;
                setStats({
                    totalBlindBoxes: allBlindBoxes.length,
                    activeBlindBoxes: allBlindBoxes.filter(box => box.status === 1).length,
                    totalItems: allBlindBoxes.reduce((sum, box) => sum + (box.comment_count || 0), 0),
                    totalSales: allBlindBoxes.reduce((sum, box) => sum + (box.price * (box.stock || 0)), 0)
                });
            }
        } catch {
            console.error('获取统计数据失败');
        }
    }, []);

    useEffect(() => {
        fetchBlindBoxes();
        fetchStats();
    }, [fetchBlindBoxes, fetchStats]);

    // 权限判断提前
    if (!user || user.role !== 'admin') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-purple-50 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
                    <div className="absolute top-20 left-20 w-40 h-40 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-20 w-60 h-60 bg-secondary/10 rounded-full blur-3xl"></div>
                </div>
                
                <div className="relative z-10 flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-red-500 to-pink-600 rounded-full mb-6">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">无权限访问</h2>
                        <p className="text-gray-600 mb-8 text-lg">只有管理员用户才能访问此页面</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-3 rounded-2xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn"
                        >
                            返回首页
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    const handleEdit = (blindBox) => {
        setEditingBox(blindBox);
        setEditForm({
            name: blindBox.name,
            description: blindBox.description,
            price: blindBox.price,
            stock: blindBox.stock,
            status: blindBox.status
        });
    };

    const handleUpdate = async () => {
        try {
            const response = await api.put(`/api/blindbox/${editingBox.id}`, editForm, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.code === 200) {
                toast.success('更新成功');
                setEditingBox(null);
                setEditForm({});
                fetchBlindBoxes();
            }
        } catch {
            toast.error('更新失败');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('确定要删除这个盲盒吗？')) {
            try {
                const response = await api.delete(`/api/blindbox/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.data.code === 200) {
                    toast.success('删除成功');
                    fetchBlindBoxes();
                }
            } catch {
                toast.error('删除失败');
            }
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-purple-50 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
                    <div className="absolute top-20 left-20 w-40 h-40 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-20 w-60 h-60 bg-secondary/10 rounded-full blur-3xl"></div>
                </div>
                
                <div className="relative z-10 flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full mb-4 animate-pulse">
                            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                        <p className="text-gray-600 font-medium">正在加载管理员面板...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-purple-50 relative overflow-hidden">
            {/* 背景装饰 */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
                <div className="absolute top-20 left-20 w-40 h-40 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-60 h-60 bg-secondary/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* 页面标题 */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4 font-brand">
                        管理员面板
                    </h1>
                    <div className="flex items-center justify-center space-x-3 text-gray-600">
                        <div className="w-12 h-px bg-gradient-to-r from-transparent to-gray-300"></div>
                        <span className="text-lg font-medium">管理盲盒商城系统</span>
                        <div className="w-12 h-px bg-gradient-to-l from-transparent to-gray-300"></div>
                    </div>
                </div>

                {/* 统计卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {/* 总盲盒数 */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card border border-white/30 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">总盲盒数</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalBlindBoxes}</p>
                            </div>
                            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl text-white shadow-lg">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* 活跃盲盒 */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card border border-white/30 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">活跃盲盒</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.activeBlindBoxes}</p>
                            </div>
                            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white shadow-lg">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* 总评论数 */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card border border-white/30 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">总评论数</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalItems}</p>
                            </div>
                            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl text-white shadow-lg">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* 总销售额 */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card border border-white/30 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">总销售额</p>
                                <p className="text-3xl font-bold text-gray-900">¥{stats.totalSales.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl text-white shadow-lg">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 搜索和操作区域 */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card border border-white/30 p-6 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* 搜索框 */}
                        <form onSubmit={handleSearch} className="flex-1 max-w-md">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="搜索盲盒..."
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-primary focus:ring-0 focus:outline-none transition-all duration-200"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                </div>
                            </div>
                        </form>

                        {/* 操作按钮 */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/seller/blindbox/create')}
                                className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                                创建盲盒
                            </button>
                            
                            <button
                                onClick={() => navigate('/coupon/manage')}
                                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
                                </svg>
                                优惠券管理
                            </button>
                        </div>
                    </div>
                </div>

                {/* 盲盒列表表格 */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card border border-white/30 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-gray-800">盲盒管理</h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">盲盒信息</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">价格</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">库存</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {blindBoxes.map((blindBox) => (
                                    <tr key={blindBox.id} className="hover:bg-gray-50 transition-colors duration-200">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-12 w-12">
                                                    <img
                                                        className="h-12 w-12 rounded-2xl object-cover"
                                                        src={blindBox.cover_image || '/default-blindbox.png'}
                                                        alt={blindBox.name}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 font-brand">{blindBox.name}</div>
                                                    <div className="text-sm text-gray-500 line-clamp-2">{blindBox.description}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-primary">¥{blindBox.price}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{blindBox.stock}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                                blindBox.status === 1
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {blindBox.status === 1 ? '上架' : '下架'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500">{formatDate(blindBox.created_at)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEdit(blindBox)}
                                                    className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                                                >
                                                    编辑
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(blindBox.id)}
                                                    className="text-red-600 hover:text-red-900 font-medium text-sm"
                                                >
                                                    删除
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* 分页 */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    第 {currentPage} 页，共 {totalPages} 页
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary hover:bg-primary/5 transition-all duration-200 font-bold"
                                    >
                                        上一页
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary hover:bg-primary/5 transition-all duration-200 font-bold"
                                    >
                                        下一页
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 编辑模态框 */}
                {editingBox && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">编辑盲盒</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">名称</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                        rows={3}
                                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 focus:outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">价格</label>
                                        <input
                                            type="number"
                                            value={editForm.price}
                                            onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value)})}
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">库存</label>
                                        <input
                                            type="number"
                                            value={editForm.stock}
                                            onChange={(e) => setEditForm({...editForm, stock: parseInt(e.target.value)})}
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
                                    <select
                                        value={editForm.status}
                                        onChange={(e) => setEditForm({...editForm, status: parseInt(e.target.value)})}
                                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 focus:outline-none"
                                    >
                                        <option value={1}>上架</option>
                                        <option value={0}>下架</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex space-x-3 mt-6">
                                <button
                                    onClick={handleUpdate}
                                    className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white py-2 px-4 rounded-xl font-bold transition-all duration-200"
                                >
                                    保存
                                </button>
                                <button
                                    onClick={() => setEditingBox(null)}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-xl font-bold transition-all duration-200"
                                >
                                    取消
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard; 