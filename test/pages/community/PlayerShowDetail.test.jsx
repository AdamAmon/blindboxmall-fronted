import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockParams = { id: 'SHOW123' };
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
  BrowserRouter: ({ children }) => <div data-testid="browser-router">{children}</div>,
}));

// Mock axios
const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
};
vi.mock('../../../src/utils/axios', () => ({
  default: mockApi,
}));

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
};

const mockShow = {
  id: 'SHOW123',
  title: '我的开箱体验',
  content: '这是一个很棒的开箱体验！',
  images: ['/image1.jpg', '/image2.jpg'],
  created_at: '2024-01-01T10:00:00Z',
  user_id: 2,
  user: {
    id: 2,
    username: 'showuser',
    avatar: '/avatar.jpg',
  },
  item: {
    id: 101,
    name: '测试奖品',
    image: '/prize.jpg',
  },
  comments: [
    {
      id: 1,
      content: '很棒的开箱！',
      created_at: '2024-01-01T11:00:00Z',
      user: {
        id: 3,
        username: 'commentuser',
        avatar: '/comment-avatar.jpg',
      },
      likes: 5,
    },
  ],
};

describe('PlayerShowDetail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));
    mockApi.get.mockResolvedValue({ data: { success: true, data: mockShow } });
    mockApi.post.mockResolvedValue({ data: { success: true } });
  });

  describe('基本渲染', () => {
    it('应该正确渲染玩家秀详情页面', async () => {
      const { default: PlayerShowDetail } = await import('../../../src/pages/community/PlayerShowDetail');
      renderWithRouter(<PlayerShowDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('这是一个很棒的开箱体验！')).toBeInTheDocument();
      });
    });
  });

  describe('API调用', () => {
    it('应该调用API获取玩家秀详情', async () => {
      const { default: PlayerShowDetail } = await import('../../../src/pages/community/PlayerShowDetail');
      renderWithRouter(<PlayerShowDetail />);
      
      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/api/community/show/detail', {
          params: { id: 'SHOW123' }
        });
      });
    });

    it('应该调用API获取评论列表', async () => {
      const { default: PlayerShowDetail } = await import('../../../src/pages/community/PlayerShowDetail');
      renderWithRouter(<PlayerShowDetail />);
      
      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/api/community/show/comments', {
          params: { show_id: 'SHOW123' }
        });
      });
    });
  });

  describe('图片功能', () => {
    it('应该显示图片列表', async () => {
      const { default: PlayerShowDetail } = await import('../../../src/pages/community/PlayerShowDetail');
      renderWithRouter(<PlayerShowDetail />);
      
      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThan(0);
      });
    });
  });

  describe('用户权限', () => {
    it('应该能够获取用户信息', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));
      const { default: PlayerShowDetail } = await import('../../../src/pages/community/PlayerShowDetail');
      renderWithRouter(<PlayerShowDetail />);
      
      // 使用 waitFor 包裹断言
      await waitFor(() => {
        expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
      });
    });
  });

  describe('导航功能', () => {
    it('应该能够返回玩家秀列表', async () => {
      const { default: PlayerShowDetail } = await import('../../../src/pages/community/PlayerShowDetail');
      renderWithRouter(<PlayerShowDetail />);
      
      await waitFor(() => {
        const backButton = screen.getByText('返回玩家秀列表');
        fireEvent.click(backButton);
        expect(mockNavigate).toHaveBeenCalledWith('/shows');
      });
    });
  });

  describe('数据格式化', () => {
    it('应该正确格式化日期', async () => {
      const { default: PlayerShowDetail } = await import('../../../src/pages/community/PlayerShowDetail');
      renderWithRouter(<PlayerShowDetail />);
      
      await waitFor(() => {
        // 检查日期是否被正确格式化显示
        expect(screen.getByText(/2024/)).toBeInTheDocument();
      });
    });
  });
});