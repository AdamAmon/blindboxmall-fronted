import React, { useEffect, useState } from 'react';
import api from '../../utils/axios';
import { useNavigate } from 'react-router-dom';

const CouponCenter = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // 获取当前登录用户信息（假设本地存储有user）
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    // 获取可领取优惠券列表
    api.get('/api/coupon').then(res => {
      setCoupons(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    });
  }, []);

  const handleReceive = async (couponId) => {
    if (!user) {
      setMessage('请先登录');
      setTimeout(() => navigate('/user/login'), 1000);
      return;
    }
    try {
      await api.post('/api/user-coupon/receive?user_id=' + user.id, { coupon_id: couponId });
      setMessage('领取成功！');
    } catch (e) {
      setMessage(e.response?.data?.message || '领取失败');
    }
  };

  if (loading) return <div>加载中...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">优惠券中心</h2>
      {message && <div className="mb-2 text-green-600">{message}</div>}
      <div className="space-y-4">
        {(!Array.isArray(coupons) || coupons.length === 0) && <div>暂无可领取优惠券</div>}
        {Array.isArray(coupons) && coupons.map(coupon => (
          <div key={coupon.id} className="border rounded p-4 flex justify-between items-center">
            <div>
              <div className="font-semibold">{coupon.name}</div>
              <div className="text-gray-500 text-sm">{coupon.type === 1 ? `满${coupon.threshold}减${coupon.amount}` : `${coupon.amount * 10}折券`}</div>
              <div className="text-xs text-gray-400">有效期：{coupon.start_time} ~ {coupon.end_time}</div>
            </div>
            <button
              className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
              onClick={() => handleReceive(coupon.id)}
            >领取</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CouponCenter; 