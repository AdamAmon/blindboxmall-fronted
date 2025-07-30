import React, { useState } from 'react';

export default function BlindBoxFilter({ onFilter, defaultValues = {} }) {
  const [form, setForm] = useState({
    keyword: defaultValues.keyword || '',
    minPrice: defaultValues.minPrice || '',
    maxPrice: defaultValues.maxPrice || '',
    rarity: defaultValues.rarity || '',
    status: defaultValues.status || '',
    sortBy: defaultValues.sortBy || 'created_at',
    order: defaultValues.order || 'desc',
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = e => {
    e.preventDefault();
    onFilter(form);
  };
  const handleReset = () => {
    setForm({ keyword: '', minPrice: '', maxPrice: '', rarity: '', status: '', sortBy: 'created_at', order: 'desc' });
    onFilter({});
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 mb-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 搜索行 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              name="keyword" 
              value={form.keyword} 
              onChange={handleChange} 
              placeholder="搜索盲盒名称或描述..." 
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white/70 backdrop-blur-sm text-gray-800 font-medium"
            />
          </div>
          
          <button 
            type="submit" 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            搜索
          </button>
        </div>

        {/* 筛选条件行 - 修复响应式布局 */}
        <div className="space-y-4">
          {/* 第一行：价格范围和稀有度 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 价格范围 */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">价格范围</label>
              <div className="flex gap-2">
                <input 
                  name="minPrice" 
                  value={form.minPrice} 
                  onChange={handleChange} 
                  placeholder="最低价" 
                  type="number" 
                  className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white/70 backdrop-blur-sm text-gray-800 font-medium"
                />
                <span className="flex items-center text-gray-500 font-medium px-2">-</span>
                <input 
                  name="maxPrice" 
                  value={form.maxPrice} 
                  onChange={handleChange} 
                  placeholder="最高价" 
                  type="number" 
                  className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white/70 backdrop-blur-sm text-gray-800 font-medium"
                />
              </div>
            </div>

            {/* 稀有度 */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">稀有度</label>
              <select 
                name="rarity" 
                value={form.rarity} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white/70 backdrop-blur-sm text-gray-800 font-medium"
              >
                <option value="">全部稀有度</option>
                <option value="1">普通</option>
                <option value="2">稀有</option>
                <option value="3">隐藏</option>
              </select>
            </div>
          </div>

          {/* 第二行：状态和排序 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 状态 */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">状态</label>
              <select 
                name="status" 
                value={form.status} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white/70 backdrop-blur-sm text-gray-800 font-medium"
              >
                <option value="">全部状态</option>
                <option value="1">上架</option>
                <option value="0">下架</option>
              </select>
            </div>

            {/* 排序 */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">排序方式</label>
              <div className="flex gap-2">
                <select 
                  name="sortBy" 
                  value={form.sortBy} 
                  onChange={handleChange} 
                  className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white/70 backdrop-blur-sm text-gray-800 font-medium"
                >
                  <option value="created_at">最新</option>
                  <option value="price">价格</option>
                  <option value="stock">库存</option>
                  <option value="name">名称</option>
                </select>
                <select 
                  name="order" 
                  value={form.order} 
                  onChange={handleChange} 
                  className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white/70 backdrop-blur-sm text-gray-800 font-medium"
                >
                  <option value="desc">降序</option>
                  <option value="asc">升序</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮行 */}
        <div className="flex justify-end pt-2">
          <button 
            type="button" 
            onClick={handleReset} 
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            重置筛选
          </button>
        </div>
      </form>
    </div>
  );
} 