import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PlayerShowList from '../../../src/pages/community/PlayerShowList';
import { vi } from 'vitest';
import api from '../../../src/utils/axios';

// 模拟 react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// 模拟 axios
vi.mock('../../../src/utils/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

// 模拟 localStorage
const localStorageMock = {
  getItem: vi.fn(),
  removeItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('PlayerShowList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('基本渲染', () => {
    it('应该显示加载状态', () => {
      api.get.mockImplementation(() => new Promise(() => {})); // 永不解析的Promise
      
      render(
        <MemoryRouter>
          <PlayerShowList />
        </MemoryRouter>
      );

      expect(screen.getByText('正在加载玩家秀...')).toBeInTheDocument();
    });

    it('应该显示玩家秀列表', async () => {
      const mockShows = [
        {
          id: 1,
          content: '今天开了一个很棒的盲盒',
          images: ['image1.jpg'],
          user_id: 1,
          created_at: '2024-01-01T10:00:00Z',
        },
        {
          id: 2,
          content: '连续开出稀有物品',
          images: ['image2.jpg'],
          user_id: 2,
          created_at: '2024-01-02T10:00:00Z',
        },
      ];

      api.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            list: mockShows,
            total: 2,
            page: 1,
          },
        },
      });

      render(
        <MemoryRouter>
          <PlayerShowList />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('今天开了一个很棒的盲盒')).toBeInTheDocument();
        expect(screen.getByText('连续开出稀有物品')).toBeInTheDocument();
      });
    });

    it('应该显示空状态', async () => {
      api.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            list: [],
            total: 0,
            page: 1,
          },
        },
      });

      render(
        <MemoryRouter>
          <PlayerShowList />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('暂无玩家秀')).toBeInTheDocument();
      });
    });
  });

  describe('数据加载', () => {
    it('应该调用API获取玩家秀列表', async () => {
      const mockShows = [
        {
          id: 1,
          content: '测试内容',
          images: [],
          user_id: 1,
          created_at: '2024-01-01T10:00:00Z',
        },
      ];

      api.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            list: mockShows,
            total: 1,
            page: 1,
          },
        },
      });

      render(
        <MemoryRouter>
          <PlayerShowList />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/community/show/list', {
          params: { page: 1, pageSize: 12 },
        });
      });
    });

    it('应该处理API错误', async () => {
      api.get.mockRejectedValue(new Error('Network error'));

      render(
        <MemoryRouter>
          <PlayerShowList />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('获取玩家秀失败')).toBeInTheDocument();
      });
    });

    it('应该处理API返回错误', async () => {
      api.get.mockResolvedValue({
        data: {
          success: false,
          message: '服务器错误',
        },
      });

      render(
        <MemoryRouter>
          <PlayerShowList />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('服务器错误')).toBeInTheDocument();
      });
    });
  });

  describe('分页功能', () => {
    it('应该显示分页组件', async () => {
      const mockShows = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        content: `内容${i + 1}`,
        images: [],
        user_id: i + 1,
        created_at: '2024-01-01T10:00:00Z',
      }));

      api.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            list: mockShows,
            total: 25,
            page: 1,
          },
        },
      });

      render(
        <MemoryRouter>
          <PlayerShowList />
        </MemoryRouter>
      );

      await waitFor(() => {
        // 使用更精确的选择器来找到分页按钮
        const paginationButtons = screen.getAllByRole('button').filter(button => 
          ['1', '2', '3'].includes(button.textContent)
        );
        expect(paginationButtons.length).toBeGreaterThan(0);
      });
    });

    it('应该处理页码点击', async () => {
      const mockShows = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        content: `内容${i + 1}`,
        images: [],
        user_id: i + 1,
        created_at: '2024-01-01T10:00:00Z',
      }));

      api.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            list: mockShows,
            total: 25,
            page: 1,
          },
        },
      });

      render(
        <MemoryRouter>
          <PlayerShowList />
        </MemoryRouter>
      );

      await waitFor(() => {
        // 使用更精确的选择器来找到分页按钮
        const page2Button = screen.getAllByRole('button').find(button => button.textContent === '2');
        expect(page2Button).toBeInTheDocument();
        fireEvent.click(page2Button);
      });

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/community/show/list', {
          params: { page: 2, pageSize: 12 },
        });
      });
    });
  });

  describe('工具函数', () => {
    it('应该正确格式化日期', async () => {
      const mockShows = [
        {
          id: 1,
          content: '测试内容',
          images: [],
          user_id: 1,
          created_at: new Date().toISOString(),
        },
      ];

      api.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            list: mockShows,
            total: 1,
            page: 1,
          },
        },
      });

      render(
        <MemoryRouter>
          <PlayerShowList />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('今天')).toBeInTheDocument();
      });
    });

    it('应该截断长文本', async () => {
      const longContent = '这是一个很长的内容，应该被截断显示。'.repeat(10);
      const mockShows = [
        {
          id: 1,
          content: longContent,
          images: [],
          user_id: 1,
          created_at: '2024-01-01T10:00:00Z',
        },
      ];

      api.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            list: mockShows,
            total: 1,
            page: 1,
          },
        },
      });

      render(
        <MemoryRouter>
          <PlayerShowList />
        </MemoryRouter>
      );

      await waitFor(() => {
        const contentElement = screen.getByText(/这是一个很长的内容/);
        expect(contentElement.textContent).toContain('...');
      });
    });
  });

  describe('交互功能', () => {
    it('应该支持点击创建按钮', async () => {
      const mockShows = [
        {
          id: 1,
          content: '测试内容',
          images: [],
          user_id: 1,
          created_at: '2024-01-01T10:00:00Z',
        },
      ];

      api.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            list: mockShows,
            total: 1,
            page: 1,
          },
        },
      });

      render(
        <MemoryRouter>
          <PlayerShowList />
        </MemoryRouter>
      );

      await waitFor(() => {
        const createButton = screen.getByText('发布玩家秀');
        fireEvent.click(createButton);
        expect(mockNavigate).toHaveBeenCalledWith('/shows/create');
      });
    });

    it('应该支持点击玩家秀卡片', async () => {
      const mockShows = [
        {
          id: 1,
          content: '测试内容',
          images: [],
          user_id: 1,
          created_at: '2024-01-01T10:00:00Z',
        },
      ];

      api.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            list: mockShows,
            total: 1,
            page: 1,
          },
        },
      });

      render(
        <MemoryRouter>
          <PlayerShowList />
        </MemoryRouter>
      );

      await waitFor(() => {
        const card = screen.getByText('测试内容');
        fireEvent.click(card);
        expect(mockNavigate).toHaveBeenCalledWith('/shows/1');
      });
    });
  });

  describe('错误边界', () => {
    it('应该处理组件渲染错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      api.get.mockRejectedValue(new Error('Test error'));

      render(
        <MemoryRouter>
          <PlayerShowList />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('获取玩家秀失败')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });
});