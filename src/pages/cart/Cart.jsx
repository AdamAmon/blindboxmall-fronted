import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [quantityMap, setQuantityMap] = useState({}); // {cartId: quantity}
  const debounceTimers = useRef({});
  const navigate = useNavigate();
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/cart/list', { params: { user_id: user.id } });
      setCartItems(res.data.data || []);
      // 初始化数量映射
      const map = {};
      (res.data.data || []).forEach(item => { map[item.id] = item.quantity; });
      setQuantityMap(map);
    } catch {
      setError('获取购物车失败');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      navigate('/login', { replace: true });
    } else {
      fetchCart();
    }
  }, [user?.id, fetchCart, navigate]);

  // 防抖更新数量
  const debouncedUpdateQuantity = (cartId, quantity) => {
    if (debounceTimers.current[cartId]) {
      clearTimeout(debounceTimers.current[cartId]);
    }
    debounceTimers.current[cartId] = setTimeout(() => {
      handleQuantityChange(cartId, quantity);
    }, 500);
  };

  const handleQuantityInput = (cartId, value, stock) => {
    let quantity = parseInt(value) || 1;
    if (quantity < 1) quantity = 1;
    if (stock && quantity > stock) quantity = stock;
    setQuantityMap(q => ({ ...q, [cartId]: quantity }));
    debouncedUpdateQuantity(cartId, quantity);
  };

  const handleQuantityChange = async (cartId, quantity) => {
    if (quantity < 1) return;
    setUpdating(true);
    try {
      await api.post('/api/cart/update', { cart_id: cartId, quantity });
      fetchCart();
    } catch {
      setError('更新数量失败');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (cartId) => {
    setUpdating(true);
    try {
      await api.post('/api/cart/delete', { cart_id: cartId });
      fetchCart();
    } catch {
      setError('删除失败');
    } finally {
      setUpdating(false);
    }
  };

  const handleClear = async () => {
    setUpdating(true);
    try {
      await api.post('/api/cart/clear', { user_id: user.id });
      fetchCart();
    } catch {
      setError('清空失败');
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckout = () => {
    navigate('/order/confirm');
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.quantity * (item.blindBox?.price || 0)), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
        <div className="absolute top-20 left-20 w-40 h-40 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4 font-brand">
            购物车
          </h1>
          <div className="flex items-center justify-center space-x-3 text-gray-600">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gray-300"></div>
            <span className="text-lg font-medium">管理您的盲盒收藏</span>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gray-300"></div>
          </div>
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

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full mb-4 animate-pulse">
                <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-gray-600 font-medium">正在加载购物车...</p>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-primary to-secondary rounded-full mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">购物车空空如也</h3>
            <p className="text-gray-600 mb-8">快去挑选心仪的盲盒吧！</p>
            <button
              onClick={() => navigate('/blindboxes')}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-3 rounded-2xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn"
            >
              去购物
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 购物车商品列表 */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card border border-white/30 p-6">
              <div className="grid gap-6">
                {cartItems.map(item => (
                  <div key={item.id} className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      {/* 商品图片 */}
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-white shadow-lg">
                          <img 
                            src={item.blindBox?.cover_image || '/default-blindbox.png'} 
                            alt="盲盒封面" 
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      </div>

                      {/* 商品信息 */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-primary transition-colors font-brand">
                          {item.blindBox?.name || '未知盲盒'}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {item.blindBox?.description || '暂无描述'}
                        </p>
                        
                        {/* 价格和库存信息 */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1 text-primary" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                            </svg>
                            单价: ¥{item.blindBox?.price || 0}
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            库存: {item.blindBox?.stock ?? '-'}
                          </span>
                        </div>

                        {/* 数量调整和操作 */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          {/* 数量调整 */}
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-700">数量:</span>
                            <div className="flex items-center bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
                              <button
                                onClick={() => handleQuantityInput(item.id, (quantityMap[item.id] || item.quantity) - 1, item.blindBox?.stock)}
                                disabled={updating || (quantityMap[item.id] || item.quantity) <= 1}
                                className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                                </svg>
                              </button>
                              <input
                                type="number"
                                min={1}
                                max={item.blindBox?.stock || 9999}
                                value={quantityMap[item.id] ?? item.quantity}
                                disabled={updating}
                                onChange={e => handleQuantityInput(item.id, e.target.value, item.blindBox?.stock)}
                                className="w-16 px-3 py-2 text-center border-0 focus:ring-0 focus:outline-none bg-transparent"
                              />
                              <button
                                onClick={() => handleQuantityInput(item.id, (quantityMap[item.id] || item.quantity) + 1, item.blindBox?.stock)}
                                disabled={updating || (quantityMap[item.id] || item.quantity) >= (item.blindBox?.stock || 9999)}
                                className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* 小计 */}
                          <div className="text-lg font-bold text-primary">
                            小计: ¥{(item.quantity * (item.blindBox?.price || 0)).toFixed(2)}
                          </div>

                          {/* 删除按钮 */}
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={updating}
                            className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 底部操作区域 */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card border border-white/30 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                {/* 左侧操作 */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleClear}
                    disabled={updating || cartItems.length === 0}
                    className="flex items-center px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-2xl font-bold transition-all duration-200 transform hover:scale-105 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    清空购物车
                  </button>
                  
                  <button
                    onClick={() => navigate('/blindboxes')}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    继续购物
                  </button>
                </div>

                {/* 右侧总价和结算 */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="text-center sm:text-right">
                    <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      总价: ¥{totalPrice.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      共 {cartItems.length} 件商品
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCheckout}
                    disabled={updating || cartItems.length === 0}
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-btn disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-6 h-6 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
                    </svg>
                    去结算
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart; 