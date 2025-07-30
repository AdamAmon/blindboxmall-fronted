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

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">我的订单</h1>
      <div className="mb-4 flex space-x-2">
        <button className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setFilter('all')}>全部</button>
        {Object.entries(statusMap).map(([key, label]) => (
          <button key={key} className={`px-4 py-2 rounded ${filter === key ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setFilter(key)}>{label}</button>
        ))}
      </div>
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
      {loading ? (
        <div className="text-center py-12">加载中...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">暂无订单</div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-2 md:mb-0">
                <div className="font-semibold">订单号：{order.id}</div>
                <div className="text-sm text-gray-500">下单时间：{order.created_at && new Date(order.created_at).toLocaleString()}</div>
                <div className="text-sm text-gray-500">总价：￥{order.total_amount}</div>
                <div className="text-sm text-gray-500">状态：{statusMap[order.status] || order.status}</div>
              </div>
              <div>
                <button
                  onClick={() => navigate(`/order/detail/${order.id}`)}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >查看详情</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderList; 