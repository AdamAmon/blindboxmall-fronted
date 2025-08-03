import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockLocation = { state: null };
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
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

const mockPrizes = [
  {
    id: 1,
    name: '测试奖品1',
    image: '/prize1.jpg',
    order_item_id: 101,
    order_id: 'ORDER001',
    opened_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 2,
    name: '测试奖品2',
    image: '/prize2.jpg',
    order_item_id: 102,
    order_id: 'ORDER002',
    opened_at: '2024-01-02T10:00:00Z',
  },
];

const mockOrders = [
  {
    order: { id: 'ORDER001' },
    items: [
      {
        id: 101,
        is_opened: true,
        opened_at: '2024-01-01T10:00:00Z',
        item: mockPrizes[0],
      },
    ],
  },
  {
    order: { id: 'ORDER002' },
    items: [
      {
        id: 102,
        is_opened: true,
        opened_at: '2024-01-02T10:00:00Z',
        item: mockPrizes[1],
      },
    ],
  },
];

describe('PlayerShowCreate Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));
    mockApi.get.mockResolvedValue({ data: mockOrders });
    mockApi.post.mockResolvedValue({ data: { success: true } });
  });

  describe('基本渲染', () => {
    it('应该正确渲染玩家秀创建页面', async () => {
      const { default: PlayerShowCreate } = await import('../../../src/pages/community/PlayerShowCreate');
      renderWithRouter(<PlayerShowCreate />);
      
      await waitFor(() => {
        expect(screen.getByText('🎉 发布玩家秀')).toBeInTheDocument();
        expect(screen.getByText('分享您的盲盒开箱体验，展示您的幸运时刻')).toBeInTheDocument();
      });
    });

    it('应该显示页面标题和步骤', async () => {
      const { default: PlayerShowCreate } = await import('../../../src/pages/community/PlayerShowCreate');
      renderWithRouter(<PlayerShowCreate />);
      
      await waitFor(() => {
        expect(screen.getByText('选择要展示的奖品')).toBeInTheDocument();
        expect(screen.getByText('添加图片')).toBeInTheDocument();
        expect(screen.getByText('分享体验')).toBeInTheDocument();
      });
    });
  });

  describe('用户权限', () => {
    it('未登录用户应该跳转到登录页', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      const { default: PlayerShowCreate } = await import('../../../src/pages/community/PlayerShowCreate');
      renderWithRouter(<PlayerShowCreate />);
      
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('应该能够获取用户信息', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));
      const { default: PlayerShowCreate } = await import('../../../src/pages/community/PlayerShowCreate');
      renderWithRouter(<PlayerShowCreate />);
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
    });
  });

  describe('奖品获取', () => {
    it('应该能够获取用户奖品列表', async () => {
      const { default: PlayerShowCreate } = await import('../../../src/pages/community/PlayerShowCreate');
      renderWithRouter(<PlayerShowCreate />);
      
      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/api/pay/order/completed', {
          params: { user_id: mockUser.id }
        });
      });
    });

    it('应该显示奖品列表', async () => {
      const { default: PlayerShowCreate } = await import('../../../src/pages/community/PlayerShowCreate');
      renderWithRouter(<PlayerShowCreate />);
      
      await waitFor(() => {
        expect(screen.getByText('测试奖品1')).toBeInTheDocument();
        expect(screen.getByText('测试奖品2')).toBeInTheDocument();
      });
    });

    it('没有奖品时应该显示提示信息', async () => {
      mockApi.get.mockResolvedValue({ data: [] });
      const { default: PlayerShowCreate } = await import('../../../src/pages/community/PlayerShowCreate');
      renderWithRouter(<PlayerShowCreate />);
      
      await waitFor(() => {
        expect(screen.getByText('暂无可晒单奖品')).toBeInTheDocument();
        expect(screen.getByText('去抽盲盒')).toBeInTheDocument();
      });
    });

    it('应该能够选择奖品', async () => {
      const { default: PlayerShowCreate } = await import('../../../src/pages/community/PlayerShowCreate');
      renderWithRouter(<PlayerShowCreate />);
      
      await waitFor(() => {
        const prize1 = screen.getByText('测试奖品1');
        fireEvent.click(prize1);
      });
    });
  });

  describe('表单交互', () => {
    it('应该能够输入内容', async () => {
      const { default: PlayerShowCreate } = await import('../../../src/pages/community/PlayerShowCreate');
      renderWithRouter(<PlayerShowCreate />);
      
      await waitFor(() => {
        const textarea = screen.getByPlaceholderText('分享你的开盒体验，描述一下你的心情和感受...');
        fireEvent.change(textarea, { target: { value: '这是一个测试内容' } });
        expect(textarea.value).toBe('这是一个测试内容');
      });
    });

    it('应该能够添加图片链接', async () => {
      const { default: PlayerShowCreate } = await import('../../../src/pages/community/PlayerShowCreate');
      renderWithRouter(<PlayerShowCreate />);
      
      await waitFor(() => {
        const addButton = screen.getByText('添加图片链接');
        fireEvent.click(addButton);
      });
    });

    it('应该能够删除图片链接', async () => {
      const { default: PlayerShowCreate } = await import('../../../src/pages/community/PlayerShowCreate');
      renderWithRouter(<PlayerShowCreate />);
      
      await waitFor(() => {
        const addButton = screen.getByText('添加图片链接');
        fireEvent.click(addButton);
        
        // 现在应该有两个图片输入框
        const deleteButtons = screen.getAllByText('删除');
        if (deleteButtons.length > 0) {
          fireEvent.click(deleteButtons[0]);
        }
      });
    });

    it('应该能够输入图片URL', async () => {
      const { default: PlayerShowCreate } = await import('../../../src/pages/community/PlayerShowCreate');
      renderWithRouter(<PlayerShowCreate />);
      
      await waitFor(() => {
        const imageInputs = screen.getAllByPlaceholderText('请输入图片URL，如 https://xxx.com/xxx.jpg');
        fireEvent.change(imageInputs[0], { target: { value: 'https://example.com/image.jpg' } });
        expect(imageInputs[0].value).toBe('https://example.com/image.jpg');
      });
    });
  });

  describe('提交功能', () => {
    it('应该能够提交玩家秀', async () => {
      const { default: PlayerShowCreate } = await import('../../../src/pages/community/PlayerShowCreate');
      renderWithRouter(<PlayerShowCreate />);
      
      await waitFor(async () => {
        // 等待奖品加载完成
        await screen.findByText('测试奖品1');
        
        // 选择奖品
        const prize1 = screen.getByText('测试奖品1');
        fireEvent.click(prize1);
        
        // 输入内容
        const textarea = screen.getByPlaceholderText('分享你的开盒体验，描述一下你的心情和感受...');
        fireEvent.change(textarea, { target: { value: '这是一个测试内容' } });
        
        // 提交
        const submitButton = screen.getByRole('button', { name: /发布玩家秀/i });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(mockApi.post).toHaveBeenCalledWith('/api/community/show/create', {
            user_id: mockUser.id,
            item_id: mockPrizes[0].id,
            order_item_id: mockPrizes[0].order_item_id,
            content: '这是一个测试内容',
            images: [''],
          });
        });
      });
    });

    it('提交失败时应该显示错误信息', async () => {
      mockApi.post.mockRejectedValue(new Error('网络错误'));
      const { default: PlayerShowCreate } = await import('../../../src/pages/community/PlayerShowCreate');
      renderWithRouter(<PlayerShowCreate />);
      
      await waitFor(async () => {
        // 等待奖品加载完成
        await screen.findByText('测试奖品1');
        
        // 选择奖品
        const prize1 = screen.getByText('测试奖品1');
        fireEvent.click(prize1);
        
        // 输入内容
        const textarea = screen.getByPlaceholderText('分享你的开盒体验，描述一下你的心情和感受...');
        fireEvent.change(textarea, { target: { value: '这是一个测试内容' } });
        
        // 提交
        const submitButton = screen.getByRole('button', { name: /发布玩家秀/i });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(screen.getByText('发布失败')).toBeInTheDocument();
        });
      });
    });
  });

  describe('导航功能', () => {
    it('应该能够取消并返回', async () => {
      const { default: PlayerShowCreate } = await import('../../../src/pages/community/PlayerShowCreate');
      renderWithRouter(<PlayerShowCreate />);
      
      await waitFor(() => {
        const cancelButton = screen.getByText('取消');
        fireEvent.click(cancelButton);
        expect(mockNavigate).toHaveBeenCalledWith('/shows');
      });
    });

    it('没有奖品时应该能够跳转到盲盒页面', async () => {
      mockApi.get.mockResolvedValue({ data: [] });
      const { default: PlayerShowCreate } = await import('../../../src/pages/community/PlayerShowCreate');
      renderWithRouter(<PlayerShowCreate />);
      
      await waitFor(() => {
        const goToBlindBoxButton = screen.getByText('去抽盲盒');
        fireEvent.click(goToBlindBoxButton);
        expect(mockNavigate).toHaveBeenCalledWith('/blindboxes');
      });
    });
  });

  describe('错误处理', () => {
    it('应该能够处理API请求失败', async () => {
      mockApi.get.mockRejectedValue(new Error('网络错误'));
      const { default: PlayerShowCreate } = await import('../../../src/pages/community/PlayerShowCreate');
      renderWithRouter(<PlayerShowCreate />);
      
      await waitFor(() => {
        expect(screen.getByText('暂无可晒单奖品')).toBeInTheDocument();
      });
    });
  });

  describe('UI状态', () => {
    it('提交按钮在未选择奖品时应该被禁用', async () => {
      const { default: PlayerShowCreate } = await import('../../../src/pages/community/PlayerShowCreate');
      renderWithRouter(<PlayerShowCreate />);
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /发布玩家秀/i });
        expect(submitButton).toBeDisabled();
      });
    });

    it('提交按钮在内容为空时应该被禁用', async () => {
      const { default: PlayerShowCreate } = await import('../../../src/pages/community/PlayerShowCreate');
      renderWithRouter(<PlayerShowCreate />);
      
      await waitFor(async () => {
        // 选择奖品
        const prize1 = screen.getByText('测试奖品1');
        fireEvent.click(prize1);
        
        const submitButton = screen.getByRole('button', { name: /发布玩家秀/i });
        expect(submitButton).toBeDisabled();
      });
    });

    it('提交时应该显示加载状态', async () => {
      mockApi.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const { default: PlayerShowCreate } = await import('../../../src/pages/community/PlayerShowCreate');
      renderWithRouter(<PlayerShowCreate />);
      
      await waitFor(async () => {
        // 等待奖品加载完成
        await screen.findByText('测试奖品1');
        
        // 选择奖品
        const prize1 = screen.getByText('测试奖品1');
        fireEvent.click(prize1);
        
        // 输入内容
        const textarea = screen.getByPlaceholderText('分享你的开盒体验，描述一下你的心情和感受...');
        fireEvent.change(textarea, { target: { value: '这是一个测试内容' } });
        
        // 提交
        const submitButton = screen.getByRole('button', { name: /发布玩家秀/i });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(screen.getByText('发布中...')).toBeInTheDocument();
        });
      });
    });
  });
});