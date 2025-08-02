import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SellerStats from '../../../src/pages/seller/SellerStats';
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

// 模拟 react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
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

describe('SellerStats Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('test-token');
  });

  describe('基本渲染', () => {
    it('应该显示加载状态', () => {
      api.get.mockImplementation(() => new Promise(() => {})); // 永不解析的Promise
      
      render(
        <MemoryRouter>
          <SellerStats />
        </MemoryRouter>
      );
      
      expect(screen.getByText('正在加载统计数据...')).toBeInTheDocument();
    });

    it('应该显示错误状态', async () => {
      api.get.mockRejectedValue(new Error('Network error'));
      
      render(
        <MemoryRouter>
          <SellerStats />
        </MemoryRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('加载失败')).toBeInTheDocument();
        expect(screen.getByText('网络错误')).toBeInTheDocument();
      });
    });

    it('应该显示无数据状态', async () => {
      api.get.mockResolvedValue({
        data: {
          code: 200,
          data: null,
        },
      });
      
      render(
        <MemoryRouter>
          <SellerStats />
        </MemoryRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('暂无统计数据')).toBeInTheDocument();
        expect(screen.getByText('您还没有任何盲盒数据，快去创建盲盒开始管理吧！')).toBeInTheDocument();
      });
    });
  });

  describe('API调用', () => {
    it('应该调用API获取统计数据', async () => {
      const mockStats = {
        totalBlindBoxes: 10,
        totalSales: 1000,
        totalValue: 5000,
        totalOrders: 50,
      };
      
      api.get.mockResolvedValue({
        data: {
          code: 200,
          data: mockStats,
        },
      });
      
      render(
        <MemoryRouter>
          <SellerStats />
        </MemoryRouter>
      );
      
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/blindbox/seller/stats', {
          headers: { Authorization: 'Bearer test-token' },
        });
      });
    });

    it('应该处理API错误响应', async () => {
      api.get.mockResolvedValue({
        data: {
          code: 500,
          message: '服务器错误',
        },
      });
      
      render(
        <MemoryRouter>
          <SellerStats />
        </MemoryRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('加载失败')).toBeInTheDocument();
        expect(screen.getByText('服务器错误')).toBeInTheDocument();
      });
    });
  });

  describe('交互功能', () => {
    it('应该支持重新加载按钮', async () => {
      api.get.mockRejectedValue(new Error('Network error'));
      
      render(
        <MemoryRouter>
          <SellerStats />
        </MemoryRouter>
      );
      
      await waitFor(() => {
        const reloadButton = screen.getByText('重新加载');
        expect(reloadButton).toBeInTheDocument();
      });
    });

    it('应该支持返回商家面板按钮', async () => {
      api.get.mockResolvedValue({
        data: {
          code: 200,
          data: null,
        },
      });
      
      render(
        <MemoryRouter>
          <SellerStats />
        </MemoryRouter>
      );
      
      await waitFor(() => {
        const backButton = screen.getByText('返回商家面板');
        expect(backButton).toBeInTheDocument();
      });
    });
  });

  describe('统计数据展示', () => {
    it('应该显示统计数据', async () => {
      const mockStats = {
        totalBlindBoxes: 10,
        totalSales: 1000,
        totalValue: 5000,
        totalOrders: 50,
      };
      
      api.get.mockResolvedValue({
        data: {
          code: 200,
          data: mockStats,
        },
      });
      
      render(
        <MemoryRouter>
          <SellerStats />
        </MemoryRouter>
      );
      
      await waitFor(() => {
        // 使用更简单的测试，只检查关键元素是否存在
        expect(screen.getByText('商家统计数据')).toBeInTheDocument();
        expect(screen.getAllByText('¥5000.00')).toHaveLength(2); // 应该有两个元素包含这个文本
        expect(screen.getAllByText('上架盲盒')).toHaveLength(2); // 应该有两个元素包含这个文本
        expect(screen.getAllByText('总商品数')).toHaveLength(2); // 应该有两个元素包含这个文本
      });
    });

    it('应该显示页面标题', async () => {
      const mockStats = {
        totalBlindBoxes: 5,
        totalValue: 2000,
      };
      
      api.get.mockResolvedValue({
        data: {
          code: 200,
          data: mockStats,
        },
      });
      
      render(
        <MemoryRouter>
          <SellerStats />
        </MemoryRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('商家统计数据')).toBeInTheDocument();
      });
    });
  });

  describe('业务分析功能', () => {
    it('应该显示业务分析区域', async () => {
      const mockStats = {
        totalBlindBoxes: 10,
        listedBlindBoxes: 5,
        totalItems: 50,
        totalValue: 5000,
      };
      
      api.get.mockResolvedValue({
        data: {
          code: 200,
          data: mockStats,
        },
      });
      
      render(
        <MemoryRouter>
          <SellerStats />
        </MemoryRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('业务分析')).toBeInTheDocument();
        expect(screen.getByText('业务建议')).toBeInTheDocument();
      });
    });
  });
}); 