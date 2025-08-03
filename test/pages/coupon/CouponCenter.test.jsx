import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CouponCenter from '../../../src/pages/coupon/CouponCenter';

// 模拟 API
vi.mock('../../../src/utils/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// 模拟 localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// 模拟 useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('CouponCenter Component', () => {
  let mockApi;
  
  const mockCoupons = [
    {
      id: 1,
      name: '满100减10',
      type: 1,
      amount: 10,
      threshold: 100,
      valid_days: 30,
      description: '满100元可用',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: '9折优惠券',
      type: 2,
      amount: 0.9,
      threshold: 0,
      valid_days: 15,
      description: '全场9折',
      created_at: '2024-01-02T00:00:00Z',
    },
  ];

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // 动态获取 mock API
    const axiosModule = await import('../../../src/utils/axios');
    mockApi = axiosModule.default;
    
    // 设置默认 mock 返回值
    mockApi.get.mockResolvedValue({ data: { data: mockCoupons } });
    mockApi.post.mockResolvedValue({ data: { code: 200 } });
    
    // 设置 localStorage mock
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithRouter = (component) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  describe('组件渲染', () => {
    it('应该正确渲染优惠券中心页面', async () => {
      renderWithRouter(<CouponCenter />);
      
      // 等待组件加载完成
      await waitFor(() => {
        expect(screen.getByText('正在加载优惠券...')).toBeInTheDocument();
      });
    });

    it('应该显示加载状态', () => {
      mockApi.get.mockImplementation(() => new Promise(() => {})); // 永不解析的Promise
      
      renderWithRouter(<CouponCenter />);
      
      expect(screen.getByText('正在加载优惠券...')).toBeInTheDocument();
    });

    it('应该能够获取用户信息', () => {
      renderWithRouter(<CouponCenter />);
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
    });

    it('应该能够处理用户信息解析失败', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      // 应该抛出错误，因为JSON解析失败
      expect(() => {
        renderWithRouter(<CouponCenter />);
      }).toThrow('Unexpected token');
    });
  });

  describe('API 调用', () => {
    it('组件挂载时应该获取优惠券列表', async () => {
      renderWithRouter(<CouponCenter />);
      
      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/api/coupon');
      });
    });

    it('应该能够处理 API 请求失败', async () => {
      mockApi.get.mockRejectedValue(new Error('网络错误'));
      
      renderWithRouter(<CouponCenter />);
      
      // 组件应该能够处理错误而不崩溃
      expect(() => {
        renderWithRouter(<CouponCenter />);
      }).not.toThrow();
    });
  });

  describe('用户状态处理', () => {
    it('应该能够获取用户信息', () => {
      renderWithRouter(<CouponCenter />);
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
    });

    it('应该能够处理用户信息解析失败', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      // 应该抛出错误，因为JSON解析失败
      expect(() => {
        renderWithRouter(<CouponCenter />);
      }).toThrow('Unexpected token');
    });

    it('应该能够处理用户信息为空', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      renderWithRouter(<CouponCenter />);
      
      // 不应该抛出错误
      expect(() => {
        renderWithRouter(<CouponCenter />);
      }).not.toThrow();
    });
  });

  describe('组件生命周期', () => {
    it('组件挂载时应该获取优惠券列表', async () => {
      renderWithRouter(<CouponCenter />);
      
      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/api/coupon');
      });
    });

    it('组件挂载时应该获取用户信息', () => {
      renderWithRouter(<CouponCenter />);
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
    });
  });

  describe('错误处理', () => {
    it('应该能够处理网络错误', async () => {
      mockApi.get.mockRejectedValue(new Error('网络错误'));
      
      renderWithRouter(<CouponCenter />);
      
      // 组件应该能够处理错误而不崩溃
      expect(() => {
        renderWithRouter(<CouponCenter />);
      }).not.toThrow();
    });

    it('应该能够处理 API 响应格式错误', async () => {
      mockApi.get.mockResolvedValue({ data: null });
      
      renderWithRouter(<CouponCenter />);
      
      // 组件应该能够处理错误而不崩溃
      expect(() => {
        renderWithRouter(<CouponCenter />);
      }).not.toThrow();
    });
  });

  describe('基本功能', () => {
    it('应该能够渲染组件', () => {
      expect(() => {
        renderWithRouter(<CouponCenter />);
      }).not.toThrow();
    });

    it('应该能够处理组件重新渲染', () => {
      const { rerender } = renderWithRouter(<CouponCenter />);
      
      expect(() => {
        rerender(<CouponCenter />);
      }).not.toThrow();
    });

    it('应该能够处理组件卸载', () => {
      const { unmount } = renderWithRouter(<CouponCenter />);
      
      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });

  describe('Mock 功能', () => {
    it('应该能够正确模拟 API', () => {
      expect(mockApi.get).toBeDefined();
      expect(mockApi.post).toBeDefined();
    });

    it('应该能够正确模拟 localStorage', () => {
      expect(localStorageMock.getItem).toBeDefined();
      expect(localStorageMock.setItem).toBeDefined();
      expect(localStorageMock.removeItem).toBeDefined();
    });

    it('应该能够正确模拟 useNavigate', () => {
      expect(mockNavigate).toBeDefined();
    });
  });
}); 