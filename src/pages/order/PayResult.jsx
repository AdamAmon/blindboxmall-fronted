import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const PayResult = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const handleSuccess = async () => {
    if (!orderId) return;
    await axios.post('/api/pay/order/alipayNotify', { order_id: orderId, trade_no: 'MOCK_TRADE_NO' });
    navigate(`/order/detail/${orderId}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">支付宝支付模拟</h2>
        <p className="mb-6">请点击下方按钮模拟支付成功</p>
        <button
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-lg"
          onClick={handleSuccess}
        >
          支付成功
        </button>
      </div>
    </div>
  );
};

export default PayResult; 