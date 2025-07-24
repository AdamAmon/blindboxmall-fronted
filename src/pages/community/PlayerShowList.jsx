import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PlayerShowList = () => {
  const [shows, setShows] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchShows = useCallback(async (pageNum = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/community/show/list', { params: { page: pageNum, pageSize } });
      if (res.data.success) {
        setShows(res.data.data.list);
        setTotal(res.data.data.total);
        setPage(res.data.data.page);
      } else {
        setError(res.data.message || '获取玩家秀失败');
      }
    } catch {
      setError('获取玩家秀失败');
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchShows(page);
  }, [fetchShows, page]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= Math.ceil(total / pageSize)) {
      setPage(newPage);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">玩家秀广场</h1>
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
      {loading ? (
        <div className="text-center py-12">加载中...</div>
      ) : shows.length === 0 ? (
        <div className="text-center py-12 text-gray-500">暂无玩家秀</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {shows.map(show => (
            <div
              key={show.id}
              className="bg-white rounded-lg shadow p-4 flex flex-col cursor-pointer hover:shadow-lg transition"
              onClick={() => navigate(`/shows/${show.id}`)}
            >
              <div className="w-full h-48 bg-gray-100 rounded mb-2 overflow-hidden flex items-center justify-center">
                {show.images && show.images.length > 0 ? (
                  <img src={show.images[0]} alt="玩家秀" className="object-cover w-full h-full" />
                ) : (
                  <span className="text-gray-400">无图</span>
                )}
              </div>
              <div className="font-semibold text-lg mb-1 truncate">{show.content?.slice(0, 30) || '无内容'}</div>
              <div className="text-xs text-gray-500 mb-1">{show.created_at && new Date(show.created_at).toLocaleString()}</div>
              <div className="flex justify-between items-center text-xs text-gray-400 mt-auto">
                <span>用户ID: {show.user_id}</span>
                {/* 可扩展点赞/评论数等 */}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* 分页控件 */}
      <div className="flex justify-center items-center gap-2">
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >上一页</button>
        <span className="mx-2">{page} / {Math.max(1, Math.ceil(total / pageSize))}</span>
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= Math.ceil(total / pageSize)}
        >下一页</button>
      </div>
    </div>
  );
};

export default PlayerShowList; 