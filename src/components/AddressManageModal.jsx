import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AddressManageModal({ userId, open, onClose, onSelectDefault }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ recipient: '', phone: '', province: '', city: '', district: '', detail: '', is_default: false });
  const [formMode, setFormMode] = useState('add');

  useEffect(() => {
    if (open) fetchList();
  }, [open]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/address/list', { params: { userId } });
      setList(res.data.data || []);
    } catch (e) {
      setError('获取地址失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm({ ...item });
    setFormMode('edit');
  };
  const handleAdd = () => {
    setEditItem(null);
    setForm({ recipient: '', phone: '', province: '', city: '', district: '', detail: '', is_default: false });
    setFormMode('add');
  };
  const handleDelete = async (id) => {
    if (!window.confirm('确定删除该地址吗？')) return;
    await axios.post(`/api/address/delete?userId=${userId}`, { id });
    fetchList();
  };
  const handleSetDefault = async (id) => {
    await axios.post(`/api/address/set_default?userId=${userId}`, { id });
    fetchList();
    if (onSelectDefault) onSelectDefault();
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (formMode === 'add') {
      await axios.post(`/api/address/create?userId=${userId}`, {
        recipient: form.recipient,
        phone: form.phone,
        province: form.province,
        city: form.city,
        district: form.district,
        detail: form.detail,
        is_default: form.is_default
      });
    } else {
      await axios.post(`/api/address/update?userId=${userId}`, {
        id: editItem.id,
        recipient: form.recipient,
        phone: form.phone,
        province: form.province,
        city: form.city,
        district: form.district,
        detail: form.detail,
        is_default: form.is_default
      });
    }
    setEditItem(null);
    setFormMode('add');
    fetchList();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-xl p-8 w-[420px] max-h-[90vh] overflow-y-auto relative">
        <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" onClick={onClose}>
          <span className="material-icons">close</span>
        </button>
        <h3 className="text-xl font-bold mb-4 text-center">地址管理</h3>
        {error && <div className="mb-2 p-2 bg-red-100 text-red-700 rounded text-sm text-center">{error}</div>}
        <div className="mb-4 flex justify-between items-center">
          <span className="font-semibold">我的地址</span>
          <button className="text-green-600 hover:underline text-sm" onClick={handleAdd}>新增地址</button>
        </div>
        <ul className="space-y-3 mb-6">
          {loading ? <li>加载中...</li> : list.length === 0 ? <li className="text-gray-400">暂无地址</li> : list.map(addr => (
            <li key={addr.id} className={`p-3 rounded border ${addr.is_default ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'} flex flex-col space-y-1 relative`}>
              <div className="flex justify-between items-center">
                <span className="font-bold">{addr.recipient}</span>
                {addr.is_default && <span className="text-xs text-green-600 ml-2">默认</span>}
              </div>
              <div className="text-sm text-gray-600">{addr.phone}</div>
              <div className="text-sm text-gray-600">{addr.province}{addr.city}{addr.district}{addr.detail}</div>
              <div className="flex space-x-2 mt-2">
                {!addr.is_default && <button className="text-green-600 hover:underline text-xs" onClick={() => handleSetDefault(addr.id)}>设为默认</button>}
                <button className="text-blue-600 hover:underline text-xs" onClick={() => handleEdit(addr)}>编辑</button>
                <button className="text-red-500 hover:underline text-xs" onClick={() => handleDelete(addr.id)}>删除</button>
              </div>
            </li>
          ))}
        </ul>
        <form onSubmit={handleFormSubmit} className="space-y-2 border-t pt-4">
          <div className="font-semibold mb-2">{formMode === 'add' ? '新增地址' : '编辑地址'}</div>
          <input className="w-full px-3 py-2 border rounded-md" placeholder="收件人" name="recipient" value={form.recipient} onChange={e => setForm(f => ({ ...f, recipient: e.target.value }))} required />
          <input className="w-full px-3 py-2 border rounded-md" placeholder="手机号" name="phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
          <input className="w-full px-3 py-2 border rounded-md" placeholder="省" name="province" value={form.province} onChange={e => setForm(f => ({ ...f, province: e.target.value }))} required />
          <input className="w-full px-3 py-2 border rounded-md" placeholder="市" name="city" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} required />
          <input className="w-full px-3 py-2 border rounded-md" placeholder="区" name="district" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} required />
          <input className="w-full px-3 py-2 border rounded-md" placeholder="详细地址" name="detail" value={form.detail} onChange={e => setForm(f => ({ ...f, detail: e.target.value }))} required />
          <label className="flex items-center space-x-2 text-sm">
            <input type="checkbox" checked={form.is_default} onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))} />
            <span>设为默认地址</span>
          </label>
          <button type="submit" className="w-full py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 transition">{formMode === 'add' ? '添加' : '保存'}</button>
        </form>
      </div>
    </div>
  );
} 