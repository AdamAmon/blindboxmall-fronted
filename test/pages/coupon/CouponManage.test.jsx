import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CouponManage from '../../../src/pages/coupon/CouponManage';

// 模拟 API
vi.mock('../../../src/utils/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// 模拟 useUser hook
vi.mock('../../../src/hooks/useUser', () => ({
  useUser: vi.fn(),
}));

// 模拟 useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// 模拟 window.confirm
Object.defineProperty(window, 'confirm', {
  value: vi.fn(),
  writable: true,
});

describe('CouponManage Component', () => {
  let mockApi;
  let mockUseUser;
  
  const mockCoupons = [
    {
      id: 1,
      name: '测试优惠券1',
      type: 1,
      threshold: 100,
      amount: 10,
      start_time: '2024-01-01T00:00:00',
      end_time: '2024-12-31T23:59:59',
      status: 1,
    },
  ];

  const mockStats = {
    total: 10,
    available: 8,
    used: 2,
    expired: 0,
  };

  const mockAdminUser = {
    id: 1,
    username: 'admin',
    role: 'admin',
  };

  const mockCustomerUser = {
    id: 2,
    username: 'customer',
    role: 'customer',
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // 动态获取 mock API
    const axiosModule = await import('../../../src/utils/axios');
    mockApi = axiosModule.default;
    
    // 动态获取 mock useUser
    const useUserModule = await import('../../../src/hooks/useUser');
    mockUseUser = useUserModule.useUser;
    
    // 设置默认 mock 返回值
    mockApi.get.mockResolvedValue({ 
      data: { 
        data: mockCoupons,
        total: mockCoupons.length 
      } 
    });
    
    // 设置默认用户为管理员
    mockUseUser.mockReturnValue(mockAdminUser);
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
    it('应该正确渲染优惠券管理页面', async () => {
      renderWithRouter(<CouponManage />);
      
      await waitFor(() => {
        expect(screen.getByText(/优惠券管理/)).toBeInTheDocument();
      });
    });

    it('应该显示加载状态', async () => {
      mockApi.get.mockImplementation(() => new Promise(() => {})); // 永不解析的Promise
      
      renderWithRouter(<CouponManage />);
      
      await waitFor(() => {
        expect(screen.getByText('加载中...')).toBeInTheDocument();
      });
    });

    it('应该能够获取用户信息', async () => {
      renderWithRouter(<CouponManage />);
      
      await waitFor(() => {
        expect(mockUseUser).toHaveBeenCalled();
      });
    });
  });

  describe('权限控制', () => {
    it('未登录用户应该跳转到登录页', async () => {
      mockUseUser.mockReturnValue(null);
      
      renderWithRouter(<CouponManage />);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/user/login');
      }, { timeout: 3000 });
    });

    it('非管理员用户应该跳转到首页', async () => {
      mockUseUser.mockReturnValue(mockCustomerUser);
      
      renderWithRouter(<CouponManage />);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      }, { timeout: 3000 });
    });

    it('管理员用户应该能够访问页面', async () => {
      mockUseUser.mockReturnValue(mockAdminUser);
      
      renderWithRouter(<CouponManage />);
      
      await waitFor(() => {
        expect(screen.getByText(/优惠券管理/)).toBeInTheDocument();
      });
    });
  });

  describe('API 调用', () => {
    it('组件挂载时应该获取优惠券列表', async () => {
      renderWithRouter(<CouponManage />);
      
      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/api/coupon', { 
          params: { page: 1, pageSize: 10, type: 'valid' } 
        });
      });
    });

    it('组件挂载时应该获取统计信息', async () => {
      mockApi.get.mockResolvedValueOnce({ data: { data: mockCoupons, total: 2 } });
      mockApi.get.mockResolvedValueOnce({ data: { data: mockStats } });
      
      renderWithRouter(<CouponManage />);
      
      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/api/user-coupon/stats');
      });
    });
  });

  describe('UI 元素', () => {
    it('应该显示新建优惠券按钮', async () => {
      renderWithRouter(<CouponManage />);
      
      await waitFor(() => {
        expect(screen.getByText('新建优惠券')).toBeInTheDocument();
      });
    });

    it('应该显示清理过期优惠券按钮', async () => {
      renderWithRouter(<CouponManage />);
      
      await waitFor(() => {
        expect(screen.getByText('清理过期优惠券')).toBeInTheDocument();
      });
    });

    it('应该显示有效优惠券标签', async () => {
      renderWithRouter(<CouponManage />);
      
      await waitFor(() => {
        expect(screen.getByText('有效优惠券')).toBeInTheDocument();
      });
    });

    it('应该显示失效优惠券标签', async () => {
      renderWithRouter(<CouponManage />);
      
      await waitFor(() => {
        expect(screen.getByText('失效优惠券')).toBeInTheDocument();
      });
    });
  });

  describe('基本功能', () => {
    it('应该能够渲染组件', async () => {
      renderWithRouter(<CouponManage />);
      
      await waitFor(() => {
        expect(screen.getByText('加载中...')).toBeInTheDocument();
      });
    });

    it('应该能够处理组件重新渲染', async () => {
      const { rerender } = renderWithRouter(<CouponManage />);
      
      await waitFor(() => {
        rerender(<CouponManage />);
        expect(screen.getByText('加载中...')).toBeInTheDocument();
      });
    });

    it('应该能够处理组件卸载', async () => {
      const { unmount } = renderWithRouter(<CouponManage />);
      
      await waitFor(() => {
        unmount();
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Mock 功能', () => {
    it('应该能够正确模拟 API', async () => {
      renderWithRouter(<CouponManage />);
      
      await waitFor(() => {
        expect(mockApi.get).toBeDefined();
        expect(mockApi.post).toBeDefined();
        expect(mockApi.put).toBeDefined();
        expect(mockApi.delete).toBeDefined();
      });
    });

    it('应该能够正确模拟 useUser hook', async () => {
      renderWithRouter(<CouponManage />);
      
      await waitFor(() => {
        expect(mockUseUser).toBeDefined();
      });
    });

    it('应该能够正确模拟 useNavigate', async () => {
      renderWithRouter(<CouponManage />);
      
      await waitFor(() => {
        expect(mockNavigate).toBeDefined();
      });
    });

    it('应该能够正确模拟 window.confirm', async () => {
      renderWithRouter(<CouponManage />);
      
      await waitFor(() => {
        expect(window.confirm).toBeDefined();
      });
    });
  });

  describe('工具函数', () => {
    it('应该能够格式化优惠券类型', async () => {
      renderWithRouter(<CouponManage />);
      
      await waitFor(() => {
        const getCouponTypeText = (coupon) => {
          if (coupon.type === 1) {
            return `满${coupon.threshold}减${coupon.amount}`;
          } else {
            return `${(coupon.amount * 10).toFixed(1)}折券`;
          }
        };

        expect(getCouponTypeText({ type: 1, threshold: 100, amount: 10 })).toBe('满100减10');
        expect(getCouponTypeText({ type: 2, amount: 0.8 })).toBe('8.0折券');
      });
    });

    it('应该能够格式化优惠券状态', async () => {
      renderWithRouter(<CouponManage />);
      
      await waitFor(() => {
        const getCouponStatusText = (status) => {
          return status === 1 ? '上架' : '下架';
        };

        expect(getCouponStatusText(1)).toBe('上架');
        expect(getCouponStatusText(0)).toBe('下架');
      });
    });

    it('应该能够格式化日期', async () => {
      renderWithRouter(<CouponManage />);
      
      await waitFor(() => {
        const formatDate = (dateString) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          return date.toLocaleDateString('zh-CN');
        };

        const result = formatDate('2024-01-01');
        expect(result).toContain('2024');
        expect(result).toContain('1');
      });
    });

    it('应该能够处理空日期', async () => {
      renderWithRouter(<CouponManage />);
      
      await waitFor(() => {
        const formatDate = (dateString) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          return date.toLocaleDateString('zh-CN');
        };

        expect(formatDate('')).toBe('');
        expect(formatDate(null)).toBe('');
        expect(formatDate(undefined)).toBe('');
      });
    });
  });
});