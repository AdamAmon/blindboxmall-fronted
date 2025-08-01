import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AddressManageModal from '../../components/AddressManageModal';
import { toast } from 'react-toastify';

const OrderConfirm = () => {
  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [payMethod, setPayMethod] = useState('balance');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/cart/list', { params: { user_id: user.id } });
      setCartItems(res.data.data || []);
    } catch {
      setError('获取购物车失败');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchAddressList = useCallback(async () => {
    try {
      const res = await api.get('/api/address/list', { params: { userId: user.id } });
      const defaultAddr = (res.data.data || []).find(a => a.is_default);
      setAddress(defaultAddr || (res.data.data && res.data.data[0]) || null);
    } catch {
      setError('获取地址失败');
    }
  }, [user?.id]);

  const fetchCoupons = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/api/user-coupon/available?user_id=${user.id}`);
      setCoupons(res.data || []);
      
      const userCouponId = searchParams.get('user_coupon_id');
      if (userCouponId) {
        const coupon = res.data.find(c => String(c.id) === userCouponId);
        if (coupon) {
          setSelectedCoupon(coupon);
        }
      }
    } catch {
      setCoupons([]);
    }
  }, [user?.id, searchParams]);

  useEffect(() => {
    if (!user?.id) {
      navigate('/login', { replace: true });
    } else {
      fetchCart();
      fetchAddressList();
      fetchCoupons();
    }
  }, [user?.id, fetchCart, fetchAddressList, fetchCoupons, navigate]);

  useEffect(() => {
    if (!selectedCoupon) {
      setDiscount(0);
      return;
    }
    const coupon = selectedCoupon.coupon;
    const total = cartItems.reduce((sum, item) => sum + (item.quantity * (item.blindBox?.price || 0)), 0);
    if (coupon.type === 1) {
      if (total >= coupon.threshold) {
        setDiscount(coupon.amount);
      } else {
        setDiscount(0);
      }
    } else if (coupon.type === 2) {
      setDiscount(Number((total * (1 - coupon.amount)).toFixed(2)));
    } else {
      setDiscount(0);
    }
  }, [selectedCoupon, cartItems]);

  const handleSubmit = async () => {
    if (!address) {
      toast.error('请选择收货地址');
      return;
    }
    if (cartItems.length === 0) {
      toast.error('购物车为空');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const items = cartItems.map(item => ({ blind_box_id: item.blind_box_id, price: item.blindBox?.price || 0, quantity: item.quantity }));
      const flatItems = [];
      items.forEach(i => {
        for (let j = 0; j < i.quantity; j++) {
          flatItems.push({ blind_box_id: i.blind_box_id, price: i.price });
        }
      });
      const res = await api.post('/api/pay/order/create', {
        user_id: user.id,
        address_id: address.id,
        total_amount: flatItems.reduce((sum, i) => sum + i.price, 0) - discount,
        pay_method: payMethod,
        items: flatItems,
        user_coupon_id: selectedCoupon ? selectedCoupon.id : undefined
      });
      if (res.data.success) {
        await api.post('/api/cart/clear', { user_id: user.id });
        const orderId = res.data.data.order.id;
        const payRes = await api.post('/api/pay/order/pay', { order_id: orderId });
        if (payMethod === 'balance') {
          navigate(`/order/detail/${orderId}`);
        } else if (payMethod === 'alipay' && payRes.data.payUrl) {
          window.open(payRes.data.payUrl, '_blank');
          navigate(`/order/detail/${orderId}`);
        }
      } else {
        setError(res.data.message || '下单失败');
      }
    } catch (e) {
      setError(e.response?.data?.message || '下单失败');
    } finally {
      setSubmitting(false);
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.quantity * (item.blindBox?.price || 0)), 0);
  const finalPrice = Math.max(0, totalPrice - discount);

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
            <p className="text-gray-600 font-medium">正在加载订单确认...</p>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
          <div className="absolute top-20 left-20 w-40 h-40 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-primary to-secondary rounded-full mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">购物车为空</h3>
            <p className="text-gray-600 mb-8">请先添加商品到购物车</p>
            <button
              onClick={() => navigate('/blindboxes')}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-3 rounded-2xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn"
            >
              去购物
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
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4 font-brand">
            确认订单
          </h1>
          <div className="flex items-center justify-center space-x-3 text-gray-600">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gray-300"></div>
            <span className="text-lg font-medium">确认您的订单信息</span>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：订单信息 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 收货地址 */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card border border-white/30 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 font-brand flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  收货地址
                </h2>
                <button 
                  onClick={() => setShowAddressModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn"
                >
                  管理地址
                </button>
              </div>
              
              {address ? (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="font-bold text-gray-800 mr-3">{address.recipient}</span>
                        <span className="text-gray-600">{address.phone}</span>
                        {address.is_default && (
                          <span className="ml-2 px-2 py-1 bg-primary text-white text-xs rounded-full">默认</span>
                        )}
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {address.province}{address.city}{address.district}{address.detail}
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowAddressModal(true)}
                      className="ml-4 px-3 py-1 text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                    >
                      更换
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                    📍
                  </div>
                  <p className="text-gray-600 mb-4">暂无收货地址</p>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="px-6 py-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn"
                  >
                    添加地址
                  </button>
                </div>
              )}
            </div>

            {/* 商品列表 */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card border border-white/30 p-6 hover:shadow-xl transition-all duration-300">
              <h2 className="text-xl font-bold text-gray-800 mb-6 font-brand flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
                商品清单
              </h2>
              
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-white shadow-lg">
                      <img 
                        src={item.blindBox?.cover_image || '/default-blindbox.png'} 
                        alt={item.blindBox?.name || '盲盒'} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 ml-4">
                      <h3 className="font-bold text-gray-800 mb-1">{item.blindBox?.name || '未知盲盒'}</h3>
                      <p className="text-sm text-gray-600">数量: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">￥{(item.quantity * (item.blindBox?.price || 0)).toFixed(2)}</div>
                      <div className="text-sm text-gray-500">单价: ￥{item.blindBox?.price || 0}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：支付信息 */}
          <div className="space-y-6">
            {/* 优惠券选择 */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card border border-white/30 p-6 hover:shadow-xl transition-all duration-300">
              <h3 className="text-lg font-bold text-gray-800 mb-4 font-brand flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
                </svg>
                优惠券
              </h3>
              
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-brand"
                value={selectedCoupon ? selectedCoupon.id : ''}
                onChange={e => {
                  const id = e.target.value;
                  setSelectedCoupon(coupons.find(c => String(c.id) === id) || null);
                }}
              >
                <option value="">不使用优惠券</option>
                {coupons.map(userCoupon => {
                  const coupon = userCoupon.coupon;
                  return (
                    <option key={userCoupon.id} value={userCoupon.id}>
                      {coupon.type === 1 ? `满${coupon.threshold}减${coupon.amount}` : coupon.type === 2 ? `${coupon.amount * 10}折券` : ''}
                    </option>
                  );
                })}
              </select>
              
              {selectedCoupon && discount > 0 && (
                <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center text-green-700">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span className="font-bold">已优惠：￥{discount.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    {selectedCoupon.coupon.type === 1 ? `满${selectedCoupon.coupon.threshold}减${selectedCoupon.coupon.amount}` : selectedCoupon.coupon.type === 2 ? `${selectedCoupon.coupon.amount * 10}折券` : ''}
                  </p>
                </div>
              )}
            </div>

            {/* 支付方式 */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card border border-white/30 p-6 hover:shadow-xl transition-all duration-300">
              <h3 className="text-lg font-bold text-gray-800 mb-4 font-brand flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
                支付方式
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors">
                  <input 
                    type="radio" 
                    name="payMethod" 
                    value="balance" 
                    checked={payMethod === 'balance'} 
                    onChange={() => setPayMethod('balance')}
                    className="mr-3 text-primary focus:ring-primary"
                  />
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                    <span className="font-bold">余额支付</span>
                  </div>
                </label>
                
                <label className="flex items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 cursor-pointer hover:bg-green-100 transition-colors">
                  <input 
                    type="radio" 
                    name="payMethod" 
                    value="alipay" 
                    checked={payMethod === 'alipay'} 
                    onChange={() => setPayMethod('alipay')}
                    className="mr-3 text-primary focus:ring-primary"
                  />
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                    </svg>
                    <span className="font-bold">支付宝（模拟）</span>
                  </div>
                </label>
              </div>
            </div>

            {/* 价格汇总 */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card border border-white/30 p-6 hover:shadow-xl transition-all duration-300">
              <h3 className="text-lg font-bold text-gray-800 mb-4 font-brand flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
                价格汇总
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>商品总价</span>
                  <span>￥{totalPrice.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>优惠金额</span>
                    <span>-￥{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-xl font-bold text-primary">
                    <span>应付金额</span>
                    <span>￥{finalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 提交按钮 */}
            <button
              onClick={handleSubmit}
              disabled={submitting || cartItems.length === 0 || !address}
              className="w-full py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 disabled:bg-gray-300 text-white rounded-2xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-btn disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  提交中...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  提交订单
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 地址管理弹窗 */}
      {showAddressModal && (
        <AddressManageModal
          userId={user.id}
          open={showAddressModal}
          onClose={() => { setShowAddressModal(false); fetchAddressList(); }}
          onSelectDefault={() => { fetchAddressList(); setShowAddressModal(false); }}
        />
      )}
    </div>
  );
};

export default OrderConfirm; 