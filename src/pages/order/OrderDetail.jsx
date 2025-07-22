import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

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

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/pay/order/get', { params: { id } });
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
    } else {
      fetchOrder();
    }
  }, [user?.id, fetchOrder, navigate]);

  const handleConfirm = async () => {
    setConfirming(true);
    setError('');
    try {
      await axios.post('/api/pay/order/confirm', { order_id: id });
      fetchOrder();
    } catch (e) {
      setError(e.response?.data?.message || '确认收货失败');
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
      const res = await axios.post('/api/pay/order/open', { order_item_id: orderItemId, user_id: user.id });
      if (res.data.success) {
        setOpenResult(res.data.item);
        fetchOrder();
      } else {
        setError(res.data.message || '开盒失败');
      }
    } catch (e) {
      setError(e.response?.data?.message || '开盒失败');
    } finally {
      setOpening(false);
      setOpenItemId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }
  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }
  if (!order) {
    return <div className="text-center py-12 text-gray-500">订单不存在</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">订单详情</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-2"><span className="font-semibold">订单号：</span>{order.id}</div>
        <div className="mb-2"><span className="font-semibold">状态：</span>{order.status === 'pending' ? '待支付' : order.status === 'delivering' ? '待发货' : order.status === 'delivered' ? '已送达' : order.status === 'completed' ? '已完成' : order.status}</div>
        <div className="mb-2"><span className="font-semibold">收货地址：</span>{order.address?.recipient}，{order.address?.phone}，{order.address?.province}{order.address?.city}{order.address?.district}{order.address?.detail}</div>
        <div className="mb-2"><span className="font-semibold">下单时间：</span>{order.created_at && new Date(order.created_at).toLocaleString()}</div>
        <div className="mb-2"><span className="font-semibold">总价：</span>￥{order.total_amount}</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold mb-4">订单商品</h2>
        <table className="w-full mb-4">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="py-2">盲盒</th>
              <th className="py-2">单价</th>
              <th className="py-2">状态</th>
              <th className="py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {order.orderItems && order.orderItems.map(item => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="py-2 flex items-center">
                  <img src={item.blindBox?.cover_image || '/default-blindbox.png'} alt="cover" className="w-12 h-12 rounded mr-2" />
                  <span>{item.blindBox?.name || '未知盲盒'}</span>
                </td>
                <td className="py-2">￥{item.price}</td>
                <td className="py-2">
                  {item.is_opened ? (
                    <span className="text-green-600">已开盒</span>
                  ) : order.status === 'completed' ? (
                    <span className="text-blue-600">待开盒</span>
                  ) : (
                    <span className="text-gray-500">未开盒</span>
                  )}
                </td>
                <td className="py-2">
                  {order.status === 'completed' && !item.is_opened && (
                    <button
                      onClick={() => handleOpenBox(item.id)}
                      disabled={opening && openItemId === item.id}
                      className="px-4 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >{opening && openItemId === item.id ? '开盒中...' : '开盒'}</button>
                  )}
                  {item.is_opened && item.item && (
                    <span className="ml-2 text-sm text-purple-700">🎁 {item.item.name}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {order.status === 'delivered' && (
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >{confirming ? '确认中...' : '确认收货'}</button>
        )}
      </div>
      {/* 开盒结果弹窗 */}
      {openResult && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-[320px] text-center relative">
            <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" onClick={() => setOpenResult(null)}>
              <span className="material-icons">close</span>
            </button>
            <h3 className="text-xl font-bold mb-4">恭喜你获得</h3>
            <img src={openResult.image || '/default-item.png'} alt="奖品" className="w-24 h-24 mx-auto mb-4 rounded" />
            <div className="text-lg font-semibold mb-2">{openResult.name}</div>
            <div className="text-sm text-gray-500 mb-2">稀有度：{openResult.rarity === 1 ? '普通' : openResult.rarity === 2 ? '稀有' : '隐藏'}</div>
            <button className="mt-4 px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700" onClick={() => setOpenResult(null)}>我知道了</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail; 