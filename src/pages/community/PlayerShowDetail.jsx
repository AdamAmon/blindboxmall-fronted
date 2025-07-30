import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/axios';
import { useParams } from 'react-router-dom';

// 轮播组件
function ImageCarousel({ images = [] }) {
  const [current, setCurrent] = useState(0);
  if (!images.length) return null;
  const prev = () => setCurrent((current - 1 + images.length) % images.length);
  const next = () => setCurrent((current + 1) % images.length);
  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="w-full flex justify-center items-center">
        <button onClick={prev} className="text-2xl px-2" disabled={images.length <= 1}>{'<'}</button>
        <img
          src={images[current]}
          alt={`第${current + 1}张`}
          className="max-w-[320px] max-h-[320px] rounded shadow mx-2"
        />
        <button onClick={next} className="text-2xl px-2" disabled={images.length <= 1}>{'>'}</button>
      </div>
      <div className="flex justify-center mt-2 gap-1">
        {images.map((_, idx) => (
          <span
            key={idx}
            className={`inline-block w-2 h-2 rounded-full ${idx === current ? 'bg-blue-500' : 'bg-gray-300'}`}
          />
        ))}
      </div>
    </div>
  );
}

const PlayerShowDetail = () => {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState(null); // 当前正在回复的评论ID
  const [replyToUser, setReplyToUser] = useState(null); // 正在回复的用户名/ID
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/community/show/detail', { params: { id } });
      if (res.data.success) {
        setShow(res.data.data);
      } else {
        setError(res.data.message || '获取详情失败');
      }
    } catch {
      setError('获取详情失败');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    try {
      const res = await api.get('/api/community/show/comments', { params: { show_id: id } });
      if (res.data.success) {
        setComments(res.data.data);
      }
    } catch {
      // 轮询异常可忽略
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
    fetchComments();
  }, [fetchDetail, fetchComments]);

  const handleComment = async () => {
    if (!user) return alert('请先登录');
    if (!commentContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post('/api/community/show/comment', {
        show_id: id,
        user_id: user.id,
        content: commentContent,
        parent_id: replyTo // 为空则为顶级评论
      });
      if (res.data.success) {
        setCommentContent('');
        setReplyTo(null);
        setReplyToUser(null);
        fetchComments();
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 递归渲染评论树
  const renderComments = (list, level = 0) => (
    <div className={level > 0 ? 'ml-6 border-l pl-4' : ''}>
      {list.map(comment => (
        <div key={comment.id} className="mb-2">
          <div className="text-sm text-gray-800 font-semibold">用户ID: {comment.user_id}</div>
          <div className="text-gray-700 mb-1">{comment.content}</div>
          <div className="text-xs text-gray-400 mb-1">{comment.created_at && new Date(comment.created_at).toLocaleString()}</div>
          <button
            className="text-xs text-blue-500 hover:underline mr-2"
            onClick={() => {
              setReplyTo(comment.id);
              setReplyToUser(comment.user_id);
            }}
          >回复</button>
          {comment.children && comment.children.length > 0 && renderComments(comment.children, level + 1)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
      {loading ? (
        <div className="text-center py-12">加载中...</div>
      ) : !show ? (
        <div className="text-center py-12 text-gray-500">玩家秀不存在</div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2 w-full">
                {/* 替换原图片展示为轮播 */}
                <ImageCarousel images={show.images} />
              </div>
              <div className="md:w-1/2 w-full flex flex-col">
                <div className="font-bold text-xl mb-2">{show.content}</div>
                <div className="text-xs text-gray-500 mb-2">{show.created_at && new Date(show.created_at).toLocaleString()}</div>
                <div className="text-xs text-gray-400 mb-2">用户ID: {show.user_id}</div>
                {/* 可扩展点赞、评论数、奖品信息等 */}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">评论</h2>
            {comments.length === 0 ? (
              <div className="text-gray-400 text-center">暂无评论</div>
            ) : (
              renderComments(comments)
            )}
            <div className="mt-6 flex gap-2 items-center">
              <input
                className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder={replyToUser ? `回复用户ID: ${replyToUser}` : '写下你的评论...'}
                value={commentContent}
                onChange={e => setCommentContent(e.target.value)}
                disabled={submitting}
              />
              {replyTo && (
                <button
                  className="text-xs text-gray-500 hover:text-red-500 mr-2"
                  onClick={() => { setReplyTo(null); setReplyToUser(null); }}
                >取消回复</button>
              )}
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                onClick={handleComment}
                disabled={submitting || !commentContent.trim()}
              >发表评论</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PlayerShowDetail; 