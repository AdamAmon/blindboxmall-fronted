import React, { useEffect, useState } from 'react';
import api from '../../utils/axios';
import { useNavigate } from 'react-router-dom';

const rarityTabs = [
  { label: '全部', value: '', icon: '🎁' },
  { label: '普通', value: '1', icon: '⭐' },
  { label: '稀有', value: '2', icon: '💎' },
  { label: '隐藏', value: '3', icon: '🌟' }
];
const rarityMap = { 1: '普通', 2: '稀有', 3: '隐藏' };

const getRarityColor = (rarity) => {
  switch (rarity) {
    case 1: return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
    case 2: return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white';
    case 3: return 'bg-gradient-to-r from-purple-500 to-pink-600 text-white';
    default: return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
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

const PrizeList = () => {
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeRarity, setActiveRarity] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const navigate = useNavigate();
  const pageSize = 9;

  // 防抖关键词
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(searchKeyword), 500);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  useEffect(() => {
    if (!user?.id) {
      navigate('/login');
      return;
    }
    setLoading(true);
    setError('');
    api.get('/api/user/prizes', {
      params: {
        user_id: user.id,
        rarity: activeRarity,
        keyword: debouncedKeyword,
        page: currentPage,
        limit: pageSize
      },
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        if (res.data.code === 200) {
          setPrizes(res.data.data.list || []);
          setTotalPages(res.data.data.totalPages || 1);
          setTotal(res.data.data.total || 0);
        } else {
          setError('获取奖品失败');
        }
      })
      .catch(() => setError('获取奖品失败'))
      .finally(() => setLoading(false));
  }, [user?.id, activeRarity, debouncedKeyword, currentPage, navigate]);

  const handleTabChange = (rarity) => {
    setActiveRarity(rarity);
    setCurrentPage(1);
  };
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setDebouncedKeyword(searchKeyword);
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400 animate-ping"></div>
          </div>
          <p className="mt-6 text-lg text-gray-600 font-medium">正在加载奖品...</p>
          <p className="mt-2 text-sm text-gray-500">精彩奖品马上呈现</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 返回按钮 */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center text-gray-600 hover:text-purple-600 mb-8 transition-colors duration-200 group"
        >
          <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">返回个人中心</span>
        </button>

        {/* 标题区域 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
            我的奖品
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            展示您从盲盒中获得的珍贵奖品，每一件都是独特的收藏品
          </p>
        </div>

        {/* 统计信息 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-200">
              <div className="text-2xl font-bold text-purple-600 mb-1">{total}</div>
              <div className="text-sm text-gray-600">总奖品数</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {prizes.filter(p => p.rarity === 1).length}
              </div>
              <div className="text-sm text-gray-600">普通奖品</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {prizes.filter(p => p.rarity === 2).length}
              </div>
              <div className="text-sm text-gray-600">稀有奖品</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {prizes.filter(p => p.rarity === 3).length}
              </div>
              <div className="text-sm text-gray-600">隐藏奖品</div>
            </div>
          </div>
        </div>

        {/* 筛选和搜索 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-6 mb-8">
          {/* Tab */}
          <div className="flex flex-wrap gap-3 mb-6">
            {rarityTabs.map(tab => (
              <button
                key={tab.value}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 ${
                  activeRarity === tab.value 
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg' 
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary hover:bg-primary/5'
                }`}
                onClick={() => handleTabChange(tab.value)}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* 搜索 */}
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                placeholder="搜索奖品名称..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white/70 backdrop-blur-sm"
              />
            </div>
            <button 
              type="submit" 
              className="px-8 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn"
            >
              搜索
            </button>
          </form>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* 奖品列表 */}
        {prizes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              🎁
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">暂无奖品</h3>
            <p className="text-gray-500 mb-6">您还没有获得任何奖品，快去盲盒商城试试手气吧！</p>
            <button
              onClick={() => navigate('/blindboxes')}
              className="px-8 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn"
            >
              去抽盲盒
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {prizes.map((prize, idx) => (
                <div 
                  key={idx} 
                  className={`group bg-gradient-to-br ${getRarityBgColor(prize.rarity)} rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border`}
                >
                  <div className="text-center">
                    <div className="relative mb-4">
                      <img 
                        src={prize.prizeImage || '/default-item.png'} 
                        alt={prize.prizeName} 
                        className="w-32 h-32 object-cover mx-auto rounded-xl group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/128x128?text=奖品图片';
                        }}
                      />
                      <div className="absolute -top-2 -right-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRarityColor(prize.rarity)}`}>
                          {rarityMap[prize.rarity] || '未知'}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{prize.prizeName}</h3>
                    <div className="text-sm text-gray-600 mb-2">
                      获得时间：{prize.openedAt && new Date(prize.openedAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      奖品ID：{prize.prizeId}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-card border border-white/30 p-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary hover:bg-primary/5 transition-all duration-200 font-bold"
                    >
                      ← 上一页
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 border-2 rounded-xl font-bold transition-all duration-200 ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-primary to-secondary text-white border-primary shadow-lg'
                            : 'border-gray-200 hover:border-primary hover:bg-primary/5'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary hover:bg-primary/5 transition-all duration-200 font-bold"
                    >
                      下一页 →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 总数显示 */}
            <div className="text-center text-sm text-gray-500 mt-6">
              共 {total} 个奖品
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PrizeList; 