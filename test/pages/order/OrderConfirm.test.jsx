import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OrderConfirm from '../../../src/pages/order/OrderConfirm';

// 模拟 API
vi.mock('../../../src/utils/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// 模拟 react-router-dom
const mockNavigate = vi.fn();
const mockSearchParams = new URLSearchParams();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams],
  };
});

// 模拟 react-toastify
const toastError = vi.fn();
const toastSuccess = vi.fn();
vi.mock('react-toastify', () => ({
  toast: {
    error: (...args) => toastError(...args),
    success: (...args) => toastSuccess(...args),
  },
}));

// 模拟 AddressManageModal
vi.mock('../../../src/components/AddressManageModal', () => ({
  default: () => <div data-testid="address-modal">Address Modal</div>,
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

describe('OrderConfirm Component', () => {
  let mockApi;
  
  const mockCartItems = [
    {
      id: 1,
      quantity: 2,
      blindBox: {
        id: 1,
        name: '测试盲盒1',
        price: 50.00,
        image: 'test1.jpg',
      },
    },
    {
      id: 2,
      quantity: 1,
      blindBox: {
        id: 2,
        name: '测试盲盒2',
        price: 100.00,
        image: 'test2.jpg',
      },
    },
  ];

  const mockAddresses = [
    {
      id: 1,
      name: '张三',
      phone: '13800138000',
      address: '北京市朝阳区测试街道1号',
      is_default: true,
    },
    {
      id: 2,
      name: '李四',
      phone: '13800138001',
      address: '上海市浦东新区测试街道2号',
      is_default: false,
    },
  ];

  const mockCoupons = [
    {
      id: 1,
      coupon: {
        type: 1,
        amount: 10,
        threshold: 100,
      },
    },
    {
      id: 2,
      coupon: {
        type: 2,
        amount: 0.8,
        threshold: 50,
      },
    },
  ];

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    balance: 500.00,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    toastError.mockClear();
    toastSuccess.mockClear();
    // 动态获取 mock API
    const axiosModule = await import('../../../src/utils/axios');
    mockApi = axiosModule.default;
    // 设置默认 mock 返回值 - 修复API调用顺序
    mockApi.get
      .mockResolvedValueOnce({ data: { data: mockCartItems } }) // 购物车
      .mockResolvedValueOnce({ data: { data: mockAddresses } }) // 地址
      .mockResolvedValueOnce({ data: mockCoupons }); // 优惠券
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
    it('应该正确渲染订单确认页面', async () => {
      await act(async () => {
        renderWithRouter(<OrderConfirm />);
      });
      await waitFor(() => {
        expect(screen.getByText(/确认订单/)).toBeInTheDocument();
      });
    });
    it('应该能够获取用户信息', async () => {
      await act(async () => {
        renderWithRouter(<OrderConfirm />);
      });
      expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
    });
    it('组件重新渲染不会报错', async () => {
      let utils;
      await act(async () => {
        utils = renderWithRouter(<OrderConfirm />);
      });
      // 先正常渲染
      await waitFor(() => {
        expect(screen.getByText(/确认订单/)).toBeInTheDocument();
      });
      // 让购物车为空
      mockApi.get
        .mockResolvedValueOnce({ data: { data: [] } })
        .mockResolvedValueOnce({ data: { data: mockAddresses } })
        .mockResolvedValueOnce({ data: mockCoupons });
      await act(async () => {
        utils.rerender(<OrderConfirm />);
      });
      await waitFor(() => {
        // 断言“购物车为空”
        expect(screen.getByText('购物车为空')).toBeInTheDocument();
      });
    });
  });

  describe('权限控制', () => {
    it('未登录用户应该跳转到登录页', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      await act(async () => {
        renderWithRouter(<OrderConfirm />);
      });
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
      });
    });
  });

  describe('API 调用', () => {
    it('组件挂载时应该获取购物车列表', async () => {
      await act(async () => {
        renderWithRouter(<OrderConfirm />);
      });
      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/api/cart/list', { params: { user_id: 1 } });
      });
    });
    it('组件挂载时应该获取地址列表', async () => {
      await act(async () => {
        renderWithRouter(<OrderConfirm />);
      });
      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/api/address/list', { params: { userId: 1 } });
      });
    });
    it('组件挂载时应该获取优惠券列表', async () => {
      await act(async () => {
        renderWithRouter(<OrderConfirm />);
      });
      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/api/user-coupon/available?user_id=1');
      });
    });
    it('应该能够处理 API 请求失败', async () => {
      mockApi.get.mockRejectedValue(new Error('网络错误'));
      await act(async () => {
        renderWithRouter(<OrderConfirm />);
      });
      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/api/cart/list', { params: { user_id: 1 } });
      });
    });
  });

  describe('UI 元素', () => {
    it('应该显示收货地址', async () => {
      await act(async () => {
        renderWithRouter(<OrderConfirm />);
      });
      await waitFor(() => {
        expect(screen.getByText('收货地址')).toBeInTheDocument();
      });
    });
    it('应该显示支付方式', async () => {
      await act(async () => {
        renderWithRouter(<OrderConfirm />);
      });
      await waitFor(() => {
        expect(screen.getByText('支付方式')).toBeInTheDocument();
      });
    });
    it('应该显示优惠券', async () => {
      await act(async () => {
        renderWithRouter(<OrderConfirm />);
      });
      await waitFor(() => {
        expect(screen.getByText('优惠券')).toBeInTheDocument();
      });
    });
    it('应该显示价格汇总', async () => {
      await act(async () => {
        renderWithRouter(<OrderConfirm />);
      });
      await waitFor(() => {
        expect(screen.getByText('价格汇总')).toBeInTheDocument();
      });
    });
  });

  describe('交互功能', () => {
    it('应该能够切换支付方式', async () => {
      await act(async () => {
        renderWithRouter(<OrderConfirm />);
      });
      await waitFor(() => {
        const alipayRadio = screen.getByDisplayValue('alipay');
        fireEvent.click(alipayRadio);
        expect(alipayRadio).toBeChecked();
      });
    });
    it('应该能够选择优惠券', async () => {
      await act(async () => {
        renderWithRouter(<OrderConfirm />);
      });
      await waitFor(() => {
        const couponSelect = screen.getByRole('combobox');
        fireEvent.change(couponSelect, { target: { value: '1' } });
        expect(couponSelect.value).toBe('1');
      });
    });
    it('应该能够打开地址管理模态框', async () => {
      await act(async () => {
        renderWithRouter(<OrderConfirm />);
      });
      await waitFor(() => {
        const manageAddressBtn = screen.getByText('管理地址');
        fireEvent.click(manageAddressBtn);
        expect(screen.getByTestId('address-modal')).toBeInTheDocument();
      });
    });
  });

  describe('错误处理', () => {
    it('应该能够处理网络错误', async () => {
      mockApi.get.mockRejectedValue(new Error('网络错误'));
      await act(async () => {
        renderWithRouter(<OrderConfirm />);
      });
      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/api/cart/list', { params: { user_id: 1 } });
      });
    });
    it('应该能够处理API响应格式错误', async () => {
      mockApi.get.mockResolvedValue({ data: null });
      await act(async () => {
        renderWithRouter(<OrderConfirm />);
      });
      expect(() => {
        renderWithRouter(<OrderConfirm />);
      }).not.toThrow();
    });
  });

  describe('边界情况', () => {
    it('应该能够处理用户ID为空', async () => {
      const userWithoutId = { username: 'test', email: 'test@example.com' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(userWithoutId));
      await act(async () => {
        renderWithRouter(<OrderConfirm />);
      });
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });
    it('应该能够处理购物车数据格式错误', async () => {
      mockApi.get
        .mockResolvedValueOnce({ data: { data: [{ invalid: 'data' }] } })
        .mockResolvedValueOnce({ data: { data: mockAddresses } })
        .mockResolvedValueOnce({ data: mockCoupons });
      await act(async () => {
        renderWithRouter(<OrderConfirm />);
      });
      expect(() => {
        renderWithRouter(<OrderConfirm />);
      }).not.toThrow();
    });
  });
}); 