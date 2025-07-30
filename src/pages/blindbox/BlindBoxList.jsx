import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import { toast } from 'react-toastify';
import BlindBoxFilter from '../../components/BlindBoxFilter';
import BlindBoxTabs from '../../components/BlindBoxTabs';
import { useUser } from '../../hooks/useUser';

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

    // 使用自定义 Hook 获取用户信息
    const user = useUser();

    const handleAddToCart = async (blindBoxId) => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            await api.post('/api/cart/add', {
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
        api.get('/api/blindbox/categories').then(res => setCategoryStats(res.data.data));
    }, []);

    // 修改fetchBlindBoxes，增加多条件参数
    const fetchBlindBoxes = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('http://localhost:7001/api/blindbox', {
                params: {
                    page: currentPage,
                    limit: 12, // 调整为合适的数量
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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400 animate-ping"></div>
                    </div>
                    <p className="mt-6 text-lg text-gray-600 font-medium">正在加载盲盒...</p>
                    <p className="mt-2 text-sm text-gray-500">请稍候，精彩内容马上呈现</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl shadow-2xl mb-6">
                        <span className="text-3xl">🎁</span>
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
                        盲盒商城
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        探索神秘的盲盒世界，发现独特的收藏品，体验惊喜的抽盒乐趣
                    </p>
                </div>

                {/* 稀有度Tab */}
                <div className="mb-8">
                    <BlindBoxTabs stats={categoryStats} active={category} onChange={handleTabChange} />
                </div>

                {/* 搜索和筛选 */}
                <div className="mb-8">
                    <BlindBoxFilter onFilter={handleFilter} defaultValues={{
                        keyword: searchKeyword,
                        minPrice,
                        maxPrice,
                        rarity,
                        status: filterStatus,
                        sortBy,
                        order
                    }} />
                </div>

                {/* Blind Box Grid - 修复卡片比例 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {blindBoxes.map((blindBox) => (
                        <div
                            key={blindBox.id}
                            className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-white/20 overflow-hidden"
                            onClick={() => navigate(`/blindbox/${blindBox.id}`)}
                        >
                            {/* 图片区域 - 固定比例 */}
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <img
                                    src={blindBox.cover_image}
                                    alt={blindBox.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/400x300?text=盲盒图片';
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                
                                {/* 状态标签 */}
                                <div className="absolute top-3 right-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold shadow-lg ${
                                        blindBox.status === 1 
                                            ? 'bg-green-500/90 text-white backdrop-blur-sm' 
                                            : 'bg-red-500/90 text-white backdrop-blur-sm'
                                    }`}>
                                        {blindBox.status === 1 ? '🟢 上架' : '🔴 下架'}
                                    </span>
                                </div>

                                {/* 价格标签 */}
                                <div className="absolute bottom-3 left-3">
                                    <span className="px-3 py-1 bg-purple-600/90 text-white rounded-full text-sm font-bold backdrop-blur-sm">
                                        ¥{blindBox.price}
                                    </span>
                                </div>
                            </div>
                            
                            {/* 内容区域 */}
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-purple-600 transition-colors">
                                    {blindBox.name}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                                    {blindBox.description || '暂无描述'}
                                </p>
                                
                                {/* 统计信息 */}
                                <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                        库存: {blindBox.stock}
                                    </span>
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                                        </svg>
                                        评论: {blindBox.comment_count || 0}
                                    </span>
                                </div>
                                
                                {/* 操作按钮 */}
                                <div className="flex gap-2">
                                    <button
                                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/blindbox/${blindBox.id}`);
                                        }}
                                    >
                                        查看详情
                                    </button>
                                    <button
                                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
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
                    ))}
                </div>

                {/* 分页组件 */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-12">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4">
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 font-medium"
                                >
                                    ← 上一页
                                </button>
                                
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-4 py-2 border-2 rounded-xl font-medium transition-all duration-200 ${
                                            currentPage === page
                                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-600 shadow-lg'
                                                : 'border-gray-200 hover:border-purple-500 hover:bg-purple-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 font-medium"
                                >
                                    下一页 →
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 空状态 */}
                {blindBoxes.length === 0 && !loading && (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl mb-6">
                            <span className="text-4xl">📦</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-700 mb-3">暂无盲盒</h3>
                        <p className="text-gray-500 text-lg mb-6">暂时没有找到符合条件的盲盒</p>
                        <button
                            onClick={() => {
                                setSearchKeyword('');
                                setCategory('all');
                                setCurrentPage(1);
                            }}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                            查看全部盲盒
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlindBoxList; 