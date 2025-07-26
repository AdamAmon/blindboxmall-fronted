import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AddressManageModal from '../../components/AddressManageModal';

const OrderConfirm = () => {
  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [payMethod, setPayMethod] = useState('balance');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [coupons, setCoupons] = useState([]); // 新增：可用优惠券
  const [selectedCoupon, setSelectedCoupon] = useState(null); // 新增：选中的优惠券
  const [discount, setDiscount] = useState(0); // 新增：优惠金额
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/cart/list', { params: { user_id: user.id } });
      setCartItems(res.data.data || []);
    } catch {
      setError('获取购物车失败');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchAddressList = useCallback(async () => {
    try {
      const res = await axios.get('/api/address/list', { params: { userId: user.id } });
      const defaultAddr = (res.data.data || []).find(a => a.is_default);
      setAddress(defaultAddr || (res.data.data && res.data.data[0]) || null);
    } catch {
      setError('获取地址失败');
    }
  }, [user?.id]);

  // 获取可用优惠券
  const fetchCoupons = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`/api/user-coupon/available?user_id=${user.id}`);
      setCoupons(res.data || []);
      
      // 从 URL 参数中获取 user_coupon_id 并自动选择
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

  // 计算优惠金额
  useEffect(() => {
    if (!selectedCoupon) {
      setDiscount(0);
      return;
    }
    const coupon = selectedCoupon.coupon; // 从嵌套的 coupon 对象中获取优惠券信息
    const total = cartItems.reduce((sum, item) => sum + (item.quantity * (item.blindBox?.price || 0)), 0);
    if (coupon.type === 1) {
      // 满减券
      if (total >= coupon.threshold) {
        setDiscount(coupon.amount);
      } else {
        setDiscount(0);
      }
    } else if (coupon.type === 2) {
      // 折扣券
      setDiscount(Number((total * (1 - coupon.amount)).toFixed(2)));
    } else {
      setDiscount(0);
    }
  }, [selectedCoupon, cartItems]);

  const handleSubmit = async () => {
    if (!address) {
      setError('请选择收货地址');
      return;
    }
    if (cartItems.length === 0) {
      setError('购物车为空');
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
      const res = await axios.post('/api/pay/order/create', {
        user_id: user.id,
        address_id: address.id,
        total_amount: flatItems.reduce((sum, i) => sum + i.price, 0) - discount,
        pay_method: payMethod,
        items: flatItems,
        user_coupon_id: selectedCoupon ? selectedCoupon.id : undefined
      });
      if (res.data.success) {
        await axios.post('/api/cart/clear', { user_id: user.id });
        const orderId = res.data.data.order.id;
        const payRes = await axios.post('/api/pay/order/pay', { order_id: orderId });
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

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">确认订单</h1>
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
      {loading ? (
        <div className="text-center py-12">加载中...</div>
      ) : cartItems.length === 0 ? (
        <div className="text-center py-12 text-gray-500">购物车为空</div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          {/* 地址选择 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">收货地址</span>
              <button className="text-blue-600 hover:underline text-sm" onClick={() => setShowAddressModal(true)}>管理地址</button>
            </div>
            {address ? (
              <div className="p-3 bg-gray-50 rounded flex items-center justify-between">
                <div>
                  <span className="font-bold mr-2">{address.recipient}</span>
                  <span className="mr-2">{address.phone}</span>
                  <span>{address.province}{address.city}{address.district}{address.detail}</span>
                </div>
                <button className="text-xs text-blue-500 hover:underline" onClick={() => setShowAddressModal(true)}>更换</button>
              </div>
            ) : (
              <div className="text-gray-500">暂无收货地址，请先添加</div>
            )}
          </div>

          {/* 商品列表 */}
          <table className="w-full mb-4">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="py-2">盲盒</th>
                <th className="py-2">单价</th>
                <th className="py-2">数量</th>
                <th className="py-2">小计</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map(item => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="py-2 flex items-center">
                    <img src={item.blindBox?.cover_image || '/default-blindbox.png'} alt="cover" className="w-12 h-12 rounded mr-2" />
                    <span>{item.blindBox?.name || '未知盲盒'}</span>
                  </td>
                  <td className="py-2">￥{item.blindBox?.price || 0}</td>
                  <td className="py-2">{item.quantity}</td>
                  <td className="py-2">￥{(item.quantity * (item.blindBox?.price || 0)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 优惠券选择 */}
          <div className="mb-6">
            <span className="font-semibold mr-4">优惠券</span>
            <select
              className="border rounded px-3 py-2"
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
              <span className="ml-4 text-green-600">已优惠：￥{discount.toFixed(2)}（{selectedCoupon.coupon.type === 1 ? `满${selectedCoupon.coupon.threshold}减${selectedCoupon.coupon.amount}` : selectedCoupon.coupon.type === 2 ? `${selectedCoupon.coupon.amount * 10}折券` : ''}）</span>
            )}
          </div>

          {/* 支付方式 */}
          <div className="mb-6">
            <span className="font-semibold mr-4">支付方式</span>
            <label className="mr-4">
              <input type="radio" name="payMethod" value="balance" checked={payMethod === 'balance'} onChange={() => setPayMethod('balance')} /> 余额支付
            </label>
            <label>
              <input type="radio" name="payMethod" value="alipay" checked={payMethod === 'alipay'} onChange={() => setPayMethod('alipay')} /> 支付宝（模拟）
            </label>
          </div>

          {/* 总价与提交 */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-lg font-bold">总价：￥{finalPrice.toFixed(2)}</div>
            <button
              onClick={handleSubmit}
              disabled={submitting || cartItems.length === 0 || !address}
              className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >提交订单</button>
          </div>
        </div>
      )}
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