import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import { toast } from 'react-toastify';

const statusMap = {
  pending: '待支付',
  delivering: '待发货',
  delivered: '已送达',
  completed: '已完成',
  cancelled: '已取消',
};

const statusColors = {
  pending: 'from-yellow-500 to-orange-500',
  delivering: 'from-blue-500 to-indigo-500',
  delivered: 'from-green-500 to-emerald-500',
  completed: 'from-purple-500 to-pink-500',
  cancelled: 'from-gray-500 to-gray-600'
};

const statusIcons = {
  pending: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
    </svg>
  ),
  delivering: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
    </svg>
  ),
  delivered: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
    </svg>
  ),
  completed: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  ),
  cancelled: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
  )
};

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [opening, setOpening] = useState(false);
  const [openResult, setOpenResult] = useState(null);
  const [openItemId, setOpenItemId] = useState(null);
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const navigate = useNavigate();
  const pollingRef = useRef(null);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/pay/order/get', { params: { id } });
      setOrder(res.data.data || null);
    } catch {
      setError('获取订单失败');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!user?.id) {
      navigate('/login', { replace: true });
      return;
    }
    fetchOrder();
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const res = await api.get('/api/pay/order/get', { params: { id } });
        if (res.data.data && res.data.data.status !== 'pending') {
          setOrder(res.data.data);
          clearInterval(pollingRef.current);
        }
      } catch {
        // 轮询异常可忽略
      }
    }, 2000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [user?.id, fetchOrder, navigate, id]);

  const handleConfirm = async () => {
    setConfirming(true);
    setError('');
    try {
      await api.post('/api/pay/order/confirm', { order_id: id });
      fetchOrder();
      toast.success('确认收货成功');
    } catch (e) {
      const errorMsg = e.response?.data?.message || '确认收货失败';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setConfirming(false);
    }
  };

  const handleOpenBox = async (orderItemId) => {
    setOpening(true);
    setOpenItemId(orderItemId);
    setOpenResult(null);
    setError('');
    try {
      // 模拟动画
      await new Promise(r => setTimeout(r, 1200));
      const res = await api.post('/api/pay/order/open', { order_item_id: orderItemId, user_id: user.id });
      if (res.data.success) {
        setOpenResult(res.data.item);
        fetchOrder();
        toast.success('开盒成功！');
      } else {
        setError(res.data.message || '开盒失败');
        toast.error(res.data.message || '开盒失败');
      }
    } catch (e) {
      const errorMsg = e.response?.data?.message || '开盒失败';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setOpening(false);
      setOpenItemId(null);
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

  const formatOrderNumber = (orderId) => {
    return `#${orderId.toString().padStart(8, '0')}`;
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
            <p className="text-gray-600 font-medium">正在加载订单详情...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => navigate('/order/list')}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-3 rounded-2xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn"
            >
              返回订单列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
          <div className="absolute top-20 left-20 w-40 h-40 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">订单不存在</h3>
            <p className="text-gray-600 mb-8">该订单可能已被删除或不存在</p>
            <button
              onClick={() => navigate('/order/list')}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-3 rounded-2xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn"
            >
              返回订单列表
            </button>
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

      <div className="relative z-10 max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 返回按钮 */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/order/list')}
            className="flex items-center px-6 py-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-card border border-white/30 text-gray-700 font-bold transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            返回订单列表
          </button>
        </div>

        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4 font-brand">
            订单详情
          </h1>
          <div className="flex items-center justify-center space-x-3 text-gray-600">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gray-300"></div>
            <span className="text-lg font-medium">查看您的订单信息</span>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gray-300"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：订单信息 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 订单基本信息 */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card border border-white/30 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 font-brand flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  订单信息
                </h2>
                <div className={`flex items-center px-4 py-2 bg-gradient-to-r ${statusColors[order.status]} text-white rounded-xl font-bold shadow-lg`}>
                  {statusIcons[order.status]}
                  <span className="ml-2">{statusMap[order.status]}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">订单号</span>
                    <span className="font-mono font-bold text-gray-800">{formatOrderNumber(order.id)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">下单时间</span>
                    <span className="text-gray-800">{formatDate(order.created_at)}</span>
                  </div>
                  {order.updated_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">更新时间</span>
                      <span className="text-gray-800">{formatDate(order.updated_at)}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">订单总价</span>
                    <span className="font-bold text-primary text-lg">￥{order.total_amount}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">优惠金额</span>
                      <span className="text-green-600 font-bold">-￥{order.discount_amount}</span>
                    </div>
                  )}
                  {order.user_coupon && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">使用优惠券</span>
                      <span className="text-blue-600">{order.user_coupon.coupon?.name || '优惠券'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 收货地址 */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card border border-white/30 p-6 hover:shadow-xl transition-all duration-300">
              <h3 className="text-lg font-bold text-gray-800 mb-4 font-brand flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                收货地址
              </h3>
              
              {order.address ? (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                  <div className="flex items-center mb-2">
                    <span className="font-bold text-gray-800 mr-3">{order.address.recipient}</span>
                    <span className="text-gray-600">{order.address.phone}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {order.address.province}{order.address.city}{order.address.district}{order.address.detail}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                    📍
                  </div>
                  <p>暂无收货地址信息</p>
                </div>
              )}
            </div>

            {/* 订单商品 */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card border border-white/30 p-6 hover:shadow-xl transition-all duration-300">
              <h3 className="text-lg font-bold text-gray-800 mb-6 font-brand flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
                订单商品
              </h3>
              
              <div className="space-y-4">
                {order.orderItems && order.orderItems.map(item => (
                  <div key={item.id} className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-white shadow-lg">
                      <img 
                        src={item.blindBox?.cover_image || '/default-blindbox.png'} 
                        alt={item.blindBox?.name || '盲盒'} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 ml-4">
                      <h4 className="font-bold text-gray-800 mb-1">{item.blindBox?.name || '未知盲盒'}</h4>
                      <p className="text-sm text-gray-600">单价: ￥{item.price}</p>
                    </div>
                    <div className="text-right">
                      <div className="mb-2">
                        {item.is_opened ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">已开盒</span>
                        ) : order.status === 'completed' ? (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">待开盒</span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-bold">未开盒</span>
                        )}
                      </div>
                      
                      {order.status === 'completed' && !item.is_opened && (
                        <button
                          onClick={() => handleOpenBox(item.id)}
                          disabled={opening && openItemId === item.id}
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:bg-gray-300 text-white rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn disabled:cursor-not-allowed flex items-center"
                        >
                          {opening && openItemId === item.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                              开盒中...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                              </svg>
                              开盒
                            </>
                          )}
                        </button>
                      )}
                      
                      {item.is_opened && item.item && (
                        <div className="mt-2 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                          <div className="flex items-center text-yellow-700">
                            <span className="mr-2">🎁</span>
                            <span className="font-bold">{item.item.name}</span>
                          </div>
                          <p className="text-xs text-yellow-600 mt-1">
                            稀有度: {item.item.rarity === 1 ? '普通' : item.item.rarity === 2 ? '稀有' : '隐藏'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {order.status === 'delivered' && (
                <div className="mt-6 text-center">
                  <button
                    onClick={handleConfirm}
                    disabled={confirming}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:bg-gray-300 text-white rounded-2xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn disabled:cursor-not-allowed flex items-center mx-auto"
                  >
                    {confirming ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        确认中...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        确认收货
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：状态时间线 */}
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card border border-white/30 p-6 hover:shadow-xl transition-all duration-300">
              <h3 className="text-lg font-bold text-gray-800 mb-4 font-brand flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                订单状态
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="ml-3">
                    <p className="font-bold text-gray-800">订单创建</p>
                    <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                  </div>
                </div>
                
                {order.status !== 'pending' && order.status !== 'cancelled' && (
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="ml-3">
                      <p className="font-bold text-gray-800">支付完成</p>
                      <p className="text-sm text-gray-500">{formatDate(order.payment_time)}</p>
                    </div>
                  </div>
                )}
                
                {['delivering', 'delivered', 'completed'].includes(order.status) && (
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="ml-3">
                      <p className="font-bold text-gray-800">商品发货</p>
                      <p className="text-sm text-gray-500">商家已发货</p>
                    </div>
                  </div>
                )}
                
                {['delivered', 'completed'].includes(order.status) && (
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <div className="ml-3">
                      <p className="font-bold text-gray-800">商品送达</p>
                      <p className="text-sm text-gray-500">商品已送达</p>
                    </div>
                  </div>
                )}
                
                {order.status === 'completed' && (
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="ml-3">
                      <p className="font-bold text-gray-800">订单完成</p>
                      <p className="text-sm text-gray-500">订单已完成</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 开盒结果弹窗 */}
      {openResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-[400px] text-center relative max-w-full">
            <button 
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors" 
              onClick={() => setOpenResult(null)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                🎉
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">恭喜你获得</h3>
            </div>
            
            <div className="mb-6">
              <div className="w-32 h-32 mx-auto mb-4 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 border-4 border-white shadow-lg">
                <img 
                  src={openResult.image || '/default-item.png'} 
                  alt="奖品" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xl font-bold text-gray-800 mb-2">{openResult.name}</div>
              <div className="text-sm text-gray-500">
                稀有度：{openResult.rarity === 1 ? '普通' : openResult.rarity === 2 ? '稀有' : '隐藏'}
              </div>
            </div>
            
            <button 
              className="w-full py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-2xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn"
              onClick={() => setOpenResult(null)}
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail; 