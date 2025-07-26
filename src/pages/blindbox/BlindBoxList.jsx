import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import BlindBoxFilter from '../../components/BlindBoxFilter';
import BlindBoxTabs from '../../components/BlindBoxTabs';

const BlindBoxList = () => {
    const navigate = useNavigate();
    const [blindBoxes, setBlindBoxes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterStatus, setFilterStatus] = useState(1); // 1: 上架, 0: 下架
    const [categoryStats, setCategoryStats] = useState({});
    // 新增：稀有度Tab
    const [category, setCategory] = useState('all');

    // 新增：筛选条件state
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [rarity, setRarity] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [order, setOrder] = useState('desc');

    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

    const handleAddToCart = async (blindBoxId) => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            await axios.post('/api/cart/add', {
                user_id: user.id,
                blind_box_id: blindBoxId,
                quantity: 1
            });
            toast.success('已加入购物车');
        } catch {
            toast.error('加入购物车失败');
        }
    };

    // 获取热门关键词和分类统计
    useEffect(() => {
        axios.get('/api/blindbox/categories').then(res => setCategoryStats(res.data.data));
    }, []);

    // 修改fetchBlindBoxes，增加多条件参数
    const fetchBlindBoxes = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:7001/api/blindbox', {
                params: {
                    page: currentPage,
                    limit: 12,
                    keyword: searchKeyword,
                    status: filterStatus,
                    category,
                    minPrice: minPrice || undefined,
                    maxPrice: maxPrice || undefined,
                    rarity: rarity || undefined,
                    sortBy: sortBy || 'created_at',
                    order: order || 'desc',
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
    }, [currentPage, searchKeyword, filterStatus, category, minPrice, maxPrice, rarity, sortBy, order]);

    useEffect(() => {
        fetchBlindBoxes();
    }, [fetchBlindBoxes]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // 处理Tab切换
    const handleTabChange = (cat) => {
        setCategory(cat);
        setCurrentPage(1);
    };

    // 处理筛选
    const handleFilter = (filters) => {
        setSearchKeyword(filters.keyword || '');
        setMinPrice(filters.minPrice || '');
        setMaxPrice(filters.maxPrice || '');
        setRarity(filters.rarity || '');
        setFilterStatus(filters.status || 1);
        setSortBy(filters.sortBy || 'created_at');
        setOrder(filters.order || 'desc');
        setCurrentPage(1);
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

                {/* 稀有度Tab */}
                <BlindBoxTabs stats={categoryStats} active={category} onChange={handleTabChange} />
                {/* 搜索和筛选 */}
                <BlindBoxFilter onFilter={handleFilter} defaultValues={{
                    keyword: searchKeyword,
                    minPrice,
                    maxPrice,
                    rarity,
                    status: filterStatus,
                    sortBy,
                    order
                }} />

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
                                    <div className="flex gap-2">
                                        <button
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/blindbox/${blindBox.id}`);
                                            }}
                                        >
                                            查看详情
                                        </button>
                                        <button
                                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddToCart(blindBox.id);
                                            }}
                                        >
                                            加入购物车
                                        </button>
                                    </div>
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