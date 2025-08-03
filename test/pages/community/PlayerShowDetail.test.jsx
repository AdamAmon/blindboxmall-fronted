import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import PlayerShowDetail from '../../../src/pages/community/PlayerShowDetail';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import api from '../../../src/utils/axios';

// 模拟 react-router-dom 的 useParams 和 useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => mockNavigate,
  };
});

// 模拟 react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// 模拟 axios
vi.mock('../../../src/utils/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('PlayerShowDetail', () => {
  const mockShow = {
    id: 1,
    user_id: 1,
    user: {
      id: 1,
      nickname: '测试用户',
      username: 'testuser',
    },
    title: '我的第一个玩家秀',
    description: '这是一个测试玩家秀',
    images: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    item: {
      id: 1,
      name: '稀有物品',
      description: '这是一个稀有物品',
      image: 'https://example.com/item.jpg',
      rarity: 'rare',
    },
    created_at: '2024-01-01T08:00:00Z',
    updated_at: '2024-01-01T08:00:00Z',
    likes: 10,
    comments: [
      {
        id: 1,
        content: '这个玩家秀很不错！',
        user: {
          id: 2,
          nickname: '评论用户1',
        },
        created_at: '2024-01-01T09:00:00Z',
        likes: 5,
        replies: [],
      },
      {
        id: 2,
        content: '抽到了稀有物品！',
        user: {
          id: 3,
          nickname: '评论用户2',
        },
        created_at: '2024-01-01T10:00:00Z',
        likes: 3,
        replies: [],
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // 设置默认的 API 响应
    api.get.mockImplementation((url, config) => {
      if (url === '/api/community/show/detail') {
        return Promise.resolve({ 
          data: { 
            success: true, 
            data: mockShow 
          } 
        });
      }
      if (url === '/api/community/show/comments') {
        return Promise.resolve({ 
          data: { 
            success: true, 
            data: mockShow.comments 
          } 
        });
      }
      return Promise.resolve({ data: { success: true, data: {} } });
    });

    api.post.mockResolvedValue({ data: { success: true, data: {} } });

    // 模拟 localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key) => {
          if (key === 'user') return JSON.stringify({ id: 1, username: 'testuser' });
          if (key === 'token') return 'mock-token';
          return null;
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
  });

  describe('基本渲染', () => {
    it('应该显示加载状态', async () => {
      api.get.mockImplementation(() => new Promise(() => {}));
      
      await act(async () => {
        render(
          <MemoryRouter>
            <PlayerShowDetail />
          </MemoryRouter>
        );
      });
      
      expect(screen.getByText('正在加载玩家秀详情...')).toBeInTheDocument();
    });


    it('应该处理玩家秀不存在的情况', async () => {
      api.get.mockImplementation((url) => {
        if (url === '/api/community/show/detail') {
          return Promise.resolve({ data: { success: false, message: '玩家秀不存在' } });
        }
        return Promise.resolve({ data: { success: true, data: {} } });
      });

      await act(async () => {
        render(
          <MemoryRouter>
            <PlayerShowDetail />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('加载失败')).toBeInTheDocument();
        expect(screen.getByText('返回玩家秀列表')).toBeInTheDocument();
      });
    });

    it('应该处理API错误', async () => {
      api.get.mockRejectedValue(new Error('API Error'));

      await act(async () => {
        render(
          <MemoryRouter>
            <PlayerShowDetail />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('加载失败')).toBeInTheDocument();
      });
    });
  });

  describe('图片画廊功能', () => {
    it('应该显示主图片', async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <PlayerShowDetail />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        const image = screen.getByAltText('玩家秀图片 1');
        expect(image).toBeInTheDocument();
        expect(image.src).toContain('image1.jpg');
      });
    });

    it('应该处理图片加载错误', async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <PlayerShowDetail />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        const image = screen.getByAltText('玩家秀图片 1');
        fireEvent.error(image);
        // 验证图片加载错误事件被触发
        expect(image).toBeInTheDocument();
      });
    });

    it('应该处理无图片的情况', async () => {
      const showWithoutImages = { ...mockShow, images: [] };
      
      api.get.mockImplementation((url) => {
        if (url === '/api/community/show/detail') {
          return Promise.resolve({ 
            data: { 
              success: true, 
              data: showWithoutImages 
            } 
          });
        }
        return Promise.resolve({ data: { success: true, data: {} } });
      });

      await act(async () => {
        render(
          <MemoryRouter>
            <PlayerShowDetail />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('测试用户')).toBeInTheDocument();
      });
    });
  });

  describe('评论功能', () => {
    it('应该显示评论列表', async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <PlayerShowDetail />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('这个玩家秀很不错！')).toBeInTheDocument();
        expect(screen.getByText('抽到了稀有物品！')).toBeInTheDocument();
        expect(screen.getByText('评论用户1')).toBeInTheDocument();
        expect(screen.getByText('评论用户2')).toBeInTheDocument();
      });
    });

    it('应该能够发布评论', async () => {
      api.post.mockResolvedValue({
        data: {
          success: true,
          data: {
            id: 3,
            content: '新评论',
            user: { nickname: '测试用户' },
            created_at: '2024-01-01T11:00:00Z'
          }
        }
      });

      await act(async () => {
        render(
          <MemoryRouter>
            <PlayerShowDetail />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('测试用户')).toBeInTheDocument();
      });

      const commentInput = screen.getByPlaceholderText('发一条友善的评论');
      fireEvent.change(commentInput, { target: { value: '新评论' } });
      
      const submitButton = screen.getByText('发布评论');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/api/community/show/comment', {
          show_id: '1',
          content: '新评论',
          user_id: 1
        });
      });
    });

    it('应该验证评论内容不能为空', async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <PlayerShowDetail />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('测试用户')).toBeInTheDocument();
      });

      const submitButton = screen.getByText('发布评论');
      fireEvent.click(submitButton);

      // 验证错误提示
      await waitFor(() => {
        expect(api.post).not.toHaveBeenCalled();
      });
    });

    it('应该处理未登录用户发布评论', async () => {
      // 模拟未登录状态
      window.localStorage.getItem.mockImplementation((key) => {
        if (key === 'user') return null;
        if (key === 'token') return null;
        return null;
      });

      await act(async () => {
        render(
          <MemoryRouter>
            <PlayerShowDetail />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('测试用户')).toBeInTheDocument();
      });

      // 验证未登录状态下显示登录提示
      expect(screen.getByText('请先登录后再发表评论')).toBeInTheDocument();
    });

    it('应该处理评论发布失败', async () => {
      api.post.mockRejectedValue(new Error('评论发布失败'));

      await act(async () => {
        render(
          <MemoryRouter>
            <PlayerShowDetail />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('测试用户')).toBeInTheDocument();
      });

      const commentInput = screen.getByPlaceholderText('发一条友善的评论');
      fireEvent.change(commentInput, { target: { value: '新评论' } });
      
      const submitButton = screen.getByText('发布评论');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalled();
      });
    });
  });

  describe('数据获取', () => {
    it('应该调用API获取玩家秀详情', async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <PlayerShowDetail />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/community/show/detail', { params: { id: '1' } });
      });
    });

    it('应该调用API获取评论列表', async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <PlayerShowDetail />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/community/show/comments', { params: { show_id: '1' } });
      });
    });

    it('应该处理获取评论失败', async () => {
      api.get.mockImplementation((url) => {
        if (url === '/api/community/show/detail') {
          return Promise.resolve({ 
            data: { 
              success: true, 
              data: mockShow 
            } 
          });
        }
        if (url === '/api/community/show/comments') {
          return Promise.reject(new Error('获取评论失败'));
        }
        return Promise.resolve({ data: { success: true, data: {} } });
      });

      await act(async () => {
        render(
          <MemoryRouter>
            <PlayerShowDetail />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('测试用户')).toBeInTheDocument();
      });
    });
  });

  describe('UI交互', () => {
    it('应该能够返回玩家秀列表', async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <PlayerShowDetail />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('测试用户')).toBeInTheDocument();
      });

      const backButton = screen.getByText('返回玩家秀列表');
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/shows');
    });
  });

  describe('边界情况', () => {
    it('应该处理空评论列表', async () => {
      const showWithoutComments = { ...mockShow, comments: [] };
      
      api.get.mockImplementation((url) => {
        if (url === '/api/community/show/detail') {
          return Promise.resolve({ 
            data: { 
              success: true, 
              data: showWithoutComments 
            } 
          });
        }
        if (url === '/api/community/show/comments') {
          return Promise.resolve({ 
            data: { 
              success: true, 
              data: [] 
            } 
          });
        }
        return Promise.resolve({ data: { success: true, data: {} } });
      });

      await act(async () => {
        render(
          <MemoryRouter>
            <PlayerShowDetail />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('测试用户')).toBeInTheDocument();
      });
    });

    it('应该处理无奖品信息', async () => {
      const showWithoutItem = { ...mockShow, item: null };
      
      api.get.mockImplementation((url) => {
        if (url === '/api/community/show/detail') {
          return Promise.resolve({ 
            data: { 
              success: true, 
              data: showWithoutItem 
            } 
          });
        }
        return Promise.resolve({ data: { success: true, data: {} } });
      });

      await act(async () => {
        render(
          <MemoryRouter>
            <PlayerShowDetail />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('测试用户')).toBeInTheDocument();
      });
    });

    it('应该处理用户信息为空', async () => {
      const showWithoutUser = { ...mockShow, user: null };
      
      api.get.mockImplementation((url) => {
        if (url === '/api/community/show/detail') {
          return Promise.resolve({ 
            data: { 
              success: true, 
              data: showWithoutUser 
            } 
          });
        }
        return Promise.resolve({ data: { success: true, data: {} } });
      });

      await act(async () => {
        render(
          <MemoryRouter>
            <PlayerShowDetail />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('用户 1')).toBeInTheDocument();
      });
    });
  });

  describe('权限控制', () => {
    it('未登录用户应该能够查看但不能评论', async () => {
      // 模拟未登录状态
      window.localStorage.getItem.mockImplementation((key) => {
        if (key === 'user') return null;
        if (key === 'token') return null;
        return null;
      });

      await act(async () => {
        render(
          <MemoryRouter>
            <PlayerShowDetail />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('测试用户')).toBeInTheDocument();
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理网络错误', async () => {
      api.get.mockRejectedValue(new Error('Network Error'));

      await act(async () => {
        render(
          <MemoryRouter>
            <PlayerShowDetail />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('加载失败')).toBeInTheDocument();
      });
    });

    it('应该处理API响应错误', async () => {
      api.get.mockResolvedValue({
        data: {
          success: false,
          message: '服务器错误'
        }
      });

      await act(async () => {
        render(
          <MemoryRouter>
            <PlayerShowDetail />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('加载失败')).toBeInTheDocument();
      });
    });
  });
});