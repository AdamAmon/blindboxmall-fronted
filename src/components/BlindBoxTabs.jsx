import React from 'react';

export default function BlindBoxTabs({ stats = {}, active, onChange }) {
  const tabs = [
    { key: 'all', label: `全部(${(stats.common?.blindBoxCount||0)+(stats.rare?.blindBoxCount||0)+(stats.hidden?.blindBoxCount||0)})` },
    { key: 'common', label: `普通(${stats.common?.blindBoxCount||0})` },
    { key: 'rare', label: `稀有(${stats.rare?.blindBoxCount||0})` },
    { key: 'hidden', label: `隐藏(${stats.hidden?.blindBoxCount||0})` }
  ];
  return (
    <div className="flex gap-2 mb-4">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-4 py-1 rounded ${active===tab.key ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
} 