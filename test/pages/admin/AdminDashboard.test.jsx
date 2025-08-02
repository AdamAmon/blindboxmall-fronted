import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from '../../../src/pages/admin/AdminDashboard';
import api from '../../../src/utils/axios';
import * as useUserModule from '../../../src/hooks/useUser';

// 模拟 react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// 模拟 API
vi.mock('../../../src/utils/axios', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// 模拟 useUser hook
vi.mock('../../../src/hooks/useUser', () => ({
  useUser: vi.fn(),
}));

// 模拟 react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AdminDashboard Component', () => {
  const mockBlindBoxes = [
    {
      id: 1,
      name: '测试盲盒1',
      description: '这是一个测试盲盒',
      price: 99.99,
      status: 1,
      comment_count: 5,
      stock: 100,
      created_at: '2024-01-01T08:00:00Z',
    },
    {
      id: 2,
      name: '测试盲盒2',
      description: '这是另一个测试盲盒',
      price: 149.99,
      status: 0,
      comment_count: 3,
      stock: 50,
      created_at: '2024-01-02T08:00:00Z',
    },
  ];

  const mockApiResponse = {
    data: {
      code: 200,
      data: {
        list: mockBlindBoxes,
        totalPages: 1,
      },
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // 默认模拟管理员用户
    vi.spyOn(useUserModule, 'useUser').mockReturnValue({
      id: 1,
      username: 'admin',
      role: 'admin',
    });
    
    // 模拟 API 响应
    api.get.mockResolvedValue(mockApiResponse);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('权限验证', () => {
    it('非管理员用户应该显示无权限页面', async () => {
      vi.spyOn(useUserModule, 'useUser').mockReturnValue({
        id: 2,
        username: 'user',
        role: 'customer',
      });

      await act(async () => {
        render(
          <MemoryRouter>
            <AdminDashboard />
          </MemoryRouter>
        );
      });

      expect(screen.getByText('无权限访问')).toBeInTheDocument();
      expect(screen.getByText('只有管理员用户才能访问此页面')).toBeInTheDocument();
    });

    it('未登录用户应该显示无权限页面', async () => {
      vi.spyOn(useUserModule, 'useUser').mockReturnValue(null);

      await act(async () => {
        render(
          <MemoryRouter>
            <AdminDashboard />
          </MemoryRouter>
        );
      });

      expect(screen.getByText('无权限访问')).toBeInTheDocument();
    });
  });

  describe('页面渲染', () => {
    it('管理员用户应该正确渲染页面', async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <AdminDashboard />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('管理员面板')).toBeInTheDocument();
        expect(screen.getByText('管理盲盒商城系统')).toBeInTheDocument();
      });
    });
  });

  describe('数据加载', () => {
    it('应该显示加载状态', async () => {
      // 模拟一个永不解析的 Promise 来保持加载状态
      api.get.mockImplementation(() => new Promise(() => {}));
      
      await act(async () => {
        render(
          <MemoryRouter>
            <AdminDashboard />
          </MemoryRouter>
        );
      });

      expect(screen.getByText('正在加载管理员面板...')).toBeInTheDocument();
    });

    it('应该加载盲盒数据', async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <AdminDashboard />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/blindbox', expect.any(Object));
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理API错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      api.get.mockRejectedValue(new Error('API Error'));

      await act(async () => {
        render(
          <MemoryRouter>
            <AdminDashboard />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('获取盲盒列表失败');
      });
      
      consoleSpy.mockRestore();
    });
  });
}); 