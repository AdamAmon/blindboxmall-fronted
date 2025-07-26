import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('user');
    if (!userInfo) {
      setMessage('请先登录');
      setTimeout(() => navigate('/user/login'), 1000);
      return;
    }
    const userObj = JSON.parse(userInfo);
    axios.get(`/api/user-coupon/list?user_id=${userObj.id}`).then(res => {
      setCoupons(res.data);
      setLoading(false);
    });
  }, [navigate]);

  const handleUse = (userCouponId) => {
    // 跳转到订单确认页并带上 user_coupon_id
    navigate(`/order/confirm?user_coupon_id=${userCouponId}`);
  };

  // 获取优惠券状态和失效原因
  const getCouponStatus = (coupon) => {
    const now = new Date();
    const startTime = new Date(coupon.start_time);
    const endTime = new Date(coupon.end_time);
    
    if (coupon.status === 1) {
      return { status: '已使用', color: 'text-gray-500', bgColor: 'bg-gray-100' };
    }
    if (coupon.status === 2) {
      return { status: '已过期', color: 'text-red-500', bgColor: 'bg-red-50' };
    }
    if (now < startTime) {
      return { status: '未开始', color: 'text-blue-500', bgColor: 'bg-blue-50' };
    }
    if (now > endTime) {
      return { status: '已过期', color: 'text-red-500', bgColor: 'bg-red-50' };
    }
    return { status: '可使用', color: 'text-green-600', bgColor: 'bg-green-50' };
  };

  if (loading) return <div>加载中...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">我的优惠券</h2>
      {message && <div className="mb-2 text-green-600">{message}</div>}
      <div className="space-y-4">
        {coupons.length === 0 && <div>暂无优惠券</div>}
        {coupons.map(userCoupon => {
          const coupon = userCoupon.coupon || {};
          const statusInfo = getCouponStatus(userCoupon);
          const isUsable = userCoupon.status === 0 && statusInfo.status === '可使用';
          return (
            <div key={userCoupon.id} className={`border rounded p-4 flex justify-between items-center ${statusInfo.bgColor || ''}`}>
              <div>
                <div className="font-semibold">{coupon.name}</div>
                <div className="text-gray-500 text-sm">{coupon.type === 1 ? `满${coupon.threshold}减${coupon.amount}` : coupon.type === 2 ? `${coupon.amount * 10}折券` : ''}</div>
                <div className="text-xs text-gray-400">有效期：{coupon.start_time} ~ {coupon.end_time}</div>
                <div className={`text-xs ${statusInfo.color}`}>状态：{statusInfo.status}</div>
              </div>
              {isUsable ? (
                <button
                  className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                  onClick={() => handleUse(userCoupon.id)}
                >使用</button>
              ) : (
                <span className={`text-xs px-2 py-1 rounded ${statusInfo.color} bg-white`}>
                  {statusInfo.status}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyCoupons; 