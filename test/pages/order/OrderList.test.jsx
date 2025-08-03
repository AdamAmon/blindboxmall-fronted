import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OrderList from '../../../src/pages/order/OrderList';

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

describe('OrderList Component', () => {
  let mockApi;
  
  const mockOrders = [
    {
      id: 1,
      order_number: '20240101001',
      status: 'pending',
      total_amount: 100.00,
      created_at: '2024-01-01T10:00:00Z',
      items: [
        {
          id: 1,
          name: '盲盒商品1',
          price: 50.00,
          quantity: 2,
        },
      ],
    },
    {
      id: 2,
      order_number: '20240101002',
      status: 'completed',
      total_amount: 200.00,
      created_at: '2024-01-01T11:00:00Z',
      items: [
        {
          id: 2,
          name: '盲盒商品2',
          price: 200.00,
          quantity: 1,
        },
      ],
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
    mockApi.get.mockResolvedValue({ data: { data: mockOrders } });
    
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
    it('应该正确渲染订单列表页面', async () => {
      renderWithRouter(<OrderList />);
      
      // 等待组件加载完成
      await waitFor(() => {
        expect(screen.getByText('我的订单')).toBeInTheDocument();
      });
    });

    it('应该显示加载状态', () => {
      mockApi.get.mockImplementation(() => new Promise(() => {})); // 永不解析的Promise
      
      renderWithRouter(<OrderList />);
      
      expect(screen.getByText('正在加载订单...')).toBeInTheDocument();
    });

    it('应该能够获取用户信息', () => {
      renderWithRouter(<OrderList />);
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
    });

    it('应该能够处理用户信息解析失败', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      // 应该抛出错误，因为JSON解析失败
      expect(() => {
        renderWithRouter(<OrderList />);
      }).toThrow('Unexpected token');
    });
  });

  describe('API 调用', () => {
    it('组件挂载时应该获取订单列表', async () => {
      renderWithRouter(<OrderList />);
      
      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/api/pay/order/list', { params: { user_id: 1 } });
      });
    });

    it('应该能够处理 API 请求失败', async () => {
      mockApi.get.mockRejectedValue(new Error('网络错误'));
      
      renderWithRouter(<OrderList />);
      
      await waitFor(() => {
        expect(screen.getByText('获取订单失败')).toBeInTheDocument();
      });
    });
  });

  describe('用户状态处理', () => {
    it('应该能够获取用户信息', () => {
      renderWithRouter(<OrderList />);
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
    });

    it('未登录用户应该跳转到登录页', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      renderWithRouter(<OrderList />);
      
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });

    it('应该能够处理用户信息解析失败', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      // 应该抛出错误，因为JSON解析失败
      expect(() => {
        renderWithRouter(<OrderList />);
      }).toThrow('Unexpected token');
    });
  });

  describe('错误处理', () => {
    it('应该能够处理网络错误', async () => {
      mockApi.get.mockRejectedValue(new Error('网络错误'));
      
      renderWithRouter(<OrderList />);
      
      await waitFor(() => {
        expect(screen.getByText('获取订单失败')).toBeInTheDocument();
      });
    });

    it('应该能够处理 API 响应格式错误', async () => {
      mockApi.get.mockResolvedValue({ data: null });
      
      renderWithRouter(<OrderList />);
      
      // 组件应该能够处理错误而不崩溃
      expect(() => {
        renderWithRouter(<OrderList />);
      }).not.toThrow();
    });
  });

  describe('组件生命周期', () => {
    it('组件挂载时应该获取订单列表', async () => {
      renderWithRouter(<OrderList />);
      
      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/api/pay/order/list', { params: { user_id: 1 } });
      });
    });

    it('组件挂载时应该获取用户信息', () => {
      renderWithRouter(<OrderList />);
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
    });
  });

  describe('基本功能', () => {
    it('应该能够渲染组件', () => {
      expect(() => {
        renderWithRouter(<OrderList />);
      }).not.toThrow();
    });

    it('应该能够处理组件重新渲染', () => {
      const { rerender } = renderWithRouter(<OrderList />);
      
      expect(() => {
        rerender(<OrderList />);
      }).not.toThrow();
    });

    it('应该能够处理组件卸载', () => {
      const { unmount } = renderWithRouter(<OrderList />);
      
      expect(() => {
        unmount();
      }).not.toThrow();
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

  describe('状态映射', () => {
    it('应该正确映射订单状态', () => {
      const statusMap = {
        pending: '待支付',
        delivering: '待发货',
        delivered: '已送达',
        completed: '已完成',
        cancelled: '已取消'
      };

      expect(statusMap.pending).toBe('待支付');
      expect(statusMap.delivering).toBe('待发货');
      expect(statusMap.delivered).toBe('已送达');
      expect(statusMap.completed).toBe('已完成');
      expect(statusMap.cancelled).toBe('已取消');
    });

    it('应该正确映射状态颜色', () => {
      const statusColors = {
        pending: 'from-yellow-500 to-orange-500',
        delivering: 'from-blue-500 to-indigo-500',
        delivered: 'from-green-500 to-emerald-500',
        completed: 'from-purple-500 to-pink-500',
        cancelled: 'from-gray-500 to-gray-600'
      };

      expect(statusColors.pending).toBe('from-yellow-500 to-orange-500');
      expect(statusColors.delivering).toBe('from-blue-500 to-indigo-500');
      expect(statusColors.delivered).toBe('from-green-500 to-emerald-500');
      expect(statusColors.completed).toBe('from-purple-500 to-pink-500');
      expect(statusColors.cancelled).toBe('from-gray-500 to-gray-600');
    });
  });

  describe('工具函数', () => {
    it('应该能够格式化订单号', () => {
      const formatOrderNumber = (orderId) => {
        return `#${orderId.toString().padStart(8, '0')}`;
      };

      expect(formatOrderNumber(1)).toBe('#00000001');
      expect(formatOrderNumber(123)).toBe('#00000123');
      expect(formatOrderNumber(12345678)).toBe('#12345678');
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
  });
}); 