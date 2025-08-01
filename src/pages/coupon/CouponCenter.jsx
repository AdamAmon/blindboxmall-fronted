import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/axios';
import { useNavigate } from 'react-router-dom';

const CouponCenter = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [receivingCoupons, setReceivingCoupons] = useState(new Set());
  const [filterType, setFilterType] = useState('all'); // all, discount, cashback
  const navigate = useNavigate();

  const showMessage = useCallback((msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  }, []);

  const fetchCoupons = useCallback(async () => {
    try {
      const response = await api.get('/api/coupon');
      const responseData = response.data || {};
      const couponsList = Array.isArray(responseData.data) 
        ? responseData.data 
        : [];
      
      setCoupons(couponsList);
    } catch (error) {
      console.error('获取优惠券失败:', error);
      setCoupons([]);
      showMessage('获取优惠券失败，请稍后重试', 'error');
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    // 获取当前登录用户信息
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    
    // 获取可领取优惠券列表
    fetchCoupons();
  }, [fetchCoupons]);

  const handleReceive = async (couponId) => {
    if (!user) {
      showMessage('请先登录', 'error');
      setTimeout(() => navigate('/login'), 1000);
      return;
    }
    
    setReceivingCoupons(prev => new Set(prev).add(couponId));
    try {
      await api.post('/api/user-coupon/receive?user_id=' + user.id, { coupon_id: couponId });
      showMessage('🎉 领取成功！可在"我的优惠券"中查看', 'success');
      // 从列表中移除已领取的优惠券
      setCoupons(prev => prev.filter(coupon => coupon.id !== couponId));
    } catch (error) {
      const errorMsg = error.response?.data?.message || '领取失败，请稍后重试';
      showMessage(errorMsg, 'error');
    } finally {
      setReceivingCoupons(prev => {
        const newSet = new Set(prev);
        newSet.delete(couponId);
        return newSet;
      });
    }
  };

  const getCouponTypeText = (coupon) => {
    if (coupon.type === 1) {
      return `满${coupon.threshold}减${coupon.amount}`;
    } else {
      return `${(coupon.amount * 10).toFixed(1)}折券`;
    }
  };

  const getCouponTypeColor = (coupon) => {
    if (coupon.type === 1) {
      return 'from-red-500 to-pink-600';
    } else {
      return 'from-green-500 to-emerald-600';
    }
  };

  const getCouponTypeIcon = (coupon) => {
    if (coupon.type === 1) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
        </svg>
      );
    } else {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
        </svg>
      );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getFilteredCoupons = () => {
    if (filterType === 'all') return coupons;
    return coupons.filter(coupon => {
      if (filterType === 'discount') return coupon.type === 2;
      if (filterType === 'cashback') return coupon.type === 1;
      return true;
    });
  };

  const filteredCoupons = getFilteredCoupons();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-purple-50 relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
          <div className="absolute top-20 left-20 w-40 h-40 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-secondary/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full mb-6 animate-pulse shadow-2xl">
              <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">正在加载优惠券...</h3>
            <p className="text-gray-600">为您准备专属优惠</p>
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
        {/* 浮动装饰元素 */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full mb-6 shadow-2xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
            </svg>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4 font-brand">
            优惠券中心
          </h1>
          <div className="flex items-center justify-center space-x-3 text-gray-600 mb-4">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-gray-300"></div>
            <span className="text-lg font-medium">领取专属优惠，享受更多折扣</span>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-gray-300"></div>
          </div>
          <p className="text-gray-500 text-lg">精选优惠券，助您购物更省钱</p>
        </div>

        {/* 消息提示 */}
        {message && (
          <div className={`mb-8 p-4 rounded-2xl backdrop-blur-sm border animate-fade-in ${
            messageType === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {messageType === 'success' ? (
                  <svg className="h-6 w-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{message}</p>
              </div>
            </div>
          </div>
        )}

        {/* 筛选器 */}
        <div className="mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-card border border-white/30 p-4">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-sm font-medium text-gray-700">筛选类型：</span>
              {[
                { key: 'all', label: '全部', icon: '🎫' },
                { key: 'cashback', label: '满减券', icon: '💰' },
                { key: 'discount', label: '折扣券', icon: '🏷️' }
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setFilterType(filter.key)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
                    filterType === filter.key
                      ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{filter.icon}</span>
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 优惠券列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(!Array.isArray(filteredCoupons) || filteredCoupons.length === 0) ? (
            <div className="col-span-full text-center py-20">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-primary to-secondary rounded-full mb-8 shadow-2xl">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">暂无可领取优惠券</h3>
              <p className="text-gray-600 mb-8 text-lg">敬请期待更多优惠活动！</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/blindboxes')}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn"
                >
                  🛍️ 去购物
                </button>
                <button
                  onClick={fetchCoupons}
                  className="bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 rounded-2xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn"
                >
                  🔄 刷新
                </button>
              </div>
            </div>
          ) : (
            filteredCoupons.map((coupon, index) => (
              <div 
                key={coupon.id} 
                className="group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-card border border-white/30 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
                  {/* 优惠券顶部装饰 */}
                  <div className={`h-3 bg-gradient-to-r ${getCouponTypeColor(coupon)} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
                  </div>
                  
                  {/* 优惠券内容 */}
                  <div className="p-6">
                    {/* 优惠券类型图标和名称 */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`flex items-center justify-center w-14 h-14 bg-gradient-to-r ${getCouponTypeColor(coupon)} rounded-2xl text-white shadow-lg transform group-hover:scale-110 transition-transform duration-200`}>
                        {getCouponTypeIcon(coupon)}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 font-medium">优惠券</div>
                        <div className="text-xs text-gray-400">#{coupon.id}</div>
                      </div>
                    </div>

                    {/* 优惠券名称 */}
                    <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 font-brand group-hover:text-primary transition-colors duration-200">
                      {coupon.name}
                    </h3>

                    {/* 优惠券类型和金额 */}
                    <div className="mb-4">
                      <div className={`inline-flex items-center px-4 py-2 bg-gradient-to-r ${getCouponTypeColor(coupon)} text-white rounded-xl text-lg font-bold shadow-lg transform group-hover:scale-105 transition-transform duration-200`}>
                        {getCouponTypeText(coupon)}
                      </div>
                    </div>

                    {/* 使用条件 */}
                    {coupon.type === 1 && (
                      <div className="mb-4 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100">
                        <div className="flex items-center text-sm text-red-700">
                          <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          满 ¥{coupon.threshold} 可用
                        </div>
                      </div>
                    )}

                    {/* 有效期 */}
                    <div className="mb-6 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <div className="flex items-center text-sm text-blue-700">
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        有效期至: {formatDate(coupon.end_time)}
                      </div>
                    </div>

                    {/* 领取按钮 */}
                    <button
                      onClick={() => handleReceive(coupon.id)}
                      disabled={receivingCoupons.has(coupon.id)}
                      className={`w-full py-4 px-6 rounded-2xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn disabled:opacity-50 disabled:cursor-not-allowed ${
                        receivingCoupons.has(coupon.id)
                          ? 'bg-gray-400 text-white'
                          : 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white'
                      }`}
                    >
                      {receivingCoupons.has(coupon.id) ? (
                        <div className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          领取中...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                          </svg>
                          立即领取
                        </div>
                      )}
                    </button>
                  </div>

                  {/* 优惠券底部装饰 */}
                  <div className={`h-2 bg-gradient-to-r ${getCouponTypeColor(coupon)}`}></div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 底部提示 */}
        <div className="mt-12 text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-card border border-white/30 p-8">
            <div className="flex items-center justify-center space-x-3 text-gray-600 mb-4">
              <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-lg font-bold">温馨提示</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
              <div className="flex items-center justify-center">
                <span className="mr-2">🎯</span>
                优惠券领取后可在"我的优惠券"中查看
              </div>
              <div className="flex items-center justify-center">
                <span className="mr-2">💳</span>
                下单时自动使用符合条件的优惠券
              </div>
              <div className="flex items-center justify-center">
                <span className="mr-2">⏰</span>
                请注意优惠券的有效期
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 自定义动画样式 */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CouponCenter; 