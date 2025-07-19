import React, { useState } from 'react';

export default function RechargeModal({ open, onClose, onRecharge }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('请输入有效的充值金额');
      return;
    }
    setLoading(true);
    try {
      await onRecharge(num);
      onClose();
      setAmount('');
    } catch (err) {
      setError(err?.message || '充值失败');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-xl p-8 w-[340px] relative">
        <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" onClick={onClose}>
          <span className="material-icons">close</span>
        </button>
        <h3 className="text-xl font-bold mb-4 text-center">余额充值</h3>
        {error && <div className="mb-2 p-2 bg-red-100 text-red-700 rounded text-sm text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">充值金额（元）</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-center"
              placeholder="请输入充值金额"
              required
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading} className={`w-full py-2 rounded-md font-semibold text-lg ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}>{loading ? '提交中...' : '立即充值'}</button>
        </form>
      </div>
    </div>
  );
} 