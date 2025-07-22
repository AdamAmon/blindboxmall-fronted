import React, { useEffect, useState } from 'react';
import { getToken } from '../../utils.js';

const SellerStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/blindbox/seller/stats', {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();
        if (data.code === 200) {
          setStats(data.data);
        } else {
          setError(data.message || '获取统计数据失败');
        }
      } catch {
        setError('网络错误');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>加载中...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!stats) return <div>暂无统计数据</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>商家统计数据</h2>
      <div style={{ margin: '24px 0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ fontWeight: 'bold' }}>总销售额：</td>
              <td>¥{stats.totalSales?.toFixed(2) ?? '-'}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold' }}>已售盲盒数：</td>
              <td>{stats.totalSold ?? '-'}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold' }}>抽奖次数：</td>
              <td>{stats.totalDraws ?? '-'}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold' }}>当前在售盲盒：</td>
              <td>{stats.activeBoxes ?? '-'}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold' }}>库存剩余：</td>
              <td>{stats.totalStock ?? '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* 可扩展为图表、趋势等可视化内容 */}
    </div>
  );
};

export default SellerStats; 