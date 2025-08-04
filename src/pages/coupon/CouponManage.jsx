import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/axios';
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
    api.get('/api/coupon', { params: { page, pageSize: PAGE_SIZE, type: tab } }).then(res => {
      setCoupons(res.data.data);
      setTotal(res.data.total);
      setLoading(false);
    });
  }, [page, tab]);

  const fetchStats = useCallback(() => {
    api.get('/api/user-coupon/stats').then(res => {
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
      await api.post('/api/coupon', formData);
      setMessage('创建成功！');
      setShowForm(false);
      fetchCoupons();
    } catch (e) {
      setMessage(e.response?.data?.message || '创建失败');
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await api.put('/api/coupon', formData);
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
      await api.delete(`/api/coupon?id=${id}`);
      setMessage('删除成功！');
      fetchCoupons();
    } catch (e) {
      setMessage(e.response?.data?.message || '删除失败');
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题和操作按钮 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              🎫 优惠券管理
            </h1>
            <p className="text-gray-600 mt-2">管理平台优惠券，提升用户体验</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold shadow-btn hover:shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center"
              onClick={() => setShowForm(true)}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              新建优惠券
            </button>
          </div>
        </div>

        {/* 消息提示 */}
        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl shadow-card">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-green-700 font-medium">{message}</span>
            </div>
          </div>
        )}

        {/* Tab切换 */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white rounded-full p-1 shadow-card">
            <button
              className={`flex-1 px-6 py-3 rounded-full font-bold transition-all duration-200 ${
                tab === 'valid' 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg scale-105' 
                  : 'text-gray-600 hover:text-primary hover:bg-gray-50'
              }`}
              onClick={() => { setTab('valid'); setPage(1); }}
            >
              <span className="mr-2">✅</span>
              有效优惠券
            </button>
            <button
              className={`flex-1 px-6 py-3 rounded-full font-bold transition-all duration-200 ${
                tab === 'invalid' 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg scale-105' 
                  : 'text-gray-600 hover:text-red-500 hover:bg-gray-50'
              }`}
              onClick={() => { setTab('invalid'); setPage(1); }}
            >
              <span className="mr-2">❌</span>
              失效优惠券
            </button>
          </div>
        </div>

        {/* 统计信息卡片 */}
        {stats && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">总数量</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">可用</p>
                  <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">已使用</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.used}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">已过期</p>
                  <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 优惠券表单 */}
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

        {/* 优惠券列表 */}
        <div className="space-y-4">
          {coupons.map(coupon => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              onEdit={() => {
                setEditingCoupon(coupon);
                setShowForm(true);
              }}
              onDelete={() => handleDelete(coupon.id)}
            />
          ))}
        </div>

        {/* 分页 */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            className="px-4 py-2 bg-white text-primary border border-primary rounded-full font-bold shadow-btn hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            上一页
          </button>
          <span className="text-gray-600 font-medium">
            第 {page} 页 / 共 {Math.ceil(total / PAGE_SIZE) || 1} 页
          </span>
          <button
            className="px-4 py-2 bg-white text-primary border border-primary rounded-full font-bold shadow-btn hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={page * PAGE_SIZE >= total}
            onClick={() => setPage(page + 1)}
          >
            下一页
            <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// 优惠券卡片组件
const CouponCard = ({ coupon, onEdit, onDelete }) => {
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

  return (
    <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-lg transition-all duration-200 border border-gray-100">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 bg-gradient-to-r ${getCouponTypeColor(coupon)} rounded-full flex items-center justify-center text-white`}>
              {getCouponTypeIcon(coupon)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{coupon.name}</h3>
              <p className="text-sm text-gray-500">{coupon.description}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">类型:</span>
              <span className="font-semibold text-primary">{getCouponTypeText(coupon)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">有效期:</span>
              <span className="font-semibold">{coupon.start_time} ~ {coupon.end_time}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">状态:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                coupon.status === 1 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {coupon.status === 1 ? '上架' : '下架'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-full font-bold shadow-btn hover:shadow-lg transition-all duration-200 hover:scale-105 flex items-center"
            onClick={onEdit}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            编辑
          </button>
          <button
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full font-bold shadow-btn hover:shadow-lg transition-all duration-200 hover:scale-105 flex items-center"
            onClick={onDelete}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            删除
          </button>
        </div>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {coupon ? '编辑优惠券' : '新建优惠券'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">类型</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: Number(e.target.value)})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              >
                <option value={1}>满减券</option>
                <option value={2}>折扣券</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">门槛</label>
              <input
                type="number"
                value={formData.threshold}
                onChange={(e) => setFormData({...formData, threshold: Number(e.target.value)})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">金额/折扣</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">开始时间</label>
              <input
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">结束时间</label>
              <input
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">发放数量</label>
              <input
                type="number"
                value={formData.total}
                onChange={(e) => setFormData({...formData, total: Number(e.target.value)})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                rows="3"
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold shadow-btn hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                {coupon ? '更新' : '创建'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-full font-bold hover:bg-gray-600 transition-all duration-200 hover:scale-105"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CouponManage;