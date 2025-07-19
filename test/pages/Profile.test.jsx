import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Profile from '../../src/pages/user/Profile';
import axios from 'axios';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// mock useNavigate，防止自动跳转
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
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
    axios.get.mockImplementation((url, { params }) => {
      if (url === '/api/user/get') {
        return Promise.resolve({ data: { data: mockUser } });
      }
      if (url === '/api/address/list') {
        return Promise.resolve({ data: { data: mockAddressList } });
      }
      return Promise.reject(new Error('not found'));
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('渲染用户基本信息', async () => {
    render(<Profile />);
    await waitFor(() => {
      expect(screen.getAllByText('测试用户').length).toBeGreaterThan(0);
      expect(screen.getAllByText('testuser').length).toBeGreaterThan(0);
      expect(screen.getAllByText('test@example.com').length).toBeGreaterThan(0);
      expect(screen.getAllByText('12345678901').length).toBeGreaterThan(0);
      expect(screen.getAllByText('顾客').length).toBeGreaterThan(0);
      expect(screen.getAllByText(/张三/).length).toBeGreaterThan(0);
    });
  });

  it('点击编辑按钮弹出编辑框', async () => {
    render(<Profile />);
    await waitFor(() => screen.getByText('编辑信息'));
    fireEvent.click(screen.getByText('编辑信息'));
    expect(await screen.findByText('编辑个人信息')).toBeInTheDocument();
  });

  it('点击管理地址弹出地址管理弹窗', async () => {
    render(<Profile />);
    const manageBtns = await screen.findAllByText('管理');
    fireEvent.click(manageBtns[0]);
    expect(await screen.findByText('地址管理')).toBeInTheDocument();
  });
});