import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/axios';

const PlayerShowCreate = () => {
  const [prizes, setPrizes] = useState([]);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [content, setContent] = useState('');
  const [images, setImages] = useState(['']); // 初始为一个空链接
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const navigate = useNavigate();
  const location = useLocation();

  // 获取我的奖品
  const fetchPrizes = useCallback(async () => {
    try {
      const res = await api.get('/api/pay/order/completed', { params: { user_id: user.id } });
      // 聚合所有已开盒奖品
      const allPrizes = [];
      (res.data || []).forEach(orderObj => {
        (orderObj.items || []).forEach(item => {
          if (item.is_opened && item.item) {
            allPrizes.push({
              ...item.item,
              order_item_id: item.id,
              opened_at: item.opened_at,
              order_id: orderObj.order.id
            });
          }
        });
      });
      setPrizes(allPrizes);
    } catch {
      setPrizes([]);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      navigate('/login');
      return;
    }
    fetchPrizes();
  }, [user?.id, fetchPrizes, navigate]);

  // 自动选中奖品（如从我的奖品跳转）
  useEffect(() => {
    if (location.state && location.state.prize && prizes.length > 0) {
      const match = prizes.find(p => p.order_item_id === location.state.prize.order_item_id);
      if (match) setSelectedPrize(match);
    }
  }, [location.state, prizes]);

  // 图片链接输入相关
  const handleImageUrlChange = (idx, value) => {
    const newImages = [...images];
    newImages[idx] = value;
    setImages(newImages);
  };
  const handleAddImageInput = () => {
    setImages([...images, '']);
  };
  const handleRemoveImageInput = (idx) => {
    if (images.length === 1) return; // 至少保留一个输入框
    const newImages = images.filter((_, i) => i !== idx);
    setImages(newImages);
  };

  const handleSubmit = async () => {
    if (!user || !selectedPrize) return;
    if (!content.trim()) {
      setError('内容不能为空');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/api/community/show/create', {
        user_id: user.id,
        item_id: selectedPrize.id,
        order_item_id: selectedPrize.order_item_id,
        content,
        images
      });
      if (res.data.success) {
        navigate('/shows');
      } else {
        setError(res.data.message || '发布失败');
      }
    } catch {
      setError('发布失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">发布玩家秀</h1>
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
      <div className="mb-4">
        <label className="block font-semibold mb-2">选择奖品</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prizes.length === 0 && <div className="text-gray-400">暂无可晒单奖品</div>}
          {prizes.map(prize => (
            <div
              key={prize.order_item_id}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition shadow-sm ${selectedPrize && selectedPrize.order_item_id === prize.order_item_id ? 'border-pink-500 ring-2 ring-pink-300 bg-pink-50' : 'hover:border-pink-300'}`}
              onClick={() => setSelectedPrize(prize)}
            >
              <img src={prize.image || '/default.png'} alt={prize.name} className="w-16 h-16 object-cover rounded mr-3 border" />
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{prize.name}</div>
                <div className="text-xs text-gray-500">订单号{prize.order_id}</div>
                <div className="text-xs text-gray-400">获得于{prize.opened_at && new Date(prize.opened_at).toLocaleString()}</div>
              </div>
              {selectedPrize && selectedPrize.order_item_id === prize.order_item_id && (
                <span className="material-icons text-pink-500 ml-2">check_circle</span>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-2">图片链接（支持多张）</label>
        {images.map((url, idx) => (
          <div key={idx} className="flex items-center mb-2 gap-2">
            <input
              type="text"
              className="flex-1 border rounded px-3 py-2"
              placeholder="请输入图片URL，如 https://xxx.com/xxx.jpg"
              value={url}
              onChange={e => handleImageUrlChange(idx, e.target.value)}
            />
            {images.length > 1 && (
              <button type="button" className="text-red-500 px-2" onClick={() => handleRemoveImageInput(idx)}>删除</button>
            )}
            {url && (
              <img src={url} alt="预览" className="w-16 h-16 object-cover rounded border ml-2" />
            )}
          </div>
        ))}
        <button type="button" className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200" onClick={handleAddImageInput}>添加图片链接</button>
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-2">内容</label>
        <textarea
          className="w-full border rounded px-3 py-2 min-h-[80px]"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="分享你的开盒体验..."
        />
      </div>
      <button
        className="w-full py-3 bg-purple-600 text-white rounded hover:bg-purple-700 font-bold"
        onClick={handleSubmit}
        disabled={submitting || !selectedPrize || !content.trim()}
      >{submitting ? '发布中...' : '发布玩家秀'}</button>
    </div>
  );
};

export default PlayerShowCreate; 