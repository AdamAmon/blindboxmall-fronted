import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BlindBoxList = () => {
    const navigate = useNavigate();
    const [blindBoxes, setBlindBoxes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterStatus, setFilterStatus] = useState(1); // 1: 上架, 0: 下架

    useEffect(() => {
        fetchBlindBoxes();
    }, [currentPage, searchKeyword, filterStatus]);

    const fetchBlindBoxes = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:7001/api/blindbox', {
                params: {
                    page: currentPage,
                    limit: 12,
                    keyword: searchKeyword,
                    status: filterStatus
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
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
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

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">盲盒商城</h1>
                    <p className="text-gray-600">探索神秘的盲盒世界，发现独特的收藏品</p>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-64">
                            <input
                                type="text"
                                placeholder="搜索盲盒名称..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(Number(e.target.value))}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value={1}>上架中</option>
                            <option value={0}>已下架</option>
                        </select>
                        
                        <button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            搜索
                        </button>
                    </form>
                </div>

                {/* Blind Box Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {blindBoxes.map((blindBox) => (
                        <div
                            key={blindBox.id}
                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => navigate(`/blindbox/${blindBox.id}`)}
                        >
                            <div className="relative">
                                <img
                                    src={blindBox.cover_image}
                                    alt={blindBox.name}
                                    className="w-full h-48 object-cover"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/300x200?text=盲盒图片';
                                    }}
                                />
                                <div className="absolute top-2 right-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                        blindBox.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {blindBox.status === 1 ? '上架中' : '已下架'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
                                    {blindBox.name}
                                </h3>
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                    {blindBox.description}
                                </p>
                                
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-2xl font-bold text-purple-600">
                                        ¥{blindBox.price}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        库存: {blindBox.stock}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">
                                        评论: {blindBox.comment_count}
                                    </span>
                                    <button
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/blindbox/${blindBox.id}`);
                                        }}
                                    >
                                        查看详情
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
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

                {blindBoxes.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无盲盒</h3>
                        <p className="text-gray-500">暂时没有找到符合条件的盲盒</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlindBoxList; 