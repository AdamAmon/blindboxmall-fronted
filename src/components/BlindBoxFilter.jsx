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
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-center mb-4">
      <input name="keyword" value={form.keyword} onChange={handleChange} placeholder="搜索盲盒..." className="px-2 py-1 border rounded" />
      <input name="minPrice" value={form.minPrice} onChange={handleChange} placeholder="最低价" type="number" className="px-2 py-1 border rounded w-20" />
      <input name="maxPrice" value={form.maxPrice} onChange={handleChange} placeholder="最高价" type="number" className="px-2 py-1 border rounded w-20" />
      <select name="rarity" value={form.rarity} onChange={handleChange} className="px-2 py-1 border rounded">
        <option value="">全部稀有度</option>
        <option value="1">普通</option>
        <option value="2">稀有</option>
        <option value="3">隐藏</option>
      </select>
      <select name="status" value={form.status} onChange={handleChange} className="px-2 py-1 border rounded">
        <option value="">全部状态</option>
        <option value="1">上架</option>
        <option value="0">下架</option>
      </select>
      <select name="sortBy" value={form.sortBy} onChange={handleChange} className="px-2 py-1 border rounded">
        <option value="created_at">最新</option>
        <option value="price">价格</option>
        <option value="stock">库存</option>
      </select>
      <select name="order" value={form.order} onChange={handleChange} className="px-2 py-1 border rounded">
        <option value="desc">降序</option>
        <option value="asc">升序</option>
      </select>
      <button type="submit" className="bg-purple-600 text-white px-4 py-1 rounded">搜索</button>
      <button type="button" onClick={handleReset} className="bg-gray-200 px-4 py-1 rounded">重置</button>
    </form>
  );
} 