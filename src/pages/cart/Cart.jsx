import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [quantityMap, setQuantityMap] = useState({}); // {cartId: quantity}
  const debounceTimers = useRef({});
  const navigate = useNavigate();
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/cart/list', { params: { user_id: user.id } });
      setCartItems(res.data.data || []);
      // 初始化数量映射
      const map = {};
      (res.data.data || []).forEach(item => { map[item.id] = item.quantity; });
      setQuantityMap(map);
    } catch {
      setError('获取购物车失败');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      navigate('/login', { replace: true });
    } else {
      fetchCart();
    }
  }, [user?.id, fetchCart, navigate]);

  // 防抖更新数量
  const debouncedUpdateQuantity = (cartId, quantity) => {
    if (debounceTimers.current[cartId]) {
      clearTimeout(debounceTimers.current[cartId]);
    }
    debounceTimers.current[cartId] = setTimeout(() => {
      handleQuantityChange(cartId, quantity);
    }, 500);
  };

  const handleQuantityInput = (cartId, value, stock) => {
    let quantity = parseInt(value) || 1;
    if (quantity < 1) quantity = 1;
    if (stock && quantity > stock) quantity = stock;
    setQuantityMap(q => ({ ...q, [cartId]: quantity }));
    debouncedUpdateQuantity(cartId, quantity);
  };

  const handleQuantityChange = async (cartId, quantity) => {
    if (quantity < 1) return;
    setUpdating(true);
    try {
      await axios.post('/api/cart/update', { cart_id: cartId, quantity });
      fetchCart();
    } catch {
      setError('更新数量失败');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (cartId) => {
    setUpdating(true);
    try {
      await axios.post('/api/cart/delete', { cart_id: cartId });
      fetchCart();
    } catch {
      setError('删除失败');
    } finally {
      setUpdating(false);
    }
  };

  const handleClear = async () => {
    setUpdating(true);
    try {
      await axios.post('/api/cart/clear', { user_id: user.id });
      fetchCart();
    } catch {
      setError('清空失败');
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckout = () => {
    navigate('/order/confirm');
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.quantity * (item.blindBox?.price || 0)), 0);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">购物车</h1>
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
      {loading ? (
        <div className="text-center py-12">加载中...</div>
      ) : cartItems.length === 0 ? (
        <div className="text-center py-12 text-gray-500">购物车为空</div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <table className="w-full mb-4">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="py-2">盲盒</th>
                <th className="py-2">单价</th>
                <th className="py-2">数量</th>
                <th className="py-2">小计</th>
                <th className="py-2">操作</th>
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
                  <td className="py-2">
                    <input
                      type="number"
                      min={1}
                      max={item.blindBox?.stock || 9999}
                      value={quantityMap[item.id] ?? item.quantity}
                      disabled={updating}
                      onChange={e => handleQuantityInput(item.id, e.target.value, item.blindBox?.stock)}
                      className="w-16 px-2 py-1 border rounded"
                    />
                    <span className="ml-2 text-xs text-gray-400">库存：{item.blindBox?.stock ?? '-'}</span>
                  </td>
                  <td className="py-2">￥{(item.quantity * (item.blindBox?.price || 0)).toFixed(2)}</td>
                  <td className="py-2">
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={updating}
                      className="text-red-500 hover:underline"
                    >删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handleClear}
              disabled={updating}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >清空购物车</button>
            <div className="text-lg font-bold">总价：￥{totalPrice.toFixed(2)}</div>
            <button
              onClick={handleCheckout}
              disabled={updating || cartItems.length === 0}
              className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >去结算</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart; 