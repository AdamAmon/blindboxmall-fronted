import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/axios';
import { toast } from 'react-toastify';

const ManageBoxItems = () => {
    const navigate = useNavigate();
    const { blindBoxId } = useParams();
    const [boxItems, setBoxItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [blindBox, setBlindBox] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createForm, setCreateForm] = useState({
        name: '',
        image: '',
        rarity: 1,
        probability: 0.5
    });

    // 防抖搜索相关状态
    const [filterParams, setFilterParams] = useState({
        keyword: '',
        rarity: '',
        sortBy: 'rarity',
        order: 'asc'
    });
    const [debouncedFilterParams, setDebouncedFilterParams] = useState({
        keyword: '',
        rarity: '',
        sortBy: 'rarity',
        order: 'asc'
    });

    const fetchBlindBox = useCallback(async () => {
        try {
            const response = await api.get(`/api/blindbox/${blindBoxId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.data.code === 200) {
                setBlindBox(response.data.data);
            }
        } catch (error) {
            console.error('获取盲盒信息失败:', error);
        }
    }, [blindBoxId]);

    const fetchBoxItems = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/blindbox/${blindBoxId}/items`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.data.code === 200) {
                setBoxItems(response.data.data);
            }
        } catch (error) {
            console.error('获取商品列表失败:', error);
        } finally {
            setLoading(false);
        }
    }, [blindBoxId]);

    // 防抖效果
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilterParams(filterParams);
        }, 500); // 500ms 延迟

        return () => clearTimeout(timer);
    }, [filterParams]);

    // 筛选和排序逻辑
    useEffect(() => {
        let filtered = [...boxItems];
        
        // 关键词搜索
        if (debouncedFilterParams.keyword) {
            filtered = filtered.filter(item => 
                item.name.toLowerCase().includes(debouncedFilterParams.keyword.toLowerCase())
            );
        }
        
        // 稀有度筛选
        if (debouncedFilterParams.rarity) {
            filtered = filtered.filter(item => item.rarity === parseInt(debouncedFilterParams.rarity));
        }
        
        // 排序
        filtered.sort((a, b) => {
            let aValue, bValue;
            switch (debouncedFilterParams.sortBy) {
                case 'name':
                    aValue = a.name;
                    bValue = b.name;
                    break;
                case 'probability':
                    aValue = a.probability;
                    bValue = b.probability;
                    break;
                case 'rarity':
                default:
                    aValue = a.rarity;
                    bValue = b.rarity;
                    break;
            }
            
            if (debouncedFilterParams.order === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
        
        setFilteredItems(filtered);
    }, [boxItems, debouncedFilterParams]);

    useEffect(() => {
        fetchBlindBox();
        fetchBoxItems();
    }, [fetchBlindBox, fetchBoxItems]);

    const handleCreateItem = async () => {
        try {
            const response = await api.post('/api/blindbox/items', {
                ...createForm,
                blind_box_id: parseInt(blindBoxId)
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.code === 200) {
                toast.success('创建成功！');
                setShowCreateForm(false);
                setCreateForm({
                    name: '',
                    image: '',
                    rarity: 1,
                    probability: 0.5
                });
                fetchBoxItems();
            }
        } catch (error) {
            console.error('创建失败:', error);
            toast.error(error.response?.data?.message || '创建失败，请重试');
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setEditForm({
            name: item.name,
            image: item.image,
            rarity: item.rarity,
            probability: item.probability
        });
    };

    const handleUpdate = async () => {
        try {
            const response = await api.put(
                `/api/blindbox/items/${editingItem.id}`,
                { ...editForm, id: editingItem.id }, // 确保包含id字段
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            if (response.data.code === 200) {
                toast.success('更新成功！');
                setEditingItem(null);
                fetchBoxItems();
            }
        } catch (error) {
            console.error('更新失败:', error);
            toast.error(error.response?.data?.message || '更新失败，请重试');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('确定要删除这个商品吗？此操作不可恢复。')) {
            return;
        }

        try {
            const response = await api.delete(`/api/blindbox/items/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.code === 200) {
                toast.success('删除成功！');
                fetchBoxItems();
            }
        } catch (error) {
            console.error('删除失败:', error);
            toast.error(error.response?.data?.message || '删除失败，请重试');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
    };

    const handleReset = () => {
        const resetParams = {
            keyword: '',
            rarity: '',
            sortBy: 'rarity',
            order: 'asc'
        };
        setFilterParams(resetParams);
        setDebouncedFilterParams(resetParams);
    };

    const getRarityText = (rarity) => {
        switch (rarity) {
            case 1: return '普通';
            case 2: return '稀有';
            case 3: return '隐藏';
            default: return '未知';
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400 animate-ping"></div>
                    </div>
                    <p className="mt-6 text-lg text-gray-600 font-medium">正在加载商品数据...</p>
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
                    onClick={() => navigate('/seller/blindbox/manage')}
                    className="flex items-center text-gray-600 hover:text-purple-600 mb-6 transition-colors duration-200 group"
                >
                    <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-medium">返回盲盒管理</span>
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mb-4">
                        <span className="text-3xl">🎁</span>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
                        商品管理
                    </h1>
                    <p className="text-base text-gray-600 max-w-2xl mx-auto mb-6">
                        {blindBox ? `管理盲盒"${blindBox.name}"的商品` : '管理盲盒商品'}
                    </p>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="px-6 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-xl font-bold text-base transition-all duration-200 transform hover:scale-105 shadow-btn"
                    >
                        <span className="flex items-center">
                            <span className="mr-2">✨</span>
                            添加商品
                        </span>
                    </button>
                </div>

                {/* Blind Box Info */}
                {blindBox && (
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-6 mb-8">
                        <div className="flex items-center">
                            <img
                                src={blindBox.cover_image}
                                alt={blindBox.name}
                                className="w-20 h-20 object-cover rounded-2xl mr-6 border-2 border-white shadow-lg"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/80x80?text=图片';
                                }}
                            />
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-800 mb-2">{blindBox.name}</h2>
                                <p className="text-gray-600 mb-3 leading-relaxed">{blindBox.description}</p>
                                <div className="flex items-center space-x-6">
                                    <span className="text-sm font-semibold text-green-600">💰 价格: ¥{blindBox.price}</span>
                                    <span className="text-sm font-semibold text-blue-600">📦 库存: {blindBox.stock}</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        blindBox.status === 1 
                                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' 
                                            : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200'
                                    }`}>
                                        {blindBox.status === 1 ? '🚀 上架中' : '⏸️ 已下架'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search and Filter */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-6 mb-8">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                                <input
                                    type="text"
                                    placeholder="搜索商品名称..."
                                    value={filterParams.keyword}
                                    onChange={(e) => setFilterParams({...filterParams, keyword: e.target.value})}
                                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-base hover:border-gray-300"
                                />
                            </div>
                            <select
                                value={filterParams.rarity}
                                onChange={(e) => setFilterParams({...filterParams, rarity: e.target.value})}
                                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-gray-300"
                            >
                                <option value="">全部稀有度</option>
                                <option value="1">🟢 普通</option>
                                <option value="2">🔵 稀有</option>
                                <option value="3">🟣 隐藏</option>
                            </select>
                            <select
                                value={filterParams.sortBy}
                                onChange={(e) => setFilterParams({...filterParams, sortBy: e.target.value})}
                                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-gray-300"
                            >
                                <option value="rarity">⭐ 稀有度</option>
                                <option value="name">📝 名称</option>
                                <option value="probability">🎲 概率</option>
                            </select>
                            <select
                                value={filterParams.order}
                                onChange={(e) => setFilterParams({...filterParams, order: e.target.value})}
                                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-gray-300"
                            >
                                <option value="asc">⬆️ 升序</option>
                                <option value="desc">⬇️ 降序</option>
                            </select>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold"
                            >
                                重置
                            </button>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                            <span className="mr-2">💡</span>
                            提示：输入关键词或选择条件后会自动筛选（500ms延迟）
                        </div>
                    </form>
                </div>

                {/* Box Items Table */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                                <tr>
                                    <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                        🎁 商品信息
                                    </th>
                                    <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                        ⭐ 稀有度
                                    </th>
                                    <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                        🎲 概率
                                    </th>
                                    <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                        ⚡ 操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-20 h-20 object-cover rounded-2xl mr-6 border-2 border-white shadow-lg"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/80x80?text=图片';
                                                    }}
                                                />
                                                <div>
                                                    <div className="text-lg font-bold text-gray-900 mb-1">
                                                        {item.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-2 rounded-full text-sm font-bold ${getRarityColor(item.rarity)}`}>
                                                {getRarityText(item.rarity)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-lg font-bold text-purple-600">
                                                {(item.probability * 100).toFixed(1)}%
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                抽中概率
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col space-y-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center"
                                                >
                                                    <span className="mr-1">✏️</span>
                                                    编辑
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
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

                    {filteredItems.length === 0 && (
                        <div className="text-center py-16">
                            <div className="text-gray-400 text-8xl mb-6">🎁</div>
                            <h3 className="text-2xl font-bold text-gray-600 mb-4">暂无商品</h3>
                            <p className="text-gray-500 mb-8 text-lg">这个盲盒还没有添加任何商品，开始添加您的第一个商品吧！</p>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="px-8 py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-2xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-btn"
                            >
                                <span className="flex items-center">
                                    <span className="mr-2">✨</span>
                                    添加第一个商品
                                </span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Create Modal */}
                {showCreateForm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                                    <span className="mr-3">✨</span>
                                    添加商品
                                </h3>
                                <button
                                    onClick={() => setShowCreateForm(false)}
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                        <span className="mr-2">🎯</span>
                                        商品名称
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.name}
                                        onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-lg hover:border-gray-300"
                                    />
                                </div>
                                <div>
                                    <label className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                        <span className="mr-2">🖼️</span>
                                        商品图片URL
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.image}
                                        onChange={(e) => setCreateForm({...createForm, image: e.target.value})}
                                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-lg hover:border-gray-300"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                            <span className="mr-2">⭐</span>
                                            稀有度
                                        </label>
                                        <select
                                            value={createForm.rarity}
                                            onChange={(e) => setCreateForm({...createForm, rarity: parseInt(e.target.value)})}
                                            className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-lg hover:border-gray-300"
                                        >
                                            <option value={1}>🟢 普通</option>
                                            <option value={2}>🔵 稀有</option>
                                            <option value={3}>🟣 隐藏</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                            <span className="mr-2">🎲</span>
                                            概率 (0-1)
                                        </label>
                                        <input
                                            type="number"
                                            value={createForm.probability}
                                            onChange={(e) => setCreateForm({...createForm, probability: parseFloat(e.target.value) || 0})}
                                            step="0.01"
                                            min="0"
                                            max="1"
                                            className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-lg hover:border-gray-300"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => setShowCreateForm(false)}
                                    className="px-8 py-4 border-2 border-gray-300 rounded-2xl text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold text-lg"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleCreateItem}
                                    className="px-8 py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-2xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-btn"
                                >
                                    <span className="flex items-center">
                                        <span className="mr-2">✨</span>
                                        创建
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {editingItem && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                                    <span className="mr-3">✏️</span>
                                    编辑商品
                                </h3>
                                <button
                                    onClick={() => setEditingItem(null)}
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-lg font-semibold text-gray-800 mb-3 flex items-center" htmlFor="edit-name">
                                        <span className="mr-2">🎯</span>
                                        商品名称
                                    </label>
                                    <input
                                        id="edit-name"
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-lg hover:border-gray-300"
                                        required
                                        aria-required="true"
                                    />
                                </div>
                                <div>
                                    <label className="text-lg font-semibold text-gray-800 mb-3 flex items-center" htmlFor="edit-image">
                                        <span className="mr-2">🖼️</span>
                                        商品图片URL
                                    </label>
                                    <input
                                        id="edit-image"
                                        type="text"
                                        value={editForm.image}
                                        onChange={(e) => setEditForm({...editForm, image: e.target.value})}
                                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-lg hover:border-gray-300"
                                        required
                                        aria-required="true"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-lg font-semibold text-gray-800 mb-3 flex items-center" htmlFor="edit-rarity">
                                            <span className="mr-2">⭐</span>
                                            稀有度
                                        </label>
                                        <select
                                            id="edit-rarity"
                                            value={editForm.rarity}
                                            onChange={(e) => setEditForm({...editForm, rarity: parseInt(e.target.value)})}
                                            className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-lg hover:border-gray-300"
                                        >
                                            <option value={1}>🟢 普通</option>
                                            <option value={2}>🔵 稀有</option>
                                            <option value={3}>🟣 隐藏</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-lg font-semibold text-gray-800 mb-3 flex items-center" htmlFor="edit-probability">
                                            <span className="mr-2">🎲</span>
                                            概率 (0-1)
                                        </label>
                                        <input
                                            id="edit-probability"
                                            type="number"
                                            value={editForm.probability}
                                            onChange={(e) => setEditForm({...editForm, probability: parseFloat(e.target.value) || 0})}
                                            step="0.01"
                                            min="0"
                                            max="1"
                                            className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-lg hover:border-gray-300"
                                            required
                                            aria-required="true"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => setEditingItem(null)}
                                    className="px-8 py-4 border-2 border-gray-300 rounded-2xl text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold text-lg"
                                    title="取消编辑"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className={`px-8 py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-2xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-btn ${
                                        !editForm.name || !editForm.image || editForm.probability < 0 || editForm.probability > 1 ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                    disabled={
                                        !editForm.name || !editForm.image || editForm.probability < 0 || editForm.probability > 1
                                    }
                                    title={!editForm.name ? '请输入商品名称' : !editForm.image ? '请输入图片URL' : (editForm.probability < 0 || editForm.probability > 1) ? '概率需在0-1之间' : '保存'}
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

export default ManageBoxItems; 