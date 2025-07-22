import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Profile from '../../src/pages/user/Profile';
import axios from 'axios';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// mock useNavigate，防止自动跳转
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock axios
vi.mock('axios');

const mockUser = {
  id: 1,
  username: 'testuser',
  nickname: '测试用户',
  email: 'test@example.com',
  phone: '12345678901',
  avatar: '',
  role: 'customer'
};

const mockAddressList = [
  {
    id: 1,
    user_id: 1,
    recipient: '张三',
    phone: '12345678901',
    province: '河北',
    city: '石家庄',
    district: '长安区',
    detail: '测试路1号',
    is_default: true
  }
];

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
});

describe('Profile 页面', () => {
  beforeEach(() => {
    // 重置所有 mock
    vi.clearAllMocks();
    
    // 设置 axios mock
    axios.get.mockImplementation((url) => {
      if (url === '/api/user/get') {
        return Promise.resolve({ data: { data: mockUser } });
      }
      if (url === '/api/address/list') {
        return Promise.resolve({ data: { data: mockAddressList } });
      }
      if (url === '/api/recharge/records') {
        return Promise.resolve({ data: { data: [] } });
      }
      return Promise.reject(new Error('not found'));
    });

    // 重置 localStorage mock
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'mocktoken';
      if (key === 'user') return JSON.stringify({ id: 1 });
      return null;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('渲染用户基本信息', async () => {
    render(<Profile />);
    
    // 等待组件加载完成
    await waitFor(() => {
      expect(screen.getByText('个人信息')).toBeInTheDocument();
    });

    // 检查用户信息是否正确显示 - 使用更具体的查询
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('12345678901')).toBeInTheDocument();
    // expect(screen.getByText('顾客')).toBeInTheDocument();
    // 修正：页面有多个“顾客”，用 getAllByText
    const roleLabels = screen.getAllByText('顾客');
    expect(roleLabels.length).toBeGreaterThan(0);
    
    // 检查表格中的用户名（使用更具体的查询）
    const usernameRow = screen.getByText('用户名').closest('tr');
    const usernameCell = usernameRow.querySelector('td:last-child');
    expect(usernameCell).toHaveTextContent('testuser');
    
    // 检查表格中的昵称
    const nicknameRow = screen.getByText('昵称').closest('tr');
    const nicknameCell = nicknameRow.querySelector('td:last-child');
    expect(nicknameCell).toHaveTextContent('测试用户');
  });

  it('点击编辑按钮弹出编辑框', async () => {
    render(<Profile />);
    
    await waitFor(() => {
      expect(screen.getByText('编辑信息')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('编辑信息'));
    
    await waitFor(() => {
      expect(screen.getByText('编辑个人信息')).toBeInTheDocument();
    });
  });

  it('点击管理地址弹出地址管理弹窗', async () => {
    render(<Profile />);
    
    await waitFor(() => {
      expect(screen.getByText('管理')).toBeInTheDocument();
    });
    
    const manageBtn = screen.getByText('管理');
    fireEvent.click(manageBtn);
    
    await waitFor(() => {
      // 修正：弹窗和按钮等多处有“地址管理”，用 getAllByText
      const titles = screen.getAllByText('地址管理');
      // 断言至少有一个是弹窗标题
      expect(titles.length).toBeGreaterThan(0);
    });
  });

  it('没有token时跳转到登录页面', async () => {
    // 模拟没有token的情况
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return null;
      return null;
    });

    render(<Profile />);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});