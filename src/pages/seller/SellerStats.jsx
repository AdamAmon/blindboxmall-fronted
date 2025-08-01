import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import { toast } from 'react-toastify';

const SellerStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/api/blindbox/seller/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.data;
        if (data.code === 200) {
          setStats(data.data);
        } else {
          setError(data.message || '获取统计数据失败');
          toast.error(data.message || '获取统计数据失败');
        }
      } catch (error) {
        console.error('获取统计数据失败:', error);
        setError('网络错误');
        toast.error('获取统计数据失败');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400 animate-ping"></div>
          </div>
          <p className="mt-6 text-lg text-gray-600 font-medium">正在加载统计数据...</p>
          <p className="mt-2 text-sm text-gray-500">精彩数据马上呈现</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
            ❌
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">加载失败</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-blue-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
            📊
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">暂无统计数据</h2>
          <p className="text-gray-600 mb-8">您还没有任何盲盒数据，快去创建盲盒开始管理吧！</p>
          <button
            onClick={() => navigate('/seller')}
            className="px-8 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn"
          >
            返回商家面板
          </button>
        </div>
      </div>
    );
  }

  // 计算百分比和进度条数据
  const getProgressPercentage = (current, max) => {
    if (max === 0) return 0;
    return Math.min((current / max) * 100, 100);
  };

  const getValueProgress = () => {
    const maxValue = Math.max(stats.totalValue || 0, 10000); // 设置最大值为10000或实际价值
    return getProgressPercentage(stats.totalValue || 0, maxValue);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 返回按钮 */}
        <button
          onClick={() => navigate('/seller')}
          className="flex items-center text-gray-600 hover:text-purple-600 mb-8 transition-colors duration-200 group"
        >
          <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">返回商家面板</span>
        </button>

        {/* 标题区域 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mb-6">
            <span className="text-4xl">📊</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            商家统计数据
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            查看您的盲盒管理数据，了解库存状况和业务表现
          </p>
        </div>

        {/* 主要统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-6 text-center hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent mb-2">
              {stats.totalBlindBoxes ?? 0}
            </div>
            <div className="text-gray-600 font-medium">总盲盒数</div>
            <div className="text-xs text-gray-400 mt-1">已创建的盲盒系列</div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500" style={{width: `${Math.min((stats.totalBlindBoxes / 10) * 100, 100)}%`}}></div>
            </div>
          </div>
          <div className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-6 text-center hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent mb-2">
              {stats.listedBlindBoxes ?? 0}
            </div>
            <div className="text-gray-600 font-medium">上架盲盒</div>
            <div className="text-xs text-gray-400 mt-1">正在销售的盲盒</div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500" style={{width: `${getProgressPercentage(stats.listedBlindBoxes || 0, Math.max(stats.totalBlindBoxes || 0, 1))}%`}}></div>
            </div>
          </div>
          <div className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-6 text-center hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent mb-2">
              {stats.totalItems ?? 0}
            </div>
            <div className="text-gray-600 font-medium">总商品数</div>
            <div className="text-xs text-gray-400 mt-1">盲盒内的商品总数</div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-500" style={{width: `${Math.min((stats.totalItems / 50) * 100, 100)}%`}}></div>
            </div>
          </div>
          <div className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-6 text-center hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent mb-2">
              ¥{stats.totalValue?.toFixed(2) ?? '0.00'}
            </div>
            <div className="text-gray-600 font-medium">总价值</div>
            <div className="text-xs text-gray-400 mt-1">库存商品总价值</div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all duration-500" style={{width: `${getValueProgress()}%`}}></div>
            </div>
          </div>
        </div>

        {/* 详细数据区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* 左侧：详细数据表格 */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="mr-3">📋</span>
              详细数据
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div>
                  <div className="font-semibold text-gray-800">总盲盒数</div>
                  <div className="text-sm text-gray-600">已创建的盲盒系列</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{stats.totalBlindBoxes ?? '-'}</div>
                  <div className="text-xs text-gray-500">反映业务规模</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div>
                  <div className="font-semibold text-gray-800">上架盲盒</div>
                  <div className="text-sm text-gray-600">正在销售的盲盒</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{stats.listedBlindBoxes ?? '-'}</div>
                  <div className="text-xs text-gray-500">活跃商品数</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <div>
                  <div className="font-semibold text-gray-800">总商品数</div>
                  <div className="text-sm text-gray-600">盲盒内的商品总数</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600">{stats.totalItems ?? '-'}</div>
                  <div className="text-xs text-gray-500">商品丰富度</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
                <div>
                  <div className="font-semibold text-gray-800">库存剩余</div>
                  <div className="text-sm text-gray-600">所有盲盒的库存总量</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-orange-600">{stats.totalStock ?? '-'}</div>
                  <div className="text-xs text-gray-500">库存状况</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                <div>
                  <div className="font-semibold text-gray-800">总价值</div>
                  <div className="text-sm text-gray-600">库存商品总价值</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-yellow-600">¥{stats.totalValue?.toFixed(2) ?? '-'}</div>
                  <div className="text-xs text-gray-500">资产价值</div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：业务分析和建议 */}
          <div className="space-y-6">
            {/* 业务分析 */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📈</span>
                业务分析
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-blue-800">上架率</span>
                    <span className="text-sm text-blue-600">
                      {stats.totalBlindBoxes > 0 
                        ? `${((stats.listedBlindBoxes / stats.totalBlindBoxes) * 100).toFixed(1)}%`
                        : '0%'}
                    </span>
                  </div>
                  <div className="text-sm text-blue-700">
                    上架盲盒数 / 总盲盒数，反映商品活跃度
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-green-800">平均商品数</span>
                    <span className="text-sm text-green-600">
                      {stats.totalBlindBoxes > 0 
                        ? Math.round(stats.totalItems / stats.totalBlindBoxes)
                        : 0}
                    </span>
                  </div>
                  <div className="text-sm text-green-700">
                    总商品数 / 总盲盒数，反映盲盒内容丰富度
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-purple-800">平均单价</span>
                    <span className="text-sm text-purple-600">
                      {stats.totalBlindBoxes > 0 
                        ? `¥${(stats.totalValue / stats.totalStock).toFixed(2)}`
                        : '¥0.00'}
                    </span>
                  </div>
                  <div className="text-sm text-purple-700">
                    总价值 / 总库存数，反映平均定价水平
                  </div>
                </div>
              </div>
            </div>

            {/* 业务建议 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                <span className="mr-2">💡</span>
                业务建议
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="mr-3 text-blue-500">📦</span>
                  <div>
                    <div className="font-semibold text-blue-800">库存管理</div>
                    <div className="text-sm text-blue-700">定期检查库存，及时补充热销盲盒</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="mr-3 text-blue-500">🎯</span>
                  <div>
                    <div className="font-semibold text-blue-800">商品丰富度</div>
                    <div className="text-sm text-blue-700">为每个盲盒添加更多商品，提高吸引力</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="mr-3 text-blue-500">📊</span>
                  <div>
                    <div className="font-semibold text-blue-800">上架策略</div>
                    <div className="text-sm text-blue-700">提高上架率，让更多盲盒参与销售</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="mr-3 text-blue-500">🚀</span>
                  <div>
                    <div className="font-semibold text-blue-800">价值优化</div>
                    <div className="text-sm text-blue-700">根据市场反馈调整盲盒定价策略</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate('/seller')}
            className="px-8 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-btn"
          >
            返回商家面板
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:border-primary hover:bg-primary/5 transition-all duration-200"
          >
            刷新数据
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerStats;