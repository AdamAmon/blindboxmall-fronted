import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';

const statusMap = {
  pending: '待支付',
  delivering: '待发货',
  delivered: '已送达',
  completed: '已完成',
  cancelled: '已取消'
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

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/pay/order/list', { params: { user_id: user.id } });
      setOrders(res.data.data || []);
    } catch {
      setError('获取订单失败');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      navigate('/login', { replace: true });
    } else {
      fetchOrders();
    }
  }, [user?.id, fetchOrders, navigate]);

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const getFilterCount = (status) => {
    return orders.filter(o => status === 'all' || o.status === status).length;
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
            <p className="text-gray-600 font-medium">正在加载订单...</p>
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

      <div className="relative z-10 max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4 font-brand">
            我的订单
          </h1>
          <div className="flex items-center justify-center space-x-3 text-gray-600">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gray-300"></div>
            <span className="text-lg font-medium">管理您的购物记录</span>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gray-300"></div>
          </div>
        </div>

        {/* 筛选按钮 */}
        <div className="mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-card border border-white/30 p-4">
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { key: 'all', label: '全部', icon: '📋' },
                { key: 'pending', label: '待支付', icon: '⏰' },
                { key: 'delivering', label: '待发货', icon: '📦' },
                { key: 'delivered', label: '已送达', icon: '🚚' },
                { key: 'completed', label: '已完成', icon: '✅' },
                { key: 'cancelled', label: '已取消', icon: '❌' }
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 ${
                    filter === key
                      ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{icon}</span>
                  {label}
                  <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                    {getFilterCount(key)}
                  </span>
                </button>
              ))}
            </div>
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

        {/* 订单列表 */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-primary to-secondary rounded-full mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {filter === 'all' ? '暂无订单' : `暂无${statusMap[filter]}订单`}
            </h3>
            <p className="text-gray-600 mb-8">
              {filter === 'all' ? '快去购买心仪的盲盒吧！' : '敬请期待更多订单！'}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => navigate('/blindboxes')}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-3 rounded-2xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn"
              >
                去购物
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map(order => (
              <div key={order.id} className="group">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card border border-white/30 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  {/* 订单头部 */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-2xl text-white shadow-lg">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800 font-brand">
                            {formatOrderNumber(order.id)}
                          </h3>
                          <p className="text-sm text-gray-500">
                            下单时间: {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      {/* 状态标签 */}
                      <div className="flex items-center space-x-3">
                        <div className={`flex items-center px-4 py-2 bg-gradient-to-r ${statusColors[order.status]} text-white rounded-xl font-bold shadow-lg`}>
                          {statusIcons[order.status]}
                          <span className="ml-2">{statusMap[order.status]}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 订单内容 */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* 订单信息 */}
                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                          <h4 className="font-bold text-blue-800 mb-2 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            订单信息
                          </h4>
                          <div className="space-y-2 text-sm text-blue-700">
                            <div className="flex justify-between">
                              <span>订单号:</span>
                              <span className="font-mono">{formatOrderNumber(order.id)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>下单时间:</span>
                              <span>{formatDate(order.created_at)}</span>
                            </div>
                            {order.updated_at && (
                              <div className="flex justify-between">
                                <span>更新时间:</span>
                                <span>{formatDate(order.updated_at)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 商品信息 */}
                      <div className="space-y-4">
                        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                          <h4 className="font-bold text-green-800 mb-2 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                            </svg>
                            商品信息
                          </h4>
                          <div className="space-y-2 text-sm text-green-700">
                            <div className="flex justify-between">
                              <span>商品数量:</span>
                              <span>{order.item_count || 1} 件</span>
                            </div>
                            <div className="flex justify-between">
                              <span>商品总价:</span>
                              <span className="font-bold">¥{order.total_amount}</span>
                            </div>
                            {order.discount_amount && (
                              <div className="flex justify-between">
                                <span>优惠金额:</span>
                                <span className="text-red-600">-¥{order.discount_amount}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 支付信息 */}
                      <div className="space-y-4">
                        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                          <h4 className="font-bold text-purple-800 mb-2 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
                            </svg>
                            支付信息
                          </h4>
                          <div className="space-y-2 text-sm text-purple-700">
                            <div className="flex justify-between">
                              <span>支付方式:</span>
                              <span>{order.payment_method || '在线支付'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>支付状态:</span>
                              <span className={`font-bold ${order.status === 'pending' ? 'text-yellow-600' : 'text-green-600'}`}>
                                {order.status === 'pending' ? '待支付' : '已支付'}
                              </span>
                            </div>
                            {order.payment_time && (
                              <div className="flex justify-between">
                                <span>支付时间:</span>
                                <span>{formatDate(order.payment_time)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
                      <button
                        onClick={() => navigate(`/order/detail/${order.id}`)}
                        className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-2xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                        查看详情
                      </button>
                      
                      {order.status === 'pending' && (
                        <button
                          onClick={() => navigate(`/order/confirm?order_id=${order.id}`)}
                          className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                          </svg>
                          立即支付
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList; 