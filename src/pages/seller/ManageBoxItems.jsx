import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const ManageBoxItems = () => {
    const navigate = useNavigate();
    const { blindBoxId } = useParams();
    const [boxItems, setBoxItems] = useState([]);
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

    const fetchBlindBox = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:7001/api/blindbox/${blindBoxId}`, {
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
            const response = await axios.get(`http://localhost:7001/api/blindbox/${blindBoxId}/items`, {
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

    useEffect(() => {
        fetchBlindBox();
        fetchBoxItems();
    }, [fetchBlindBox, fetchBoxItems]);

    const handleCreateItem = async () => {
        try {
            const response = await axios.post('http://localhost:7001/api/blindbox/items', {
                ...createForm,
                blind_box_id: parseInt(blindBoxId)
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.code === 200) {
                alert('创建成功！');
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
            alert(error.response?.data?.message || '创建失败，请重试');
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
            const response = await axios.put(
                `http://localhost:7001/api/blindbox/items/${editingItem.id}`,
                { ...editForm, id: editingItem.id }, // 确保包含id字段
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            if (response.data.code === 200) {
                alert('更新成功！');
                setEditingItem(null);
                fetchBoxItems();
            }
        } catch (error) {
            console.error('更新失败:', error);
            alert(error.response?.data?.message || '更新失败，请重试');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('确定要删除这个商品吗？此操作不可恢复。')) {
            return;
        }

        try {
            const response = await axios.delete(`http://localhost:7001/api/blindbox/items/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.code === 200) {
                alert('删除成功！');
                fetchBoxItems();
            }
        } catch (error) {
            console.error('删除失败:', error);
            alert(error.response?.data?.message || '删除失败，请重试');
        }
    };

    const getRarityText = (rarity) => {
        switch (rarity) {
            case 1: return '普通';
            case 2: return '稀有';
            case 3: return '史诗';
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">加载中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/seller/blindbox/manage')}
                        className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        返回盲盒管理
                    </button>
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">商品管理</h1>
                            <p className="text-gray-600 mt-2">
                                {blindBox ? `管理盲盒"${blindBox.name}"的商品` : '管理盲盒商品'}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                        >
                            添加商品
                        </button>
                    </div>
                </div>

                {/* Blind Box Info */}
                {blindBox && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <div className="flex items-center">
                            <img
                                src={blindBox.cover_image}
                                alt={blindBox.name}
                                className="w-20 h-20 object-cover rounded-lg mr-4"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/80x80?text=图片';
                                }}
                            />
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">{blindBox.name}</h2>
                                <p className="text-gray-600">{blindBox.description}</p>
                                <div className="flex items-center space-x-4 mt-2">
                                    <span className="text-sm text-gray-500">价格: ¥{blindBox.price}</span>
                                    <span className="text-sm text-gray-500">库存: {blindBox.stock}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                        blindBox.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {blindBox.status === 1 ? '上架中' : '已下架'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Box Items Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        商品信息
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        稀有度
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        概率
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {boxItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-16 h-16 object-cover rounded-lg mr-4"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/64x64?text=图片';
                                                    }}
                                                />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {item.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRarityColor(item.rarity)}`}>
                                                {getRarityText(item.rarity)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {(item.probability * 100).toFixed(1)}%
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                编辑
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                删除
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {boxItems.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">🎁</div>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无商品</h3>
                            <p className="text-gray-500 mb-4">这个盲盒还没有添加任何商品</p>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
                            >
                                添加第一个商品
                            </button>
                        </div>
                    )}
                </div>

                {/* Create Modal */}
                {showCreateForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-xl font-bold mb-4">添加商品</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">商品名称</label>
                                    <input
                                        type="text"
                                        value={createForm.name}
                                        onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">商品图片URL</label>
                                    <input
                                        type="text"
                                        value={createForm.image}
                                        onChange={(e) => setCreateForm({...createForm, image: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">稀有度</label>
                                        <select
                                            value={createForm.rarity}
                                            onChange={(e) => setCreateForm({...createForm, rarity: parseInt(e.target.value)})}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value={1}>普通</option>
                                            <option value={2}>稀有</option>
                                            <option value={3}>史诗</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">概率 (0-1)</label>
                                        <input
                                            type="number"
                                            value={createForm.probability}
                                            onChange={(e) => setCreateForm({...createForm, probability: parseFloat(e.target.value) || 0})}
                                            step="0.01"
                                            min="0"
                                            max="1"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    onClick={() => setShowCreateForm(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleCreateItem}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                                >
                                    创建
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {editingItem && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-xl font-bold mb-4">编辑商品</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="edit-name">商品名称</label>
                                    <input
                                        id="edit-name"
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                        aria-required="true"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="edit-image">商品图片URL</label>
                                    <input
                                        id="edit-image"
                                        type="text"
                                        value={editForm.image}
                                        onChange={(e) => setEditForm({...editForm, image: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                        aria-required="true"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="edit-rarity">稀有度</label>
                                        <select
                                            id="edit-rarity"
                                            value={editForm.rarity}
                                            onChange={(e) => setEditForm({...editForm, rarity: parseInt(e.target.value)})}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value={1}>普通</option>
                                            <option value={2}>稀有</option>
                                            <option value={3}>史诗</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="edit-probability">概率 (0-1)</label>
                                        <input
                                            id="edit-probability"
                                            type="number"
                                            value={editForm.probability}
                                            onChange={(e) => setEditForm({...editForm, probability: parseFloat(e.target.value) || 0})}
                                            step="0.01"
                                            min="0"
                                            max="1"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                            aria-required="true"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    onClick={() => setEditingItem(null)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    title="取消编辑"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className={`px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg ${
                                        !editForm.name || !editForm.image || editForm.probability < 0 || editForm.probability > 1 ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                    disabled={
                                        !editForm.name || !editForm.image || editForm.probability < 0 || editForm.probability > 1
                                    }
                                    title={!editForm.name ? '请输入商品名称' : !editForm.image ? '请输入图片URL' : (editForm.probability < 0 || editForm.probability > 1) ? '概率需在0-1之间' : '保存'}
                                >
                                    保存
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