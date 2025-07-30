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
        } catch (error) {
            console.error('获取盲盒列表失败:', error);
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
        } catch (error) {
            console.error('获取统计数据失败:', error);
        }
    }, []);

    useEffect(() => {
        fetchBlindBoxes();
        fetchStats();
    }, [fetchBlindBoxes, fetchStats]);

    // 权限判断提前
    if (!user || user.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-600 mb-2">无权限访问</h2>
                    <p className="text-gray-500 mb-4">只有管理员用户才能访问此页面</p>
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
            cover_image: blindBox.cover_image,
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
                toast.success('更新成功！');
                setEditingBox(null);
                fetchBlindBoxes();
                fetchStats();
            }
        } catch (error) {
            console.error('更新失败:', error);
            toast.error(error.response?.data?.message || '更新失败，请重试');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('确定要删除这个盲盒吗？此操作不可恢复。')) {
            return;
        }

        try {
            const response = await api.delete(`/api/blindbox/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.code === 200) {
                toast.success('删除成功！');
                fetchBlindBoxes();
                fetchStats();
            }
        } catch (error) {
            console.error('删除失败:', error);
            toast.error(error.response?.data?.message || '删除失败，请重试');
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
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
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">管理员面板</h1>
                    <p className="text-gray-600">欢迎回来，{user.nickname}！在这里管理所有盲盒商品</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalBlindBoxes}</div>
                        <div className="text-gray-600">总盲盒数</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">{stats.activeBlindBoxes}</div>
                        <div className="text-gray-600">上架盲盒</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalItems}</div>
                        <div className="text-gray-600">总商品数</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-orange-600 mb-2">¥{stats.totalSales.toFixed(2)}</div>
                        <div className="text-gray-600">总价值</div>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <input
                            type="text"
                            placeholder="搜索盲盒名称..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            搜索
                        </button>
                    </form>
                </div>

                {/* Blind Boxes Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        盲盒信息
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        价格
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        库存
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        状态
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {blindBoxes.map((blindBox) => (
                                    <tr key={blindBox.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <img
                                                    src={blindBox.cover_image}
                                                    alt={blindBox.name}
                                                    className="w-16 h-16 object-cover rounded-lg mr-4"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/64x64?text=图片';
                                                    }}
                                                />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {blindBox.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                                        {blindBox.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            ¥{blindBox.price}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {blindBox.stock}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                blindBox.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {blindBox.status === 1 ? '上架中' : '已下架'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handleEdit(blindBox)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                编辑
                                            </button>
                                            <button
                                                onClick={() => navigate(`/blindbox/${blindBox.id}`)}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                预览
                                            </button>
                                            <button
                                                onClick={() => handleDelete(blindBox.id)}
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

                    {blindBoxes.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">📦</div>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无盲盒</h3>
                            <p className="text-gray-500">暂时没有盲盒数据</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                上一页
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-4 py-2 border rounded-lg ${
                                        currentPage === page
                                            ? 'bg-purple-600 text-white border-purple-600'
                                            : 'border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                下一页
                            </button>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {editingBox && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-xl font-bold mb-4">编辑盲盒</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">盲盒名称</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">价格</label>
                                        <input
                                            type="number"
                                            value={editForm.price}
                                            onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                                            step="0.01"
                                            min="0"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">库存</label>
                                        <input
                                            type="number"
                                            value={editForm.stock}
                                            onChange={(e) => setEditForm({...editForm, stock: e.target.value})}
                                            min="0"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
                                    <select
                                        value={editForm.status}
                                        onChange={(e) => setEditForm({...editForm, status: parseInt(e.target.value)})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value={1}>上架</option>
                                        <option value={0}>下架</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    onClick={() => setEditingBox(null)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                                >
                                    保存
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Admin Tips */}
                <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-800 mb-3">🔒 管理员权限说明</h3>
                    <ul className="text-red-700 space-y-2">
                        <li>• 您可以查看和管理所有商家创建的盲盒</li>
                        <li>• 可以编辑任何盲盒的信息、价格、库存和状态</li>
                        <li>• 可以删除任何盲盒（请谨慎操作）</li>
                        <li>• 建议定期检查盲盒内容，确保合规性</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard; 