import React from 'react';

export default function BlindBoxTabs({ stats = {}, active, onChange }) {
  const tabs = [
    { 
      key: 'all', 
      label: `全部(${(stats.common?.blindBoxCount||0)+(stats.rare?.blindBoxCount||0)+(stats.hidden?.blindBoxCount||0)})`,
      icon: '🎁',
      color: 'from-primary to-secondary'
    },
    { 
      key: 'common', 
      label: `普通(${stats.common?.blindBoxCount||0})`,
      icon: '⭐',
      color: 'from-green-500 to-emerald-600'
    },
    { 
      key: 'rare', 
      label: `稀有(${stats.rare?.blindBoxCount||0})`,
      icon: '💎',
      color: 'from-blue-500 to-indigo-600'
    },
    { 
      key: 'hidden', 
      label: `隐藏(${stats.hidden?.blindBoxCount||0})`,
      icon: '🌟',
      color: 'from-yellow-500 to-orange-600'
    }
  ];

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card border border-white/30 p-6 mb-8">
      <div className="flex flex-wrap gap-4">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`relative group px-8 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 ${
              active === tab.key 
                ? `bg-gradient-to-r ${tab.color} text-white shadow-lg shadow-${tab.color.split('-')[1]}-500/30` 
                : 'bg-white/70 text-gray-700 border-2 border-gray-200 hover:border-primary hover:bg-primary/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{tab.icon}</span>
              <span className="font-bold font-brand">{tab.label}</span>
            </div>
            
            {/* 激活状态指示器 */}
            {active === tab.key && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-10 h-1.5 bg-white rounded-full shadow-sm"></div>
            )}
            
            {/* 悬停效果 */}
            {active !== tab.key && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
} 