import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const rarityTabs = [
  { label: '全部', value: '' },
  { label: '普通', value: '1' },
  { label: '稀有', value: '2' },
  { label: '隐藏', value: '3' }
];
const rarityMap = { 1: '普通', 2: '稀有', 3: '隐藏' };

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
    axios.get('/api/user/prizes', {
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

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">我的奖品</h1>
      {/* Tab */}
      <div className="flex space-x-4 mb-4">
        {rarityTabs.map(tab => (
          <button
            key={tab.value}
            className={`px-4 py-2 rounded-lg border ${activeRarity === tab.value ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-300'} transition`}
            onClick={() => handleTabChange(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* 搜索 */}
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          value={searchKeyword}
          onChange={e => setSearchKeyword(e.target.value)}
          placeholder="搜索奖品名称"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">搜索</button>
      </form>
      {/* 内容 */}
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
      {loading ? (
        <div className="text-center py-12">加载中...</div>
      ) : prizes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">暂无奖品</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {prizes.map((prize, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                <img src={prize.prizeImage || '/default-item.png'} alt={prize.prizeName} className="w-24 h-24 mb-2 rounded" />
                <div className="font-semibold text-lg mb-1">{prize.prizeName}</div>
                <div className="text-sm text-gray-500 mb-1">稀有度：{rarityMap[prize.rarity] || '未知'}</div>
                <div className="text-xs text-gray-400 mb-1">获得时间：{prize.openedAt && new Date(prize.openedAt).toLocaleString()}</div>
                <div className="text-xs text-gray-400 mb-2">奖品ID：{prize.prizeId}</div>
              </div>
            ))}
          </div>
          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 border rounded-lg ${currentPage === page ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
          <div className="text-right text-xs text-gray-400 mt-2">共 {total} 个奖品</div>
        </>
      )}
    </div>
  );
};

export default PrizeList; 