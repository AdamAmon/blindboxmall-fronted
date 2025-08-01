import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import { toast } from 'react-toastify';
import { useUser } from '../../hooks/useUser';

const BlindBoxDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blindBox, setBlindBox] = useState(null);
    const [boxItems, setBoxItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [drawQuantity, setDrawQuantity] = useState(1);
    const [selectedTab, setSelectedTab] = useState('info'); // 'info' | 'items' | 'comments'
    const [comments, setComments] = useState([]);
    const [commentLoading, setCommentLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [commentTotal, setCommentTotal] = useState(0);
    const [replyTo, setReplyTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const user = useUser();



    const fetchBlindBoxDetail = useCallback(async () => {
        try {
            const response = await api.get(`/api/blindbox/${id}`);
            if (response.data.code === 200) {
                setBlindBox(response.data.data);
            }
        } catch (error) {
            console.error('获取盲盒详情失败:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchBoxItems = useCallback(async () => {
        try {
            const response = await api.get(`/api/blindbox/${id}/items`);
            if (response.data.code === 200) {
                setBoxItems(response.data.data);
            }
        } catch (error) {
            console.error('获取盲盒商品失败:', error);
        }
    }, [id]);

    useEffect(() => {
        fetchBlindBoxDetail();
        fetchBoxItems();
    }, [fetchBlindBoxDetail, fetchBoxItems]);

    // 获取评论列表
    const fetchComments = useCallback(async (page = 1) => {
        setCommentLoading(true);
        try {
            const response = await api.get('/api/blindbox/comment/list', {
                params: { 
                    blind_box_id: parseInt(id),
                    page, 
                    limit: 10 
                }
            });
            if (response.data.code === 200) {
                setComments(response.data.data.list);
                setCommentTotal(response.data.data.total);
            }
        } catch (error) {
            console.error('获取评论失败:', error);
            toast.error('获取评论失败');
        } finally {
            setCommentLoading(false);
        }
    }, [id]);

    // 发布评论
    const handleSubmitComment = async () => {
        // 重新获取用户信息
        const userStr = localStorage.getItem('user');
        const currentUser = userStr ? JSON.parse(userStr) : null;
        const token = localStorage.getItem('token');
        
        if (!currentUser || !token) {
            toast.error('请先登录');
            navigate('/login');
            return;
        }
        
        if (!newComment.trim()) {
            toast.error('请输入评论内容');
            return;
        }
        
        try {
            const response = await api.post('/api/blindbox/comment', {
                blind_box_id: parseInt(id),
                content: newComment.trim()
            });
            
            if (response.data.code === 200) {
                toast.success('评论发布成功');
                setNewComment('');
                
                // 将新评论添加到列表顶部
                const newCommentData = response.data.data;
                setComments(prevComments => [newCommentData, ...prevComments]);
                setCommentTotal(prevTotal => prevTotal + 1);
                
                // 同时更新盲盒的评论计数
                if (blindBox) {
                    setBlindBox(prev => ({
                        ...prev,
                        comment_count: (prev.comment_count || 0) + 1
                    }));
                }
                
                // 重新获取评论列表以确保数据同步
                setTimeout(() => {
                    fetchComments(1);
                }, 1000);
            } else {
                toast.error(response.data.message || '发布评论失败');
            }
        } catch (error) {
            console.error('发布评论失败:', error);
            console.error('错误详情:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers
            });
            
            if (error.response?.status === 401) {
                toast.error('登录状态已过期，请重新登录');
                navigate('/login');
            } else {
                toast.error(error.response?.data?.message || '发布评论失败');
            }
        }
    };

    // 点赞评论
    const handleLikeComment = async (commentId) => {
        const userStr = localStorage.getItem('user');
        const currentUser = userStr ? JSON.parse(userStr) : null;
        const token = localStorage.getItem('token');
        
        if (!currentUser || !token) {
            toast.error('请先登录');
            navigate('/login');
            return;
        }

        try {
            const response = await api.post('/api/blindbox/comment/like', {
                comment_id: commentId
            });

            if (response.data.code === 200) {
                // 更新评论的点赞状态
                setComments(prevComments => 
                    prevComments.map(comment => 
                        comment.id === commentId 
                            ? { 
                                ...comment, 
                                like_count: response.data.data.liked 
                                    ? (comment.like_count || 0) + 1 
                                    : Math.max(0, (comment.like_count || 0) - 1)
                              }
                            : comment
                    )
                );
                toast.success(response.data.data.liked ? '点赞成功' : '取消点赞成功');
            }
        } catch (error) {
            console.error('点赞失败:', error);
            toast.error('操作失败');
        }
    };

    // 回复评论
    const handleReplyComment = async (parentComment) => {
        const userStr = localStorage.getItem('user');
        const currentUser = userStr ? JSON.parse(userStr) : null;
        const token = localStorage.getItem('token');
        
        if (!currentUser || !token) {
            toast.error('请先登录');
            navigate('/login');
            return;
        }
        if (!replyContent.trim()) {
            toast.error('请输入回复内容');
            return;
        }

        try {
            const response = await api.post('/api/blindbox/comment', {
                blind_box_id: parseInt(id),
                content: replyContent.trim(),
                parent_id: parentComment.id
            });

            if (response.data.code === 200) {
                toast.success('回复成功');
                setReplyContent('');
                setReplyTo(null);
                
                // 重新获取评论列表以显示回复
                setTimeout(() => {
                    fetchComments(1);
                }, 500);
            }
        } catch {
            toast.error('回复失败');
        }
    };

    // 当切换到评论标签页时获取评论
    useEffect(() => {
        if (selectedTab === 'comments') {
            fetchComments(1);
        }
    }, [selectedTab, fetchComments]);

    // 加入购物车逻辑
    const handleAddToCart = async () => {
        const userStr = localStorage.getItem('user');
        const currentUser = userStr ? JSON.parse(userStr) : null;
        const token = localStorage.getItem('token');
        
        if (!currentUser || !token) {
            toast.error('请先登录');
            navigate('/login');
            return;
        }
        try {
            await api.post('/api/cart/add', {
                user_id: currentUser.id,
                blind_box_id: parseInt(id),
                quantity: drawQuantity
            });
            toast.success('已加入购物车');
        } catch {
            toast.error('加入购物车失败');
        }
    };

    const getRarityColor = (rarity) => {
        switch (rarity) {
            case 1: return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
            case 2: return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white';
            case 3: return 'bg-gradient-to-r from-purple-500 to-pink-600 text-white';
            default: return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
        }
    };

    const getRarityText = (rarity) => {
        switch (rarity) {
            case 1: return '⭐ 普通';
            case 2: return '💎 稀有';
            case 3: return '🌟 隐藏';
            default: return '⭐ 普通';
        }
    };

    const getRarityBgColor = (rarity) => {
        switch (rarity) {
            case 1: return 'from-green-50 to-emerald-50 border-green-200';
            case 2: return 'from-blue-50 to-indigo-50 border-blue-200';
            case 3: return 'from-purple-50 to-pink-50 border-purple-200';
            default: return 'from-green-50 to-emerald-50 border-green-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400 animate-ping"></div>
                    </div>
                    <p className="mt-6 text-lg text-gray-600 font-medium">正在加载盲盒详情...</p>
                    <p className="mt-2 text-sm text-gray-500">精彩内容马上呈现</p>
                </div>
            </div>
        );
    }

    if (!blindBox) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-3xl mb-6">
                        <span className="text-4xl">❌</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-700 mb-4">盲盒不存在</h2>
                    <p className="text-gray-500 text-lg mb-8">该盲盒可能已被删除或下架</p>
                    <button
                        onClick={() => navigate('/blindboxes')}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                        返回盲盒列表
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* 返回按钮 */}
                <button
                    onClick={() => navigate('/blindboxes')}
                    className="flex items-center text-gray-600 hover:text-purple-600 mb-8 transition-colors duration-200 group"
                >
                    <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-medium">返回盲盒列表</span>
                </button>

                {/* 主要内容区域 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 左侧：盲盒图片 */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 overflow-hidden sticky top-8">
                            <div className="relative aspect-square overflow-hidden">
                                <img
                                    src={blindBox.cover_image}
                                    alt={blindBox.name}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/500x500?text=盲盒图片';
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                
                                {/* 状态标签 */}
                                <div className="absolute top-4 right-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold shadow-lg ${
                                        blindBox.status === 1 
                                            ? 'bg-green-500/90 text-white backdrop-blur-sm' 
                                            : 'bg-red-500/90 text-white backdrop-blur-sm'
                                    }`}>
                                        {blindBox.status === 1 ? '🟢 上架' : '🔴 下架'}
                                    </span>
                                </div>

                                {/* 价格标签 */}
                                <div className="absolute bottom-4 left-4">
                                    <span className="px-4 py-2 bg-purple-600/90 text-white rounded-full text-xl font-bold backdrop-blur-sm shadow-lg">
                                        ¥{blindBox.price}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 右侧：盲盒信息和操作 */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-8">
                            {/* 标题和描述 */}
                            <div className="mb-8">
                                <h1 className="text-4xl font-bold text-gray-800 mb-4">{blindBox.name}</h1>
                            </div>

                            {/* 统计信息 */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-200">
                                    <div className="text-2xl font-bold text-purple-600 mb-1">¥{blindBox.price}</div>
                                    <div className="text-sm text-gray-600">价格</div>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                                    <div className="text-2xl font-bold text-green-600 mb-1">{blindBox.stock}</div>
                                    <div className="text-sm text-gray-600">库存</div>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                                    <div className="text-2xl font-bold text-blue-600 mb-1">{boxItems.length}</div>
                                    <div className="text-sm text-gray-600">商品数</div>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-200">
                                    <div className="text-2xl font-bold text-orange-600 mb-1">{blindBox.comment_count || 0}</div>
                                    <div className="text-sm text-gray-600">评论</div>
                                </div>
                            </div>

                            {/* 操作区域 */}
                            {blindBox.status === 1 && blindBox.stock > 0 && (
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 mb-8">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                        <span className="mr-2">🛒</span>
                                        加入购物车
                                    </h3>
                                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            <label className="text-gray-700 font-medium">数量:</label>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setDrawQuantity(Math.max(1, drawQuantity - 1))}
                                                    className="w-8 h-8 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center hover:border-green-500 transition-colors"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                value={drawQuantity}
                                                    onChange={(e) => {
                                                        const value = parseInt(e.target.value) || 1;
                                                        const maxStock = Math.min(blindBox.stock, 99); // 限制最大99个
                                                        setDrawQuantity(Math.max(1, Math.min(value, maxStock)));
                                                    }}
                                                    min="1"
                                                    max={Math.min(blindBox.stock, 99)}
                                                    className="w-16 h-8 text-center border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white/70 backdrop-blur-sm font-medium"
                                                />
                                                <button
                                                    onClick={() => {
                                                        const maxStock = Math.min(blindBox.stock, 99);
                                                        setDrawQuantity(Math.min(maxStock, drawQuantity + 1));
                                                    }}
                                                    className="w-8 h-8 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center hover:border-green-500 transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                库存: {blindBox.stock} 个
                                            </span>
                                        </div>
                                        <div className="text-lg font-bold text-green-600">
                                            总价: ¥{(blindBox.price * drawQuantity).toFixed(2)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleAddToCart}
                                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <span>🛒</span>
                                        加入购物车
                                    </button>
                                </div>
                            )}

                            {blindBox.stock === 0 && (
                                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border border-red-200 mb-8">
                                    <div className="text-center">
                                        <div className="text-4xl mb-4">😔</div>
                                        <div className="text-xl font-bold text-red-600 mb-2">库存不足</div>
                                        <div className="text-gray-600">暂时无法购买，请稍后再试</div>
                                    </div>
                                </div>
                            )}

                            {/* 标签页切换 */}
                            <div className="border-b border-gray-200 mb-6">
                                <div className="flex space-x-8">
                                    <button
                                        onClick={() => setSelectedTab('info')}
                                        className={`pb-4 px-2 font-semibold text-lg transition-colors duration-200 ${
                                            selectedTab === 'info'
                                                ? 'text-purple-600 border-b-2 border-purple-600'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        📋 盲盒信息
                                    </button>
                                    <button
                                        onClick={() => setSelectedTab('items')}
                                        className={`pb-4 px-2 font-semibold text-lg transition-colors duration-200 ${
                                            selectedTab === 'items'
                                                ? 'text-purple-600 border-b-2 border-purple-600'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        🎁 盲盒商品 ({boxItems.length})
                                    </button>
                                    <button
                                        onClick={() => setSelectedTab('comments')}
                                        className={`pb-4 px-2 font-semibold text-lg transition-colors duration-200 ${
                                            selectedTab === 'comments'
                                                ? 'text-purple-600 border-b-2 border-purple-600'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        💬 评论 ({blindBox.comment_count || 0})
                                    </button>
                                </div>
                            </div>

                            {/* 标签页内容 */}
                            {selectedTab === 'info' && (
                                <div className="space-y-4">
                                    {/* 盲盒描述 */}
                                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                        <div className="text-sm text-gray-500 mb-2 font-medium">盲盒介绍</div>
                                        <div className="text-gray-700 leading-relaxed">{blindBox.description || '暂无描述'}</div>
                                    </div>
                                    
                                    {/* 基本信息 */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <div className="text-sm text-gray-500 mb-1">创建时间</div>
                                            <div className="font-medium">{new Date(blindBox.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <div className="text-sm text-gray-500 mb-1">更新时间</div>
                                            <div className="font-medium">{new Date(blindBox.updated_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedTab === 'items' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {boxItems.map((item) => (
                                        <div 
                                            key={item.id} 
                                            className={`group bg-gradient-to-br ${getRarityBgColor(item.rarity)} rounded-2xl p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border`}
                                        >
                                            <div className="text-center">
                                                <div className="relative mb-4">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-24 h-24 object-cover mx-auto rounded-xl group-hover:scale-105 transition-transform duration-300"
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/96x96?text=商品图片';
                                                        }}
                                                    />
                                                    <div className="absolute -top-2 -right-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getRarityColor(item.rarity)}`}>
                                                            {getRarityText(item.rarity)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{item.name}</h3>
                                                <div className="text-sm text-gray-600 font-medium">
                                                    概率: {(item.probability * 100).toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {selectedTab === 'comments' && (
                                <div className="space-y-6">
                                    {/* 评论数量统计 */}
                                    <div className="flex items-center justify-between py-4 border-b border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-bold text-gray-800 font-brand">评论</span>
                                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                {commentTotal} 条
                                            </span>
                                        </div>
                                        {comments.length > 0 && (
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                <span>实时更新</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* 发布评论区域 */}
                                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                        {!user ? (
                                            <div className="text-center py-8">
                                                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                                                    🔒
                                                </div>
                                                <p className="text-gray-600 mb-4 font-brand">请先登录后再发表评论</p>
                                                <button
                                                    onClick={() => navigate('/login')}
                                                    className="px-6 py-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn"
                                                >
                                                    立即登录
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-4">
                                                {/* 用户头像 */}
                                                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                    {user.nickname?.charAt(0) || 'U'}
                                                </div>
                                                
                                                {/* 评论输入区域 */}
                                                <div className="flex-1">
                                                    <div className="relative">
                                                        <textarea
                                                            value={newComment}
                                                            onChange={(e) => setNewComment(e.target.value)}
                                                            placeholder="发一条友善的评论"
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none font-brand text-left"
                                                            rows="3"
                                                            maxLength={500}
                                                        />
                                                        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                                                            {newComment.length}/500
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex justify-between items-center mt-3">
                                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                                            <span>文明发言，理性讨论</span>
                                                        </div>
                                                        <button
                                                            onClick={handleSubmitComment}
                                                            disabled={!newComment.trim() || commentLoading}
                                                            className="px-6 py-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 disabled:bg-gray-300 text-white rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn disabled:cursor-not-allowed flex items-center gap-2"
                                                        >
                                                            {commentLoading ? (
                                                                <>
                                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                                    发布中
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span>📤</span>
                                                                    发布评论
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* 评论列表 */}
                                    {commentLoading ? (
                                        <div className="text-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
                                            <p className="mt-4 text-gray-600 font-brand">加载评论中...</p>
                                        </div>
                                    ) : comments.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                                                💭
                                            </div>
                                            <p className="text-gray-600 font-brand">暂无评论，快来发表第一条评论吧！</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {comments.map((comment, index) => (
                                                <div key={comment.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:bg-gray-50 transition-colors shadow-sm">
                                                    <div className="flex gap-3">
                                                        {/* 用户头像 */}
                                                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                            {comment.user?.nickname?.charAt(0) || 'U'}
                                                        </div>
                                                        
                                                        <div className="flex-1 min-w-0">
                                                            {/* 用户信息和时间 */}
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="font-bold text-gray-800 font-brand">
                                                                    {comment.user?.nickname || '匿名用户'}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    {new Date(comment.created_at).toLocaleString()}
                                                                </span>
                                                                {index === 0 && (
                                                                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                                                                        沙发
                                                                    </span>
                                                                )}
                                                            </div>
                                                            
                                                            {/* 评论内容 - 确保左对齐 */}
                                                            <div className="mb-3 text-left">
                                                                <p className="text-gray-700 leading-relaxed font-brand text-left">
                                                                    {comment.content}
                                                                </p>
                                                            </div>
                                                            
                                                            {/* 操作按钮 */}
                                                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                                                <button 
                                                                    onClick={() => handleLikeComment(comment.id)}
                                                                    className="flex items-center gap-1 hover:text-primary transition-colors"
                                                                >
                                                                    <span>👍</span>
                                                                    <span>{comment.like_count || 0}</span>
                                                                </button>
                                                                <button 
                                                                    onClick={() => setReplyTo(comment)}
                                                                    className="flex items-center gap-1 hover:text-primary transition-colors"
                                                                >
                                                                    <span>💬</span>
                                                                    <span>回复</span>
                                                                </button>
                                                            </div>

                                                            {/* 回复表单 */}
                                                            {replyTo?.id === comment.id && (
                                                                <div className="mt-4 p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl">
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <span className="text-sm text-gray-600 font-brand">
                                                                            回复 @{comment.user?.nickname || '匿名用户'}
                                                                        </span>
                                                                        <button 
                                                                            onClick={() => setReplyTo(null)}
                                                                            className="text-gray-400 hover:text-gray-600"
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    </div>
                                                                    <div className="flex gap-3">
                                                                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                                                            {user.nickname?.charAt(0) || 'U'}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <textarea
                                                                                value={replyContent}
                                                                                onChange={(e) => setReplyContent(e.target.value)}
                                                                                placeholder="写下你的回复..."
                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none text-sm font-brand text-left"
                                                                                rows="2"
                                                                                maxLength={200}
                                                                            />
                                                                            <div className="flex justify-between items-center mt-2">
                                                                                <span className="text-xs text-gray-500">
                                                                                    {replyContent.length}/200
                                                                                </span>
                                                                                <button
                                                                                    onClick={() => handleReplyComment(comment)}
                                                                                    disabled={!replyContent.trim()}
                                                                                    className="px-4 py-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 disabled:bg-gray-300 text-white rounded-lg text-sm font-bold transition-all duration-200 transform hover:scale-105 shadow-btn"
                                                                                >
                                                                                    发送回复
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* 显示回复 */}
                                                            {comment.replies && comment.replies.length > 0 && (
                                                                <div className="mt-4 space-y-3">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <div className="w-1 h-4 bg-gray-300 rounded-full"></div>
                                                                        <span className="text-xs text-gray-500">回复 ({comment.replies.length})</span>
                                                                    </div>
                                                                    {comment.replies.map((reply) => (
                                                                        <div key={reply.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 ml-4">
                                                                            <div className="flex gap-3">
                                                                                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                                                                    {reply.user?.nickname?.charAt(0) || 'U'}
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <div className="flex items-center gap-2 mb-1">
                                                                                        <span className="font-bold text-sm text-gray-800 font-brand">
                                                                                            {reply.user?.nickname || '匿名用户'}
                                                                                        </span>
                                                                                        <span className="text-xs text-gray-500">
                                                                                            {new Date(reply.created_at).toLocaleString()}
                                                                                        </span>
                                                                                    </div>
                                                                                    <p className="text-sm text-gray-700 font-brand text-left">{reply.content}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlindBoxDetail; 