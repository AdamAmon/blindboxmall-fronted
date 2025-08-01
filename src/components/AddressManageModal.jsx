import React, { useEffect, useState, useCallback } from 'react';
import api from '../utils/axios';

export default function AddressManageModal({ userId, open, onClose, onSelectDefault }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ recipient: '', phone: '', province: '', city: '', district: '', detail: '', is_default: false });
  const [formMode, setFormMode] = useState('add');

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/address/list', { params: { userId } });
      setList(res.data.data || []);
    } catch {
      setError('获取地址失败');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (open) fetchList();
  }, [open, fetchList]);

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
    await api.post(`/api/address/delete?userId=${userId}`, { id });
    fetchList();
  };
  const handleSetDefault = async (id) => {
    await api.post(`/api/address/set_default?userId=${userId}`, { id });
    fetchList();
    if (onSelectDefault) onSelectDefault();
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (formMode === 'add') {
      await api.post(`/api/address/create?userId=${userId}`, {
        recipient: form.recipient,
        phone: form.phone,
        province: form.province,
        city: form.city,
        district: form.district,
        detail: form.detail,
        is_default: form.is_default
      });
    } else {
      await api.post(`/api/address/update?userId=${userId}`, {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 w-[480px] max-h-[90vh] overflow-hidden relative">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-3xl"></div>
        
        {/* 头部 */}
        <div className="relative z-10 bg-gradient-to-r from-primary to-secondary p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white font-brand flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              地址管理
            </h3>
            <button 
              className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/20" 
              onClick={onClose}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="relative z-10 p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {error && (
            <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 rounded-2xl text-center font-medium">
              {error}
            </div>
          )}

          {/* 地址列表 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-gray-800 font-brand flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                我的地址
              </h4>
              <button 
                className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn text-sm" 
                onClick={handleAdd}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                新增地址
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full mb-4 animate-pulse">
                  <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">加载中...</p>
              </div>
            ) : list.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  📍
                </div>
                <p className="text-gray-500 font-medium">暂无地址</p>
                <p className="text-gray-400 text-sm mt-1">点击上方按钮添加新地址</p>
              </div>
            ) : (
              <div className="space-y-4">
                {list.map(addr => (
                  <div key={addr.id} className={`p-4 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg ${
                    addr.is_default 
                      ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-md' 
                      : 'border-gray-200 bg-white hover:border-primary/30'
                  }`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <span className="font-bold text-gray-800 text-lg">{addr.recipient}</span>
                        {addr.is_default && (
                          <span className="ml-3 px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs rounded-full font-bold">
                            默认
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                        {addr.phone}
                      </div>
                      <div className="flex items-start text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-primary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <span className="leading-relaxed">{addr.province}{addr.city}{addr.district}{addr.detail}</span>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      {!addr.is_default && (
                        <button 
                          className="flex items-center px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn text-sm" 
                          onClick={() => handleSetDefault(addr.id)}
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          设为默认
                        </button>
                      )}
                      <button 
                        className="flex items-center px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn text-sm" 
                        onClick={() => handleEdit(addr)}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        编辑
                      </button>
                      <button 
                        className="flex items-center px-3 py-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn text-sm" 
                        onClick={() => handleDelete(addr.id)}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 表单区域 */}
          <form onSubmit={handleFormSubmit} className="border-t border-gray-200 pt-6">
            <div className="mb-4">
              <h4 className="text-lg font-bold text-gray-800 font-brand flex items-center mb-4">
                <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                {formMode === 'add' ? '新增地址' : '编辑地址'}
              </h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">收件人</label>
                <input 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white/80 backdrop-blur-sm" 
                  placeholder="请输入收件人姓名" 
                  name="recipient" 
                  value={form.recipient} 
                  onChange={e => setForm(f => ({ ...f, recipient: e.target.value }))} 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">手机号</label>
                <input 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white/80 backdrop-blur-sm" 
                  placeholder="请输入手机号" 
                  name="phone" 
                  value={form.phone} 
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} 
                  required 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">省</label>
                <input 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white/80 backdrop-blur-sm" 
                  placeholder="省" 
                  name="province" 
                  value={form.province} 
                  onChange={e => setForm(f => ({ ...f, province: e.target.value }))} 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">市</label>
                <input 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white/80 backdrop-blur-sm" 
                  placeholder="市" 
                  name="city" 
                  value={form.city} 
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))} 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">区</label>
                <input 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white/80 backdrop-blur-sm" 
                  placeholder="区" 
                  name="district" 
                  value={form.district} 
                  onChange={e => setForm(f => ({ ...f, district: e.target.value }))} 
                  required 
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">详细地址</label>
              <input 
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white/80 backdrop-blur-sm" 
                placeholder="请输入详细地址" 
                name="detail" 
                value={form.detail} 
                onChange={e => setForm(f => ({ ...f, detail: e.target.value }))} 
                required 
              />
            </div>
            
            <div className="mb-6">
              <label className="flex items-center space-x-3 text-sm font-bold text-gray-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={form.is_default} 
                  onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))}
                  className="w-5 h-5 text-primary border-2 border-gray-300 rounded focus:ring-2 focus:ring-primary/20 focus:ring-offset-0"
                />
                <span>设为默认地址</span>
              </label>
            </div>
            
            <button 
              type="submit" 
              className="w-full py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-2xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn text-lg"
            >
              {formMode === 'add' ? '添加地址' : '保存修改'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 