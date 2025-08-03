import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Profile from '../../../src/pages/user/Profile';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import api from '../../../src/utils/axios';

// 模拟 react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// mock useNavigate，防止自动跳转
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
    post: vi.fn(),
  },
}));

// 模拟 AddressManageModal 组件
vi.mock('../../../src/components/AddressManageModal', () => ({
  default: ({ open, onClose }) => open ? (
    <div data-testid="address-modal">
      <button onClick={onClose}>关闭地址管理</button>
    </div>
  ) : null,
}));

// 模拟 RechargeModal 组件
vi.mock('../../../src/components/RechargeModal', () => ({
  default: ({ open, onClose, onRecharge }) => open ? (
    <div data-testid="recharge-modal">
      <button onClick={onClose}>关闭充值</button>
      <button onClick={() => onRecharge(100)}>充值100元</button>
    </div>
  ) : null,
}));

// 强化 localStorage mock
beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn((key) => {
        if (key === 'token') return 'mocktoken';
        if (key === 'user') return JSON.stringify({ id: 1 });
        return null;
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
    writable: true,
  });

  // 模拟 window.open
  window.open = vi.fn();
});

describe('Profile 页面', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    nickname: '测试用户',
    email: 'test@example.com',
    phone: '13800138000',
    role: 'customer',
    balance: 100.50,
    avatar: 'https://example.com/avatar.jpg'
  };

  const mockAddress = {
    id: 1,
    recipient: '张三',
    phone: '13800138000',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    detail: '科技园路1号',
    is_default: true
  };

  const mockRechargeRecords = [
    {
      recharge_id: 1,
      recharge_amount: 50.00,
      recharge_status: 'success',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      recharge_id: 2,
      recharge_amount: 100.00,
      recharge_status: 'pending',
      created_at: '2024-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    // 重置所有 mock
    vi.clearAllMocks();

    // 重置 localStorage mock
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'mocktoken';
      if (key === 'user') return JSON.stringify({ id: 1 });
      return null;
    });

    // 设置默认的 API 响应
    api.get.mockImplementation((url) => {
      if (url === '/api/user/get') {
        return Promise.resolve({ data: { data: mockUser } });
      }
      if (url === '/api/address/list') {
        return Promise.resolve({ data: { data: [mockAddress] } });
      }
      if (url === '/api/pay/records') {
        return Promise.resolve({ data: { data: mockRechargeRecords } });
      }
      return Promise.resolve({ data: { data: {} } });
    });

    api.post.mockResolvedValue({ data: { success: true, data: mockUser } });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染', () => {
    it('应该正确渲染用户基本信息', async () => {
      render(<Profile />);
      
      await waitFor(() => {
        expect(screen.getByText('个人信息')).toBeInTheDocument();
        expect(screen.getByText('testuser')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByText('13800138000')).toBeInTheDocument();
        expect(screen.getByText('顾客')).toBeInTheDocument();
      });
    });

    it('应该显示用户余额', async () => {
      render(<Profile />);
      
      await waitFor(() => {
        expect(screen.getByText(/余额：￥100\.50/)).toBeInTheDocument();
      });
    });

    it('应该显示默认收货地址', async () => {
      render(<Profile />);
      
      await waitFor(() => {
        expect(screen.getByText(/张三，13800138000，广东省深圳市南山区科技园路1号/)).toBeInTheDocument();
      });
    });

    it('应该显示快捷操作按钮', async () => {
      render(<Profile />);
      
      await waitFor(() => {
        expect(screen.getByText('我的订单')).toBeInTheDocument();
        expect(screen.getByText('我的奖品')).toBeInTheDocument();
        expect(screen.getByText('秀奖品')).toBeInTheDocument();
        expect(screen.getByText('退出登录')).toBeInTheDocument();
      });
    });
  });

  describe('权限控制', () => {
    it('没有token时应该跳转到登录页面', async () => {
      window.localStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return null;
        return null;
      });

      render(<Profile />);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('没有用户信息时应该跳转到登录页面', async () => {
      window.localStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return 'mocktoken';
        if (key === 'user') return null;
        return null;
      });

      render(<Profile />);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('API调用失败时应该跳转到登录页面', async () => {
      api.get.mockRejectedValue(new Error('API Error'));

      render(<Profile />);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('用户信息编辑', () => {
    it('点击编辑按钮应该打开编辑模态框', async () => {
      render(<Profile />);
      
      await waitFor(() => {
        const editButton = screen.getByText('编辑信息');
        fireEvent.click(editButton);
      });

      await waitFor(() => {
        expect(screen.getByText('编辑个人信息')).toBeInTheDocument();
      });
    });

    it('编辑模态框应该显示当前用户信息', async () => {
      render(<Profile />);
      
      await waitFor(() => {
        const editButton = screen.getByText('编辑信息');
        fireEvent.click(editButton);
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('测试用户')).toBeInTheDocument();
        expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('13800138000')).toBeInTheDocument();
      });
    });

    it('应该能够修改用户信息', async () => {
      render(<Profile />);
      
      await waitFor(() => {
        const editButton = screen.getByText('编辑信息');
        fireEvent.click(editButton);
      });

      await waitFor(() => {
        const nicknameInput = screen.getByDisplayValue('测试用户');
        fireEvent.change(nicknameInput, { target: { value: '新昵称' } });
        expect(nicknameInput.value).toBe('新昵称');
      });
    });

    it('保存用户信息应该调用API', async () => {
      render(<Profile />);
      
      await waitFor(() => {
        const editButton = screen.getByText('编辑信息');
        fireEvent.click(editButton);
      });

      await waitFor(() => {
        const saveButton = screen.getByText('保存');
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/api/user/update', {
          id: 1,
          nickname: '测试用户',
          email: 'test@example.com',
          phone: '13800138000',
          avatar: 'https://example.com/avatar.jpg'
        });
      });
    });

    it('编辑失败时应该显示错误信息', async () => {
      api.post.mockRejectedValue({ response: { data: { message: '保存失败' } } });

      render(<Profile />);
      
      await waitFor(() => {
        const editButton = screen.getByText('编辑信息');
        fireEvent.click(editButton);
      });

      await waitFor(() => {
        const saveButton = screen.getByText('保存');
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(screen.getByText('保存失败')).toBeInTheDocument();
      });
    });
  });

  describe('充值功能', () => {
    it('点击余额充值按钮应该打开充值模态框', async () => {
      render(<Profile />);
      
      await waitFor(() => {
        const rechargeButton = screen.getByText('余额充值');
        fireEvent.click(rechargeButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('recharge-modal')).toBeInTheDocument();
      });
    });

    it('充值成功应该调用API', async () => {
      api.post.mockResolvedValue({ 
        data: { 
          success: true, 
          payUrl: 'https://example.com/pay' 
        } 
      });

      render(<Profile />);
      
      await waitFor(() => {
        const rechargeButton = screen.getByText('余额充值');
        fireEvent.click(rechargeButton);
      });

      await waitFor(() => {
        const recharge100Button = screen.getByText('充值100元');
        fireEvent.click(recharge100Button);
      });

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/api/pay/recharge', {
          userId: 1,
          amount: 100
        });
        expect(window.open).toHaveBeenCalledWith('https://example.com/pay', '_blank');
      });
    });


  });

  describe('地址管理', () => {
    it('点击地址管理按钮应该打开地址管理模态框', async () => {
      render(<Profile />);
      
      await waitFor(() => {
        const addressManageButton = screen.getByText('管理');
        fireEvent.click(addressManageButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('address-modal')).toBeInTheDocument();
      });
    });

    it('地址管理模态框关闭后应该刷新地址信息', async () => {
      render(<Profile />);
      
      await waitFor(() => {
        const addressManageButton = screen.getByText('管理');
        fireEvent.click(addressManageButton);
      });

      await waitFor(() => {
        const closeButton = screen.getByText('关闭地址管理');
        fireEvent.click(closeButton);
      });

      // 验证API被调用
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/address/list', { params: { userId: 1 } });
      });
    });
  });

  describe('充值记录', () => {
    it('应该显示充值记录按钮', async () => {
      render(<Profile />);
      
      await waitFor(() => {
        expect(screen.getByText('充值记录')).toBeInTheDocument();
        expect(screen.getByText('刷新')).toBeInTheDocument();
        expect(screen.getByText('查看')).toBeInTheDocument();
      });
    });

    it('点击查看按钮应该显示充值记录', async () => {
      render(<Profile />);
      
      await waitFor(() => {
        const viewButton = screen.getByText('查看');
        fireEvent.click(viewButton);
      });

      await waitFor(() => {
        expect(screen.getByText('时间')).toBeInTheDocument();
        expect(screen.getByText('金额')).toBeInTheDocument();
        expect(screen.getByText('状态')).toBeInTheDocument();
        expect(screen.getByText('￥50.00')).toBeInTheDocument();
        expect(screen.getByText('￥100.00')).toBeInTheDocument();
      });
    });

    it('点击刷新按钮应该重新获取充值记录', async () => {
      render(<Profile />);
      
      await waitFor(() => {
        const refreshButton = screen.getByText('刷新');
        fireEvent.click(refreshButton);
      });

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/pay/records', { params: { userId: 1 } });
        expect(api.get).toHaveBeenCalledWith('/api/user/get', { params: { id: 1 } });
      });
    });

    it('没有充值记录时应该显示提示信息', async () => {
      api.get.mockImplementation((url) => {
        if (url === '/api/user/get') {
          return Promise.resolve({ data: { data: mockUser } });
        }
        if (url === '/api/address/list') {
          return Promise.resolve({ data: { data: [mockAddress] } });
        }
        if (url === '/api/pay/records') {
          return Promise.resolve({ data: { data: [] } });
        }
        return Promise.resolve({ data: { data: {} } });
      });

      render(<Profile />);
      
      await waitFor(() => {
        const viewButton = screen.getByText('查看');
        fireEvent.click(viewButton);
      });

      await waitFor(() => {
        expect(screen.getByText('暂无记录')).toBeInTheDocument();
      });
    });
  });

  describe('导航功能', () => {
    it('点击我的订单应该导航到订单列表', async () => {
      render(<Profile />);
      
      await waitFor(() => {
        const orderButton = screen.getByText('我的订单');
        fireEvent.click(orderButton);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/order/list');
    });

    it('点击我的奖品应该导航到奖品列表', async () => {
      render(<Profile />);
      
      await waitFor(() => {
        const prizeButton = screen.getByText('我的奖品');
        fireEvent.click(prizeButton);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/prizes');
    });

    it('点击秀奖品应该导航到创建玩家秀', async () => {
      render(<Profile />);
      
      await waitFor(() => {
        const showButton = screen.getByText('秀奖品');
        fireEvent.click(showButton);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/shows/create');
    });

    it('点击退出登录应该清除本地存储并跳转', async () => {
      render(<Profile />);
      
      await waitFor(() => {
        const logoutButton = screen.getByText('退出登录');
        fireEvent.click(logoutButton);
      });

      expect(window.localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('user');
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('错误处理', () => {
    it('获取用户信息失败时应该跳转到登录页', async () => {
      api.get.mockRejectedValue(new Error('Network Error'));

      render(<Profile />);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('获取地址信息失败时应该显示未设置', async () => {
      api.get.mockImplementation((url) => {
        if (url === '/api/user/get') {
          return Promise.resolve({ data: { data: mockUser } });
        }
        if (url === '/api/address/list') {
          return Promise.reject(new Error('Address API Error'));
        }
        return Promise.resolve({ data: { data: {} } });
      });

      render(<Profile />);
      
      await waitFor(() => {
        expect(screen.getByText('未设置')).toBeInTheDocument();
      });
    });

    it('获取充值记录失败时应该显示空列表', async () => {
      api.get.mockImplementation((url) => {
        if (url === '/api/user/get') {
          return Promise.resolve({ data: { data: mockUser } });
        }
        if (url === '/api/address/list') {
          return Promise.resolve({ data: { data: [mockAddress] } });
        }
        if (url === '/api/pay/records') {
          return Promise.reject(new Error('Records API Error'));
        }
        return Promise.resolve({ data: { data: {} } });
      });

      render(<Profile />);
      
      await waitFor(() => {
        const viewButton = screen.getByText('查看');
        fireEvent.click(viewButton);
      });

      await waitFor(() => {
        expect(screen.getByText('暂无记录')).toBeInTheDocument();
      });
    });
  });

  describe('边界情况', () => {
    it('用户信息为空时应该显示占位符', async () => {
      const emptyUser = {
        id: 1,
        username: '',
        nickname: '',
        email: '',
        phone: '',
        role: 'customer',
        balance: 0,
        avatar: ''
      };

      api.get.mockImplementation((url) => {
        if (url === '/api/user/get') {
          return Promise.resolve({ data: { data: emptyUser } });
        }
        if (url === '/api/address/list') {
          return Promise.resolve({ data: { data: [] } });
        }
        return Promise.resolve({ data: { data: {} } });
      });

      render(<Profile />);
      
      await waitFor(() => {
        expect(screen.getAllByText('未填写')).toHaveLength(3);
        expect(screen.getByText('未设置')).toBeInTheDocument();
      });
    });

    it('余额为null时应该显示0.00', async () => {
      const userWithNullBalance = { ...mockUser, balance: null };

      api.get.mockImplementation((url) => {
        if (url === '/api/user/get') {
          return Promise.resolve({ data: { data: userWithNullBalance } });
        }
        if (url === '/api/address/list') {
          return Promise.resolve({ data: { data: [mockAddress] } });
        }
        return Promise.resolve({ data: { data: {} } });
      });

      render(<Profile />);
      
      await waitFor(() => {
        expect(screen.getByText(/余额：￥0\.00/)).toBeInTheDocument();
      });
    });

    it('不同角色应该显示正确的角色名称', async () => {
      const sellerUser = { ...mockUser, role: 'seller' };

      api.get.mockImplementation((url) => {
        if (url === '/api/user/get') {
          return Promise.resolve({ data: { data: sellerUser } });
        }
        if (url === '/api/address/list') {
          return Promise.resolve({ data: { data: [mockAddress] } });
        }
        return Promise.resolve({ data: { data: {} } });
      });

      render(<Profile />);
      
      await waitFor(() => {
        expect(screen.getByText('商家')).toBeInTheDocument();
      });
    });
  });
});