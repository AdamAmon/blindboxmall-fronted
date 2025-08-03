import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockParams = { id: 'ORDER123' };
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

const mockOrder = {
  id: 'ORDER123',
  order_number: 'ORD-2024-001',
  status: 'delivering',
  total_amount: 299.99,
  created_at: '2024-01-01T10:00:00Z',
  updated_at: '2024-01-02T10:00:00Z',
  items: [
    {
      id: 1,
      item_id: 101,
      quantity: 1,
      price: 299.99,
      item: {
        id: 101,
        name: '测试盲盒1',
        image: '/box1.jpg',
        description: '这是一个测试盲盒',
      },
      is_opened: false,
    },
    {
      id: 2,
      item_id: 102,
      quantity: 1,
      price: 199.99,
      item: {
        id: 102,
        name: '测试盲盒2',
        image: '/box2.jpg',
        description: '这是另一个测试盲盒',
      },
      is_opened: true,
    },
  ],
};

describe('OrderDetail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));
    mockApi.get.mockResolvedValue({ data: { data: mockOrder } });
    mockApi.post.mockResolvedValue({ data: { success: true } });
  });

  describe('基本渲染', () => {
    it('应该正确渲染订单详情页面', async () => {
      const { default: OrderDetail } = await import('../../../src/pages/order/OrderDetail');
      renderWithRouter(<OrderDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('订单详情')).toBeInTheDocument();
        expect(screen.getByText('#ORDER123')).toBeInTheDocument();
      });
    });

    it('应该显示订单状态', async () => {
      const { default: OrderDetail } = await import('../../../src/pages/order/OrderDetail');
      renderWithRouter(<OrderDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('待发货')).toBeInTheDocument();
      });
    });
  });

  describe('用户权限', () => {
    it('未登录用户应该跳转到登录页', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      const { default: OrderDetail } = await import('../../../src/pages/order/OrderDetail');
      renderWithRouter(<OrderDetail />);
      
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });

    it('应该能够获取用户信息', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));
      const { default: OrderDetail } = await import('../../../src/pages/order/OrderDetail');
      renderWithRouter(<OrderDetail />);
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
    });
  });

  describe('API调用', () => {
    it('应该调用API获取订单详情', async () => {
      const { default: OrderDetail } = await import('../../../src/pages/order/OrderDetail');
      renderWithRouter(<OrderDetail />);
      
      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/api/pay/order/get', {
          params: { id: 'ORDER123' }
        });
      });
    });

    it('应该能够处理API请求失败', async () => {
      mockApi.get.mockRejectedValue(new Error('网络错误'));
      const { default: OrderDetail } = await import('../../../src/pages/order/OrderDetail');
      renderWithRouter(<OrderDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('获取订单失败')).toBeInTheDocument();
      });
    });
  });

  describe('订单状态', () => {
    it('应该正确显示不同订单状态', async () => {
      const { default: OrderDetail } = await import('../../../src/pages/order/OrderDetail');
      renderWithRouter(<OrderDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('待发货')).toBeInTheDocument();
      });
    });

    it('应该显示订单总金额', async () => {
      const { default: OrderDetail } = await import('../../../src/pages/order/OrderDetail');
      renderWithRouter(<OrderDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('￥299.99')).toBeInTheDocument();
      });
    });
  });

  describe('错误处理', () => {
    it('应该能够处理订单数据为空', async () => {
      mockApi.get.mockResolvedValue({ data: { data: null } });
      const { default: OrderDetail } = await import('../../../src/pages/order/OrderDetail');
      renderWithRouter(<OrderDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('订单不存在')).toBeInTheDocument();
      });
    });
  });

  describe('UI状态', () => {
    it('加载时应该显示加载状态', async () => {
      mockApi.get.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const { default: OrderDetail } = await import('../../../src/pages/order/OrderDetail');
      renderWithRouter(<OrderDetail />);
      
      expect(screen.getByText('正在加载订单详情...')).toBeInTheDocument();
    });
  });

  describe('导航功能', () => {
    it('应该能够返回订单列表', async () => {
      const { default: OrderDetail } = await import('../../../src/pages/order/OrderDetail');
      renderWithRouter(<OrderDetail />);
      
      await waitFor(() => {
        const backButton = screen.getByText('返回订单列表');
        fireEvent.click(backButton);
        expect(mockNavigate).toHaveBeenCalledWith('/order/list');
      });
    });
  });

  describe('数据格式化', () => {
    it('应该正确格式化订单号', async () => {
      const { default: OrderDetail } = await import('../../../src/pages/order/OrderDetail');
      renderWithRouter(<OrderDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('#ORDER123')).toBeInTheDocument();
      });
    });

    it('应该正确格式化日期', async () => {
      const { default: OrderDetail } = await import('../../../src/pages/order/OrderDetail');
      renderWithRouter(<OrderDetail />);
      
      await waitFor(() => {
        // 检查日期是否被正确格式化显示
        const dateElements = screen.getAllByText(/2024/);
        expect(dateElements.length).toBeGreaterThan(0);
      });
    });
  });
}); 