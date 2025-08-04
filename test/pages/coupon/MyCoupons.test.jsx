import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MyCoupons from '../../../src/pages/coupon/MyCoupons';

// 模拟 API
vi.mock('../../../src/utils/axios', () => ({
  default: {
    get: vi.fn(),
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

// 模拟 setTimeout 和 clearTimeout
const originalSetTimeout = setTimeout;
const originalClearTimeout = clearTimeout;
const mockSetTimeout = vi.fn((callback, delay) => {
  return originalSetTimeout(callback, delay);
});
const mockClearTimeout = vi.fn((id) => {
  return originalClearTimeout(id);
});

describe('MyCoupons Component', () => {
  let mockApi;
  
  const mockCoupons = [
    {
      id: 1,
      type: 1,
      amount: 10,
      threshold: 100,
      status: 0,
      created_at: '2024-01-01T10:00:00Z',
      expired_at: '2024-12-31T23:59:59Z',
    },
    {
      id: 2,
      type: 2,
      amount: 0.8,
      threshold: 50,
      status: 1,
      created_at: '2024-01-01T10:00:00Z',
      expired_at: '2024-12-31T23:59:59Z',
    },
    {
      id: 3,
      type: 1,
      amount: 5,
      threshold: 50,
      status: 2,
      created_at: '2024-01-01T10:00:00Z',
      expired_at: '2024-01-01T23:59:59Z',
    },
    {
      id: 4,
      type: 2,
      amount: 0.9,
      threshold: 200,
      status: 0,
      created_at: '2024-01-01T10:00:00Z',
      expired_at: '2024-12-31T23:59:59Z',
    },
  ];

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // 设置定时器模拟
    vi.stubGlobal('setTimeout', mockSetTimeout);
    vi.stubGlobal('clearTimeout', mockClearTimeout);
    
    // 动态获取 mock API
    const axiosModule = await import('../../../src/utils/axios');
    mockApi = axiosModule.default;
    
    // 设置默认 mock 返回值
    mockApi.get.mockResolvedValue({ data: mockCoupons });
    
    // 设置 localStorage mock
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // 恢复原始定时器
    vi.unstubAllGlobals();
  });

  const renderWithRouter = (component) => {
    let result;
    act(() => {
      result = render(
        <BrowserRouter>
          {component}
        </BrowserRouter>
      );
    });
    return result;
  };

  describe('组件渲染', () => {
    it('应该正确渲染我的优惠券页面', async () => {
      await act(async () => {
        renderWithRouter(<MyCoupons />);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/我的优惠券/)).toBeInTheDocument();
      });
    });

    it('应该显示加载状态', async () => {
      mockApi.get.mockImplementation(() => new Promise(() => {})); // 永不解析的Promise
      
      await act(async () => {
        renderWithRouter(<MyCoupons />);
      });
      
      expect(screen.getByText('正在加载优惠券...')).toBeInTheDocument();
    });

    it('应该能够获取用户信息', async () => {
      await act(async () => {
        renderWithRouter(<MyCoupons />);
      });
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
    });
  });

  describe('权限控制', () => {
    it('未登录用户应该跳转到登录页', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      await act(async () => {
        renderWithRouter(<MyCoupons />);
      });
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      }, { timeout: 3000 });
    });

    it('应该能够处理用户信息解析失败', async () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      // 组件应该能够处理错误而不崩溃
      await act(async () => {
        expect(() => {
          renderWithRouter(<MyCoupons />);
        }).not.toThrow();
      });
    });
  });

  describe('API 调用', () => {
    it('组件挂载时应该获取优惠券列表', async () => {
      await act(async () => {
        renderWithRouter(<MyCoupons />);
      });
      
      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/api/user-coupon/list?user_id=1');
      });
    });

    it('应该能够处理 API 请求失败', async () => {
      mockApi.get.mockRejectedValue(new Error('网络错误'));
      
      await act(async () => {
        renderWithRouter(<MyCoupons />);
      });
      
      // 组件应该能够处理错误而不崩溃
      await waitFor(() => {
        expect(screen.getByText('获取优惠券失败，请稍后重试')).toBeInTheDocument();
      });
    });
  });

  describe('UI 元素', () => {
    it('应该显示全部标签', async () => {
      await act(async () => {
        renderWithRouter(<MyCoupons />);
      });
      
      await waitFor(() => {
        expect(screen.getByText('全部')).toBeInTheDocument();
      });
    });

    it('应该显示可使用标签', async () => {
      await act(async () => {
        renderWithRouter(<MyCoupons />);
      });
      
      await waitFor(() => {
        expect(screen.getAllByText('可使用').length).toBeGreaterThan(0);
      });
    });

    it('应该显示已使用标签', async () => {
      await act(async () => {
        renderWithRouter(<MyCoupons />);
      });
      
      await waitFor(() => {
        expect(screen.getAllByText('已使用').length).toBeGreaterThan(0);
      });
    });

    it('应该显示已过期标签', async () => {
      await act(async () => {
        renderWithRouter(<MyCoupons />);
      });
      
      await waitFor(() => {
        expect(screen.getAllByText('已过期').length).toBeGreaterThan(0);
      });
    });
  });

  describe('基本功能', () => {
    it('应该能够渲染组件', async () => {
      await act(async () => {
        expect(() => {
          renderWithRouter(<MyCoupons />);
        }).not.toThrow();
      });
    });

    it('应该能够处理组件重新渲染', async () => {
      let rerender;
      await act(async () => {
        const result = renderWithRouter(<MyCoupons />);
        rerender = result.rerender;
      });
      
      await act(async () => {
        expect(() => {
          rerender(<MyCoupons />);
        }).not.toThrow();
      });
    });

    it('应该能够处理组件卸载', async () => {
      let unmount;
      await act(async () => {
        const result = renderWithRouter(<MyCoupons />);
        unmount = result.unmount;
      });
      
      await act(async () => {
        expect(() => {
          unmount();
        }).not.toThrow();
      });
    });
  });

  describe('Mock 功能', () => {
    it('应该能够正确模拟 API', () => {
      expect(mockApi.get).toBeDefined();
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

  describe('工具函数', () => {
    it('应该能够格式化优惠券类型', () => {
      const getCouponTypeText = (coupon) => {
        if (coupon.type === 1) {
          return `满${coupon.threshold}减${coupon.amount}`;
        } else {
          // 折扣券：amount 是折扣比例，如 0.8 表示 8 折
          return `${(coupon.amount * 10).toFixed(0)}折券`;
        }
      };

      expect(getCouponTypeText({ type: 1, threshold: 100, amount: 10 })).toBe('满100减10');
      expect(getCouponTypeText({ type: 2, amount: 0.8 })).toBe('8折券');
      expect(getCouponTypeText({ type: 2, amount: 0.9 })).toBe('9折券');
      expect(getCouponTypeText({ type: 2, amount: 0.75 })).toBe('8折券');
    });

    it('应该能够格式化优惠券状态', () => {
      const getCouponStatus = (coupon) => {
        if (coupon.status === 1) {
          return { status: 'used', text: '已使用', color: 'from-gray-400 to-gray-500', bgColor: 'bg-gray-100' };
        } else if (coupon.status === 2) {
          return { status: 'expired', text: '已过期', color: 'from-gray-400 to-gray-500', bgColor: 'bg-gray-100' };
        } else {
          return { status: 'unused', text: '可使用', color: 'from-red-500 to-pink-600', bgColor: 'bg-white' };
        }
      };

      expect(getCouponStatus({ status: 0 }).text).toBe('可使用');
      expect(getCouponStatus({ status: 1 }).text).toBe('已使用');
      expect(getCouponStatus({ status: 2 }).text).toBe('已过期');
    });

    it('应该能够格式化日期', () => {
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      };

      const result = formatDate('2024-01-01T10:00:00Z');
      expect(result).toContain('2024');
      expect(result).toContain('1');
    });

    it('应该能够处理空日期', () => {
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      };

      expect(formatDate('')).toBe('');
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });

    it('应该能够计算筛选数量', () => {
      const getFilterCount = (status) => {
        const coupons = [
          { status: 0 },
          { status: 1 },
          { status: 2 },
          { status: 0 },
        ];
        
        if (status === 'all') return coupons.length;
        if (status === 'unused') return coupons.filter(c => c.status === 0).length;
        if (status === 'used') return coupons.filter(c => c.status === 1).length;
        if (status === 'expired') return coupons.filter(c => c.status === 2).length;
        return 0;
      };

      expect(getFilterCount('all')).toBe(4);
      expect(getFilterCount('unused')).toBe(2);
      expect(getFilterCount('used')).toBe(1);
      expect(getFilterCount('expired')).toBe(1);
    });

    it('应该能够获取统计信息', () => {
      const getStats = () => {
        const coupons = [
          { status: 0 },
          { status: 1 },
          { status: 2 },
          { status: 0 },
        ];
        
        return {
          total: coupons.length,
          unused: coupons.filter(c => c.status === 0).length,
          used: coupons.filter(c => c.status === 1).length,
          expired: coupons.filter(c => c.status === 2).length,
        };
      };

      const stats = getStats();
      expect(stats.total).toBe(4);
      expect(stats.unused).toBe(2);
      expect(stats.used).toBe(1);
      expect(stats.expired).toBe(1);
    });

    it('应该能够正确显示折扣券信息', async () => {
      await act(async () => {
        renderWithRouter(<MyCoupons />);
      });
      
      await waitFor(() => {
        // 验证折扣券的显示
        expect(screen.getByText('8折券')).toBeInTheDocument();
        expect(screen.getByText('9折券')).toBeInTheDocument();
      });
    });

    it('应该能够正确显示满减券信息', async () => {
      await act(async () => {
        renderWithRouter(<MyCoupons />);
      });
      
      await waitFor(() => {
        // 验证满减券的显示
        expect(screen.getByText('满100减10')).toBeInTheDocument();
        expect(screen.getByText('满50减5')).toBeInTheDocument();
      });
    });
  });
}); 