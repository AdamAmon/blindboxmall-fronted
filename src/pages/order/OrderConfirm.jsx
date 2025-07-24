import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AddressManageModal from '../../components/AddressManageModal';

const OrderConfirm = () => {
  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [payMethod, setPayMethod] = useState('balance');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
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

  useEffect(() => {
    if (!user?.id) {
      navigate('/login', { replace: true });
    } else {
      fetchCart();
      fetchAddressList();
    }
  }, [user?.id, fetchCart, fetchAddressList, navigate]);

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
      // 后端支持批量下单，需展开items
      const flatItems = [];
      items.forEach(i => {
        for (let j = 0; j < i.quantity; j++) {
          flatItems.push({ blind_box_id: i.blind_box_id, price: i.price });
        }
      });
      const res = await axios.post('/api/pay/order/create', {
        user_id: user.id,
        address_id: address.id,
        total_amount: flatItems.reduce((sum, i) => sum + i.price, 0),
        pay_method: payMethod,
        items: flatItems
      });
      if (res.data.success) {
        // 清空购物车
        await axios.post('/api/cart/clear', { user_id: user.id });
        const orderId = res.data.data.order.id;
        // 下单成功后自动支付
        const payRes = await axios.post('/api/pay/order/pay', { order_id: orderId });
        if (payMethod === 'balance') {
          // 余额支付直接跳转订单详情
          navigate(`/order/detail/${orderId}`);
        } else if (payMethod === 'alipay' && payRes.data.payUrl) {
          // 支付宝支付在新标签页打开二维码
          window.open(payRes.data.payUrl, '_blank');
          // 跳转到订单详情页等待支付
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
            <div className="text-lg font-bold">总价：￥{totalPrice.toFixed(2)}</div>
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