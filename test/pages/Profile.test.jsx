import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Profile from '../../src/pages/user/Profile';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

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