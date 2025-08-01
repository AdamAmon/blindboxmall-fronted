import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import { toast } from 'react-toastify';

const ManageBlindBoxes = () => {
    const navigate = useNavigate();
    const [blindBoxes, setBlindBoxes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [editingBox, setEditingBox] = useState(null);
    const [editForm, setEditForm] = useState({});

    // 新增筛选条件
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [status, setStatus] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [order, setOrder] = useState('desc');

    // 防抖搜索相关状态
    const [searchParams, setSearchParams] = useState({
        keyword: '',
        minPrice: '',
        maxPrice: '',
        status: '',
        sortBy: 'created_at',
        order: 'desc'
    });

    const fetchBlindBoxes = useCallback(async () => {
        try {
            setLoading(true);
            const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
            const sellerId = user ? user.id : null;
            
            const response = await api.get('/api/blindbox', {
                params: {
                    page: currentPage.toString(),
                    limit: '10',
                    keyword: searchParams.keyword,
                    seller_id: sellerId ? sellerId.toString() : null,
                    minPrice: searchParams.minPrice || undefined,
                    maxPrice: searchParams.maxPrice || undefined,
                    status: searchParams.status || undefined,
                    sortBy: searchParams.sortBy,
                    order: searchParams.order
                },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.code === 200) {
                setBlindBoxes(response.data.data.list);
                setTotalPages(response.data.data.totalPages);
            }
        } catch (error) {
            console.error('获取盲盒列表失败:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchParams]);

    // 防抖搜索效果
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchParams({
                keyword: searchKeyword,
                minPrice,
                maxPrice,
                status,
                sortBy,
                order
            });
        }, 500); // 500ms 延迟

        return () => clearTimeout(timer);
    }, [searchKeyword, minPrice, maxPrice, status, sortBy, order]);

    useEffect(() => {
        fetchBlindBoxes();
    }, [fetchBlindBoxes]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        // 立即更新搜索参数
        setSearchParams({
            keyword: searchKeyword,
            minPrice,
            maxPrice,
            status,
            sortBy,
            order
        });
    };

    const handleReset = () => {
        setSearchKeyword('');
        setMinPrice('');
        setMaxPrice('');
        setStatus('');
        setSortBy('created_at');
        setOrder('desc');
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
                toast.success('盲盒更新成功！');
                setEditingBox(null);
                fetchBlindBoxes();
            }
        } catch (error) {
            console.error('更新盲盒失败:', error);
            toast.error(error.response?.data?.message || '更新失败，请重试');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('确定要删除这个盲盒吗？此操作不可恢复。')) {
            try {
                const response = await api.delete(`/api/blindbox/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.data.code === 200) {
                    toast.success('盲盒删除成功！');
                    fetchBlindBoxes();
                }
            } catch (error) {
                console.error('删除盲盒失败:', error);
                toast.error(error.response?.data?.message || '删除失败，请重试');
            }
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400 animate-ping"></div>
                    </div>
                    <p className="mt-6 text-lg text-gray-600 font-medium">正在加载盲盒数据...</p>
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
                        <span className="text-3xl">📋</span>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
                        盲盒管理
                    </h1>
                    <p className="text-base text-gray-600 max-w-2xl mx-auto mb-6">
                        管理您创建的盲盒商品，查看销售状态和库存情况
                    </p>
                    <button
                        onClick={() => navigate('/seller/blindbox/create')}
                        className="px-6 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-xl font-bold text-base transition-all duration-200 transform hover:scale-105 shadow-btn"
                    >
                        <span className="flex items-center">
                            <span className="mr-2">✨</span>
                            创建新盲盒
                        </span>
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-8 mb-8">
                    <form onSubmit={handleSearch} className="space-y-6">
                        {/* 基础搜索 */}
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                                <input
                                    type="text"
                                    placeholder="搜索盲盒名称..."
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-lg hover:border-gray-300"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-8 py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-btn"
                            >
                                立即搜索
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-8 py-4 border-2 border-gray-300 rounded-2xl text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold"
                            >
                                重置
                            </button>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                            <span className="mr-2">💡</span>
                            提示：输入关键词后会自动搜索（500ms延迟），或点击"立即搜索"按钮
                        </div>
                        
                        {/* 高级筛选 */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">最低价格</label>
                                <input
                                    type="number"
                                    placeholder="最低价"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-gray-300"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">最高价格</label>
                                <input
                                    type="number"
                                    placeholder="最高价"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-gray-300"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">状态</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-gray-300"
                                >
                                    <option value="">全部状态</option>
                                    <option value="1">🚀 上架中</option>
                                    <option value="0">⏸️ 已下架</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">排序字段</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-gray-300"
                                >
                                    <option value="created_at">📅 创建时间</option>
                                    <option value="price">💰 价格</option>
                                    <option value="stock">📦 库存</option>
                                    <option value="name">📝 名称</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">排序方式</label>
                                <select
                                    value={order}
                                    onChange={(e) => setOrder(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-gray-300"
                                >
                                    <option value="desc">⬇️ 降序</option>
                                    <option value="asc">⬆️ 升序</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Blind Boxes Table */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                                <tr>
                                    <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                        📦 盲盒信息
                                    </th>
                                    <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                        💰 价格
                                    </th>
                                    <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                        📦 库存
                                    </th>
                                    <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                        🔄 状态
                                    </th>
                                    <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                        ⚡ 操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {blindBoxes.map((blindBox) => (
                                    <tr key={blindBox.id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center">
                                                <img
                                                    src={blindBox.cover_image}
                                                    alt={blindBox.name}
                                                    className="w-20 h-20 object-cover rounded-2xl mr-6 border-2 border-white shadow-lg"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/80x80?text=图片';
                                                    }}
                                                />
                                                <div>
                                                    <div className="text-lg font-bold text-gray-900 mb-1">
                                                        {blindBox.name}
                                                    </div>
                                                    <div className="text-sm text-gray-600 max-w-xs leading-relaxed">
                                                        {blindBox.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-lg font-bold text-green-600">
                                                ¥{blindBox.price}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-lg font-semibold text-gray-900">
                                                {blindBox.stock}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                剩余库存
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                                                blindBox.status === 1 
                                                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' 
                                                    : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200'
                                            }`}>
                                                {blindBox.status === 1 ? '🚀 上架中' : '⏸️ 已下架'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col space-y-2">
                                                <button
                                                    onClick={() => handleEdit(blindBox)}
                                                    className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center"
                                                >
                                                    <span className="mr-1">✏️</span>
                                                    编辑
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/seller/blindbox/${blindBox.id}/items`)}
                                                    className="text-green-600 hover:text-green-800 font-semibold text-sm flex items-center"
                                                >
                                                    <span className="mr-1">🎁</span>
                                                    管理商品
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/blindbox/${blindBox.id}`)}
                                                    className="text-purple-600 hover:text-purple-800 font-semibold text-sm flex items-center"
                                                >
                                                    <span className="mr-1">👁️</span>
                                                    预览
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(blindBox.id)}
                                                    className="text-red-600 hover:text-red-800 font-semibold text-sm flex items-center"
                                                >
                                                    <span className="mr-1">🗑️</span>
                                                    删除
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {blindBoxes.length === 0 && (
                        <div className="text-center py-16">
                            <div className="text-gray-400 text-8xl mb-6">📦</div>
                            <h3 className="text-2xl font-bold text-gray-600 mb-4">暂无盲盒</h3>
                            <p className="text-gray-500 mb-8 text-lg">您还没有创建任何盲盒，开始创建您的第一个盲盒吧！</p>
                            <button
                                onClick={() => navigate('/seller/blindbox/create')}
                                className="px-8 py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-2xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-btn"
                            >
                                <span className="flex items-center">
                                    <span className="mr-2">✨</span>
                                    创建第一个盲盒
                                </span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-4">
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-6 py-3 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-semibold"
                                >
                                    ⬅️ 上一页
                                </button>
                                
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-6 py-3 border-2 rounded-xl font-semibold transition-all duration-200 ${
                                            currentPage === page
                                                ? 'bg-gradient-to-r from-primary to-secondary text-white border-primary shadow-btn'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-6 py-3 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-semibold"
                                >
                                    下一页 ➡️
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {editingBox && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                                    <span className="mr-3">✏️</span>
                                    编辑盲盒
                                </h3>
                                <button
                                    onClick={() => setEditingBox(null)}
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-lg font-semibold text-gray-800 mb-3">盲盒名称</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-lg hover:border-gray-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-lg font-semibold text-gray-800 mb-3">描述</label>
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                        rows={3}
                                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-lg resize-none hover:border-gray-300"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-lg font-semibold text-gray-800 mb-3">价格</label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">¥</span>
                                            <input
                                                type="number"
                                                value={editForm.price}
                                                onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value) || 0})}
                                                step="0.01"
                                                min="0"
                                                className="w-full pl-12 pr-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-lg hover:border-gray-300"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-lg font-semibold text-gray-800 mb-3">库存</label>
                                        <input
                                            type="number"
                                            value={editForm.stock}
                                            onChange={(e) => setEditForm({...editForm, stock: parseInt(e.target.value) || 0})}
                                            min="0"
                                            className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-lg hover:border-gray-300"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-lg font-semibold text-gray-800 mb-3">状态</label>
                                    <select
                                        value={editForm.status}
                                        onChange={(e) => setEditForm({...editForm, status: parseInt(e.target.value)})}
                                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-lg hover:border-gray-300"
                                    >
                                        <option value={1}>🚀 上架</option>
                                        <option value={0}>⏸️ 下架</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => setEditingBox(null)}
                                    className="px-8 py-4 border-2 border-gray-300 rounded-2xl text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold text-lg"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="px-8 py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-2xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-btn"
                                >
                                    <span className="flex items-center">
                                        <span className="mr-2">💾</span>
                                        保存
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageBlindBoxes; 