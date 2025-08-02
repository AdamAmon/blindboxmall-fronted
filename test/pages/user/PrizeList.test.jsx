import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PrizeList from '../../../src/pages/user/PrizeList';
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

describe('PrizeList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user') {
        return JSON.stringify({ id: 1, username: 'testuser' });
      }
      if (key === 'token') {
        return 'test-token';
      }
      return null;
    });
  });

  describe('基本渲染', () => {
    it('应该显示加载状态', () => {
      api.get.mockImplementation(() => new Promise(() => {})); // 永不解析的Promise
      
      render(
        <MemoryRouter>
          <PrizeList />
        </MemoryRouter>
      );
      
      expect(screen.getByText(/正在加载奖品/)).toBeInTheDocument();
    });

    it('应该显示页面标题', async () => {
      api.get.mockResolvedValue({
        data: {
          code: 200,
          data: {
            list: [],
            totalPages: 1,
            total: 0,
          },
        },
      });
      
      render(
        <MemoryRouter>
          <PrizeList />
        </MemoryRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('我的奖品')).toBeInTheDocument();
      });
    });
  });

  describe('API调用', () => {
    it('应该调用API获取奖品列表', async () => {
      api.get.mockResolvedValue({
        data: {
          code: 200,
          data: {
            list: [],
            totalPages: 1,
            total: 0,
          },
        },
      });
      
      render(
        <MemoryRouter>
          <PrizeList />
        </MemoryRouter>
      );
      
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/user/prizes', {
          params: {
            user_id: 1,
            rarity: '',
            keyword: '',
            page: 1,
            limit: 9,
          },
          headers: { Authorization: 'Bearer test-token' },
        });
      });
    });

    it('应该处理API错误', async () => {
      api.get.mockRejectedValue(new Error('API Error'));
      
      render(
        <MemoryRouter>
          <PrizeList />
        </MemoryRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('获取奖品失败')).toBeInTheDocument();
      });
    });
  });

  describe('用户认证', () => {
    it('未登录用户应该跳转到登录页', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      render(
        <MemoryRouter>
          <PrizeList />
        </MemoryRouter>
      );
      
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('稀有度标签', () => {
    it('应该显示稀有度标签', async () => {
      api.get.mockResolvedValue({
        data: {
          code: 200,
          data: {
            list: [],
            totalPages: 1,
            total: 0,
          },
        },
      });
      
      render(
        <MemoryRouter>
          <PrizeList />
        </MemoryRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('全部')).toBeInTheDocument();
        expect(screen.getByText('普通')).toBeInTheDocument();
        expect(screen.getByText('稀有')).toBeInTheDocument();
        expect(screen.getByText('隐藏')).toBeInTheDocument();
      });
    });
  });

  describe('空状态显示', () => {
    it('应该显示空状态信息', async () => {
      api.get.mockResolvedValue({
        data: {
          code: 200,
          data: {
            list: [],
            totalPages: 1,
            total: 0,
          },
        },
      });
      
      render(
        <MemoryRouter>
          <PrizeList />
        </MemoryRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('暂无奖品')).toBeInTheDocument();
        expect(screen.getByText('去抽盲盒')).toBeInTheDocument();
      });
    });
  });

  describe('统计信息显示', () => {
    it('应该显示奖品统计信息', async () => {
      api.get.mockResolvedValue({
        data: {
          code: 200,
          data: {
            list: [
              { rarity: 1, prizeName: '普通奖品1' },
              { rarity: 2, prizeName: '稀有奖品1' },
              { rarity: 3, prizeName: '隐藏奖品1' }
            ],
            totalPages: 1,
            total: 3,
          },
        },
      });
      
      render(
        <MemoryRouter>
          <PrizeList />
        </MemoryRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('总奖品数')).toBeInTheDocument();
        expect(screen.getByText('普通奖品')).toBeInTheDocument();
        expect(screen.getByText('稀有奖品')).toBeInTheDocument();
        expect(screen.getByText('隐藏奖品')).toBeInTheDocument();
      });
    });
  });
}); 