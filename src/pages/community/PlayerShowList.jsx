import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';

const PlayerShowList = () => {
  const [shows, setShows] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchShows = useCallback(async (pageNum = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/community/show/list', { params: { page: pageNum, pageSize } });
      if (res.data.success) {
        setShows(res.data.data.list);
        setTotal(res.data.data.total);
        setPage(res.data.data.page);
      } else {
        setError(res.data.message || '获取玩家秀失败');
      }
    } catch {
      setError('获取玩家秀失败');
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchShows(page);
  }, [fetchShows, page]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= Math.ceil(total / pageSize)) {
      setPage(newPage);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return '今天';
    } else if (diffDays === 2) {
      return '昨天';
    } else if (diffDays <= 7) {
      return `${diffDays - 1}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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
            <p className="text-gray-600 font-medium">正在加载玩家秀...</p>
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
            玩家秀广场
          </h1>
          <div className="flex items-center justify-center space-x-3 text-gray-600">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gray-300"></div>
            <span className="text-lg font-medium">分享您的盲盒开箱体验</span>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gray-300"></div>
          </div>
        </div>

        {/* 创建按钮 */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/shows/create')}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-btn"
          >
            <svg className="w-6 h-6 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            发布玩家秀
          </button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 玩家秀列表 */}
        {shows.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-primary to-secondary rounded-full mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">暂无玩家秀</h3>
            <p className="text-gray-600 mb-8">快来分享您的第一个盲盒开箱体验吧！</p>
            <button
              onClick={() => navigate('/shows/create')}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-3 rounded-2xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn"
            >
              发布玩家秀
            </button>
          </div>
        ) : (
          <>
            {/* 瀑布流网格布局 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {shows.map(show => (
                <div
                  key={show.id}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/shows/${show.id}`)}
                >
                  <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card border border-white/30 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    {/* 图片区域 */}
                    <div className="relative w-full h-64 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
                      {show.images && show.images.length > 0 ? (
                        <img 
                          src={show.images[0]} 
                          alt="玩家秀" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                        </div>
                      )}
                      
                      {/* 图片数量指示器 */}
                      {show.images && show.images.length > 1 && (
                        <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                          +{show.images.length - 1}
                        </div>
                      )}
                      
                      {/* 悬停时的查看详情提示 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <div className="p-4 text-white">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                            <span className="text-sm font-medium">查看详情</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 内容区域 */}
                    <div className="p-6">
                      {/* 内容预览 */}
                      <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-primary transition-colors font-brand">
                        {truncateText(show.content, 60)}
                      </h3>
                      
                      {/* 用户信息和时间 */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                            {show.user_id ? show.user_id.toString().charAt(0) : 'U'}
                          </div>
                          <span className="font-medium">用户 {show.user_id}</span>
                        </div>
                        <span className="text-xs">{formatDate(show.created_at)}</span>
                      </div>
                      
                      {/* 盲盒信息（如果有） */}
                      {show.item && (
                        <div className="flex items-center justify-end">
                          <div className="flex items-center text-xs bg-gradient-to-r from-green-500/10 to-emerald-600/10 px-2 py-1 rounded-full border border-green-500/20">
                            <span className="text-green-600 font-medium">🎁 {show.item.name}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 分页控件 */}
            {Math.ceil(total / pageSize) > 1 && (
              <div className="flex justify-center">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-card border border-white/30 p-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary hover:bg-primary/5 transition-all duration-200 font-bold"
                    >
                      ← 上一页
                    </button>
                    
                    {Array.from({ length: Math.min(5, Math.ceil(total / pageSize)) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 border-2 rounded-xl font-bold transition-all duration-200 ${
                            page === pageNum
                              ? 'bg-gradient-to-r from-primary to-secondary text-white border-primary shadow-lg'
                              : 'border-gray-200 hover:border-primary hover:bg-primary/5'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= Math.ceil(total / pageSize)}
                      className="px-4 py-2 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary hover:bg-primary/5 transition-all duration-200 font-bold"
                    >
                      下一页 →
                    </button>
                  </div>
                  
                  {/* 页码信息 */}
                  <div className="text-center mt-3 text-sm text-gray-500">
                    第 {page} 页，共 {Math.ceil(total / pageSize)} 页
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PlayerShowList; 