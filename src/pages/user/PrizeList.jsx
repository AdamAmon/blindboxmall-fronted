import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const rarityMap = {
  1: '普通',
  2: '稀有',
  3: '隐藏'
};

const PrizeList = () => {
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const navigate = useNavigate();

  const fetchPrizes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/pay/order/completed', { params: { user_id: user.id } });
      // 聚合所有订单项中已开盒的奖品
      const allPrizes = [];
      (res.data || []).forEach(orderObj => {
        (orderObj.items || []).forEach(item => {
          if (item.is_opened && item.item) {
            allPrizes.push({
              ...item.item,
              opened_at: item.opened_at,
              order_id: orderObj.order.id
            });
          }
        });
      });
      setPrizes(allPrizes);
    } catch {
      setError('获取奖品失败');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      navigate('/login');
      return;
    }
    fetchPrizes();
  }, [user?.id, fetchPrizes, navigate]);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">我的奖品</h1>
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
      {loading ? (
        <div className="text-center py-12">加载中...</div>
      ) : prizes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">暂无奖品</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {prizes.map((prize, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
              <img src={prize.image || '/default-item.png'} alt={prize.name} className="w-24 h-24 mb-2 rounded" />
              <div className="font-semibold text-lg mb-1">{prize.name}</div>
              <div className="text-sm text-gray-500 mb-1">稀有度：{rarityMap[prize.rarity] || '未知'}</div>
              <div className="text-xs text-gray-400 mb-1">获得时间：{prize.opened_at && new Date(prize.opened_at).toLocaleString()}</div>
              <div className="text-xs text-gray-400 mb-2">订单号：{prize.order_id}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrizeList; 