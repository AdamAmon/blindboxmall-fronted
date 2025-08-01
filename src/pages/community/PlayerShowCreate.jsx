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

  if (!user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">正在跳转到登录页面...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            🎉 发布玩家秀
          </h1>
          <p className="text-gray-600">分享您的盲盒开箱体验，展示您的幸运时刻</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-card">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-card p-8">
          {/* 选择奖品 */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold mr-3">
                1
              </div>
              <h2 className="text-xl font-bold text-gray-900">选择要展示的奖品</h2>
            </div>
            
            {prizes.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">暂无可晒单奖品</h3>
                <p className="text-gray-500 mb-4">您还没有开盒获得的奖品，快去抽盲盒吧！</p>
                <button
                  onClick={() => navigate('/blindboxes')}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold shadow-btn hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  去抽盲盒
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {prizes.map(prize => (
                  <div
                    key={prize.order_item_id}
                    className={`relative cursor-pointer transition-all duration-200 rounded-xl overflow-hidden ${
                      selectedPrize && selectedPrize.order_item_id === prize.order_item_id 
                        ? 'ring-2 ring-primary shadow-lg scale-105' 
                        : 'hover:shadow-md hover:scale-102'
                    }`}
                    onClick={() => setSelectedPrize(prize)}
                  >
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="relative mb-3">
                        <img 
                          src={prize.image || '/default.png'} 
                          alt={prize.name} 
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        {selectedPrize && selectedPrize.order_item_id === prize.order_item_id && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{prize.name}</h3>
                        <p className="text-xs text-gray-500 mb-1">订单号: {prize.order_id}</p>
                        <p className="text-xs text-gray-400">
                          获得于: {prize.opened_at && new Date(prize.opened_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 图片链接 */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold mr-3">
                2
              </div>
              <h2 className="text-xl font-bold text-gray-900">添加图片</h2>
            </div>
            
            <div className="space-y-4">
              {images.map((url, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      placeholder="请输入图片URL，如 https://xxx.com/xxx.jpg"
                      value={url}
                      onChange={e => handleImageUrlChange(idx, e.target.value)}
                    />
                  </div>
                  
                  {images.length > 1 && (
                    <button 
                      type="button" 
                      className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 flex items-center"
                      onClick={() => handleRemoveImageInput(idx)}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                      删除
                    </button>
                  )}
                  
                  {url && (
                    <div className="w-20 h-20 border border-gray-200 rounded-lg overflow-hidden">
                      <img src={url} alt="预览" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              ))}
              
              <button 
                type="button" 
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 flex items-center"
                onClick={handleAddImageInput}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                添加图片链接
              </button>
            </div>
          </div>

          {/* 内容输入 */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold mr-3">
                3
              </div>
              <h2 className="text-xl font-bold text-gray-900">分享体验</h2>
            </div>
            
            <textarea
              className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 min-h-[120px] resize-none"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="分享你的开盒体验，描述一下你的心情和感受..."
            />
            <div className="text-right mt-2">
              <span className="text-sm text-gray-500">{content.length}/500</span>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/shows')}
              className="flex-1 px-6 py-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-200 font-bold"
            >
              取消
            </button>
            <button
              className="flex-1 px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={submitting || !selectedPrize || !content.trim()}
            >
              {submitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  发布中...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                  </svg>
                  发布玩家秀
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerShowCreate;