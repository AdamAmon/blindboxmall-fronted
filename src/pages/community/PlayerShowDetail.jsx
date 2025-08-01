import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import { toast } from 'react-toastify';

const PlayerShowDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [replyTo, setReplyTo] = useState(null); // 移除 commentLikes 状态
  const [replyContent, setReplyContent] = useState('');

  const fetchShowDetail = useCallback(async () => {
    try {
      setLoading(true);
      // 获取玩家秀详情
      const showResponse = await api.get(`/api/community/show/detail`, { params: { id } });
      if (showResponse.data.success) {
        const showData = showResponse.data.data;
        
        // 获取评论列表
        try {
          const commentsResponse = await api.get(`/api/community/show/comments`, { params: { show_id: id } });
          if (commentsResponse.data.success) {
            showData.comments = commentsResponse.data.data;
          } else {
            showData.comments = [];
          }
        } catch (error) {
          console.error('获取评论失败:', error);
          showData.comments = [];
        }
        
        setShow(showData);
      } else {
        setError(showResponse.data.message || '获取玩家秀详情失败');
      }
    } catch (error) {
      console.error('获取玩家秀详情失败:', error);
      setError('获取玩家秀详情失败');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchShowDetail();
    // 初始化用户状态
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (error) {
        console.error('解析用户信息失败:', error);
      }
    }
  }, [fetchShowDetail]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast.error('请输入评论内容');
      return;
    }

    if (!user?.id) {
      toast.error('请先登录');
      return;
    }

    setCommentLoading(true);
    try {
      const response = await api.post('/api/community/show/comment', {
        show_id: id,
        content: newComment,
        user_id: user.id
      });

      if (response.data.success) {
        toast.success('评论发表成功');
        setNewComment('');
        fetchShowDetail(); // 重新获取数据以显示新评论
      } else {
        toast.error(response.data.message || '评论发表失败');
      }
    } catch (error) {
      console.error('评论发表失败:', error);
      toast.error('评论发表失败');
    } finally {
      setCommentLoading(false);
    }
  };

  // 修复点赞函数
  const handleLikeComment = async (commentId) => {
    if (!user?.id) {
      toast.error('请先登录');
      return;
    }

    try {
      const response = await api.post('/api/community/show/comment/like', {
        comment_id: commentId
      });

      if (response.data.success) {
        const result = response.data.data;
        // 直接更新本地状态
        setShow(prevShow => {
          if (!prevShow || !prevShow.comments) return prevShow;
          
          const updateCommentLikeCount = (comments) => {
            return comments.map(comment => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  like_count: result.liked 
                    ? (comment.like_count || 0) + 1 
                    : Math.max(0, (comment.like_count || 0) - 1)
                };
              }
              // 递归更新子评论
              if (comment.children && comment.children.length > 0) {
                return {
                  ...comment,
                  children: updateCommentLikeCount(comment.children)
                };
              }
              return comment;
            });
          };
          
          return {
            ...prevShow,
            comments: updateCommentLikeCount(prevShow.comments)
          };
        });
        
        toast.success(result.liked ? '点赞成功' : '取消点赞成功');
      } else {
        toast.error(response.data.message || '操作失败');
      }
    } catch (error) {
      console.error('评论点赞失败:', error);
      toast.error('点赞失败');
    }
  };

  const handleReplyComment = async (parentComment) => {
    if (!user?.id) {
      toast.error('请先登录');
      return;
    }
    
    if (!replyContent.trim()) {
      toast.error('请输入回复内容');
      return;
    }

    try {
      const response = await api.post('/api/community/show/comment', {
        show_id: id,
        content: replyContent.trim(),
        parent_id: parentComment.id,
        user_id: user.id
      });

      if (response.data.success) {
        toast.success('回复成功');
        setReplyContent('');
        setReplyTo(null);
        
        // 重新获取数据以显示回复
        setTimeout(() => {
          fetchShowDetail();
        }, 500);
      } else {
        toast.error(response.data.message || '回复失败');
      }
    } catch (error) {
      console.error('回复失败:', error);
      toast.error('回复失败');
    }
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

  const nextImage = () => {
    if (show?.images && Array.isArray(show.images) && show.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % show.images.length);
    }
  };

  const prevImage = () => {
    if (show?.images && Array.isArray(show.images) && show.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + show.images.length) % show.images.length);
    }
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
            <p className="text-gray-600 font-medium">正在加载玩家秀详情...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !show) {
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
            <h3 className="text-2xl font-bold text-gray-800 mb-2">加载失败</h3>
            <p className="text-gray-600 mb-8">{error || '玩家秀不存在或已被删除'}</p>
            <button
              onClick={() => navigate('/shows')}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-3 rounded-2xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn"
            >
              返回玩家秀列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
        <div className="absolute top-20 left-20 w-40 h-40 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 返回按钮 */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/shows')}
            className="flex items-center px-6 py-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-card border border-white/30 text-gray-700 font-bold transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            返回玩家秀列表
          </button>
        </div>

        {/* 主要内容 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：图片画廊 */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card border border-white/30 overflow-hidden hover:shadow-xl transition-all duration-300">
              {/* 主图片 */}
              <div className="relative w-full h-96 bg-gradient-to-br from-primary/10 to-secondary/10">
                {show.images && Array.isArray(show.images) && show.images.length > 0 ? (
                  <img
                    src={show.images[currentImageIndex]}
                    alt={`玩家秀图片 ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
                    onClick={() => setShowImageModal(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                )}

                {/* 图片导航按钮 */}
                {show.images && Array.isArray(show.images) && show.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all duration-200"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all duration-200"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>
                  </>
                )}

                {/* 图片指示器 */}
                {show.images && Array.isArray(show.images) && show.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {show.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* 缩略图 */}
              {show.images && Array.isArray(show.images) && show.images.length > 1 && (
                <div className="p-4 bg-gray-50">
                  <div className="flex space-x-2 overflow-x-auto">
                    {show.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                          index === currentImageIndex ? 'border-primary' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`缩略图 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：内容信息 */}
          <div className="space-y-6">
            {/* 用户信息卡片 */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card border border-white/30 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-4 mb-4">
                {/* 修复：添加文字阴影样式 */}
                <div 
                  className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                >
                  {show.user_id ? show.user_id.toString().charAt(0) : 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {show.user?.nickname || `用户 ${show.user_id}`}
                  </h3>
                  <p className="text-sm text-gray-500">{formatDate(show.created_at)}</p>
                </div>
              </div>

              {/* 奖品信息 */}
              {show.item && (
                <div className="p-3 bg-gradient-to-r from-green-500/10 to-emerald-600/10 rounded-xl border border-green-500/20 mt-3">
                  <div className="flex items-center text-sm text-green-600 font-medium">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
                    </svg>
                    获得奖品: {show.item.name}
                  </div>
                </div>
              )}
              
              {/* 订单信息 */}
              {show.order_item_id && (
                <div className="p-3 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-xl border border-blue-500/20 mt-3">
                  <div className="flex items-center text-sm text-blue-600 font-medium">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    订单项ID: {show.order_item_id}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 内容描述 */}
        <div className="mt-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card border border-white/30 p-6 hover:shadow-xl transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 font-brand">内容描述</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {show.content || '暂无描述'}
              </p>
            </div>
          </div>
        </div>

        {/* 评论区 */}
        <div className="mt-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card border border-white/30 p-6 hover:shadow-xl transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 font-brand">评论区</h2>
            
            {/* 发表评论 */}
            <div className="mb-8">
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
                  {/* 用户头像 - 修复：添加文字阴影样式 */}
                  <div 
                    className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                  >
                    {user?.nickname?.charAt(0) || 'U'}
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
            ) : show.comments && show.comments.length > 0 ? (
              <div className="space-y-4">
                {show.comments.map((comment, index) => (
                  <div key={comment.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:bg-gray-50 transition-colors shadow-sm">
                    <div className="flex gap-3">
                      {/* 用户头像 - 修复：添加文字阴影样式 */}
                      <div 
                        className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                      >
                        {comment.user?.nickname?.charAt(0) || 'U'}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* 用户信息和时间 */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-gray-800 font-brand">
                            {comment.user?.nickname || '匿名用户'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(comment.created_at)}
                          </span>
                          {index === 0 && (
                            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                              沙发
                            </span>
                          )}
                        </div>
                        
                        {/* 评论内容 */}
                        <div className="mb-3 text-left">
                          <p className="text-gray-700 leading-relaxed font-brand text-left">
                            {comment.content}
                          </p>
                        </div>
                        
                        {/* 操作按钮 - 修复：使用 comment.like_count */}
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
                              {/* 回复头像 - 修复：添加文字阴影样式 */}
                              <div 
                                className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                              >
                                {user?.nickname?.charAt(0) || 'U'}
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
                        {comment.children && comment.children.length > 0 && (
                          <div className="mt-4 space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-1 h-4 bg-gray-300 rounded-full"></div>
                              <span className="text-xs text-gray-500">回复 ({comment.children.length})</span>
                            </div>
                            {comment.children.map((reply) => (
                              <div key={reply.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 ml-4">
                                <div className="flex gap-3">
                                  {/* 回复头像 - 修复：添加文字阴影样式 */}
                                  <div 
                                    className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                                  >
                                    {reply.user?.nickname?.charAt(0) || 'U'}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-bold text-sm text-gray-800 font-brand">
                                        {reply.user?.nickname || '匿名用户'}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {formatDate(reply.created_at)}
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
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  💭
                </div>
                <p className="text-gray-600 font-brand">暂无评论，快来发表第一条评论吧！</p>
              </div>
            )}
          </div>
        </div>

        {/* 图片模态框 */}
        {showImageModal && show.images && Array.isArray(show.images) && show.images.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl max-h-full">
              <img
                src={show.images[currentImageIndex]}
                alt={`玩家秀图片 ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
              
              {/* 关闭按钮 */}
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>

              {/* 导航按钮 */}
              {show.images && Array.isArray(show.images) && show.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-all duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-all duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </>
              )}

              {/* 图片指示器 */}
              {show.images && Array.isArray(show.images) && show.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {show.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerShowDetail;