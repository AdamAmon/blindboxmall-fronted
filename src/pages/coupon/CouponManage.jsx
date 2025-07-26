import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';

const PAGE_SIZE = 10;

const CouponManage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('valid'); // 'valid' or 'invalid'
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  
  // 使用自定义 Hook 获取用户信息
  const user = useUser();

  const fetchCoupons = useCallback(() => {
    setLoading(true);
    axios.get('/api/coupon', { params: { page, pageSize: PAGE_SIZE, type: tab } }).then(res => {
      setCoupons(res.data.data);
      setTotal(res.data.total);
      setLoading(false);
    });
  }, [page, tab]);

  const fetchStats = useCallback(() => {
    axios.get('/api/user-coupon/stats').then(res => {
      setStats(res.data.data);
    });
  }, []);

  useEffect(() => {
    if (!user) {
      setMessage('请先登录');
      setTimeout(() => navigate('/user/login'), 1000);
      return;
    }
    if (user.role !== 'admin') {
      setMessage('权限不足，仅管理员可访问');
      setTimeout(() => navigate('/'), 1000);
      return;
    }
    fetchCoupons();
    fetchStats();
  }, [user, navigate, fetchCoupons, fetchStats]);

  const handleCreate = async (formData) => {
    try {
      await axios.post('/api/coupon', formData);
      setMessage('创建成功！');
      setShowForm(false);
      fetchCoupons();
    } catch (e) {
      setMessage(e.response?.data?.message || '创建失败');
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await axios.put('/api/coupon', formData);
      setMessage('更新成功！');
      setShowForm(false);
      setEditingCoupon(null);
      fetchCoupons();
    } catch (e) {
      setMessage(e.response?.data?.message || '更新失败');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个优惠券吗？')) return;
    try {
      await axios.delete(`/api/coupon?id=${id}`);
      setMessage('删除成功！');
      fetchCoupons();
    } catch (e) {
      setMessage(e.response?.data?.message || '删除失败');
    }
  };

  const handleCleanExpired = async () => {
    if (!window.confirm('此操作仅清除用户已领取的失效优惠券，不会影响平台优惠券本身。\n确定要清理所有过期的用户优惠券吗？此操作不可恢复。')) return;
    try {
      const res = await axios.post('/api/user-coupon/clean-expired');
      setMessage(res.data.message || '清理成功！');
      fetchStats(); // 刷新统计信息
    } catch (e) {
      setMessage(e.response?.data?.message || '清理失败');
    }
  };

  if (loading) return <div>加载中...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">优惠券管理</h2>
        <div className="flex gap-2">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={handleCleanExpired}
          >清理过期优惠券</button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => setShowForm(true)}
          >新建优惠券</button>
        </div>
      </div>
      {/* Tab切换 */}
      <div className="mb-4 flex gap-4">
        <button
          className={`px-4 py-2 rounded ${tab === 'valid' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => { setTab('valid'); setPage(1); }}
        >有效优惠券</button>
        <button
          className={`px-4 py-2 rounded ${tab === 'invalid' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => { setTab('invalid'); setPage(1); }}
        >失效优惠券</button>
      </div>
      {message && <div className="mb-2 text-green-600">{message}</div>}
      {/* 统计信息 */}
      {stats && (
        <div className="mb-4 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">优惠券统计</h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>总数量: <span className="font-bold">{stats.total}</span></div>
            <div>可用: <span className="font-bold text-green-600">{stats.available}</span></div>
            <div>已使用: <span className="font-bold text-blue-600">{stats.used}</span></div>
            <div>已过期: <span className="font-bold text-red-600">{stats.expired}</span></div>
          </div>
        </div>
      )}
      {showForm && (
        <CouponForm
          coupon={editingCoupon}
          onSubmit={editingCoupon ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingCoupon(null);
          }}
        />
      )}
      <div className="space-y-4">
        {coupons.map(coupon => (
          <div key={coupon.id} className="border rounded p-4 flex justify-between items-center">
            <div>
              <div className="font-semibold">{coupon.name}</div>
              <div className="text-gray-500 text-sm">{coupon.type === 1 ? `满${coupon.threshold}减${coupon.amount}` : `${coupon.amount * 10}折券`}</div>
              <div className="text-xs text-gray-400">有效期：{coupon.start_time} ~ {coupon.end_time}</div>
              <div className="text-xs text-gray-400">状态：{coupon.status === 1 ? '上架' : '下架'}</div>
            </div>
            <div className="space-x-2">
              <button
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                onClick={() => {
                  setEditingCoupon(coupon);
                  setShowForm(true);
                }}
              >编辑</button>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                onClick={() => handleDelete(coupon.id)}
              >删除</button>
            </div>
          </div>
        ))}
      </div>
      {/* 分页 */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          className="px-3 py-1 rounded border disabled:opacity-50"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >上一页</button>
        <span>第 {page} 页 / 共 {Math.ceil(total / PAGE_SIZE) || 1} 页</span>
        <button
          className="px-3 py-1 rounded border disabled:opacity-50"
          disabled={page * PAGE_SIZE >= total}
          onClick={() => setPage(page + 1)}
        >下一页</button>
      </div>
    </div>
  );
};

const CouponForm = ({ coupon, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: coupon?.name || '',
    type: coupon?.type || 1,
    threshold: coupon?.threshold || 0,
    amount: coupon?.amount || 0,
    start_time: coupon?.start_time || '',
    end_time: coupon?.end_time || '',
    total: coupon?.total || 100,
    description: coupon?.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(coupon ? { ...formData, id: coupon.id } : formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h3 className="text-lg font-bold mb-4">{coupon ? '编辑优惠券' : '新建优惠券'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">类型</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: Number(e.target.value)})}
              className="w-full border rounded px-3 py-2"
            >
              <option value={1}>满减券</option>
              <option value={2}>折扣券</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">门槛</label>
            <input
              type="number"
              value={formData.threshold}
              onChange={(e) => setFormData({...formData, threshold: Number(e.target.value)})}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">金额/折扣</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">开始时间</label>
            <input
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) => setFormData({...formData, start_time: e.target.value})}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">结束时间</label>
            <input
              type="datetime-local"
              value={formData.end_time}
              onChange={(e) => setFormData({...formData, end_time: e.target.value})}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">发放数量</label>
            <input
              type="number"
              value={formData.total}
              onChange={(e) => setFormData({...formData, total: Number(e.target.value)})}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border rounded px-3 py-2"
              rows="3"
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >{coupon ? '更新' : '创建'}</button>
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >取消</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponManage; 