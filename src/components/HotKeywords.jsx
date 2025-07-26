import React from 'react';

export default function HotKeywords({ keywords = [], onClick }) {
  if (!keywords.length) return null;
  return (
    <div className="mb-2 text-sm text-gray-600">
      热门搜索：
      {keywords.map(kw => (
        <button
          key={kw}
          onClick={() => onClick(kw)}
          className="mx-1 px-2 py-0.5 bg-gray-100 hover:bg-purple-100 rounded border border-gray-200"
        >
          {kw}
        </button>
      ))}
    </div>
  );
} 