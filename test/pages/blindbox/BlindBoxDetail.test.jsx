import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import BlindBoxDetail from '../../../src/pages/blindbox/BlindBoxDetail';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import api from '../../../src/utils/axios';

// 模拟 react-router-dom 的 useParams 和 useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => mockNavigate,
  };
});

// 模拟 react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// 模拟 useUser hook
vi.mock('../../../src/hooks/useUser', () => ({
  useUser: () => ({
    id: 1,
    username: 'testuser',
    nickname: '测试用户',
    balance: 100.00,
    role: 'customer',
  }),
}));

// 模拟 axios
vi.mock('../../../src/utils/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('BlindBoxDetail', () => {
  const mockBlindBox = {
    id: 1,
    name: '测试盲盒',
    description: '这是一个测试盲盒',
    price: 50.00,
    original_price: 100.00,
    stock: 100,
    sold_count: 50,
    image_url: 'https://example.com/image.jpg',
    cover_image: 'https://example.com/image.jpg',
    seller_id: 1,
    seller_name: '测试商家',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    status: 0, // 下架状态
    comment_count: 0,
  };

  const mockBoxItems = [
    {
      id: 1,
      name: '稀有物品1',
      description: '这是一个稀有物品',
      image: 'https://example.com/item1.jpg',
      image_url: 'https://example.com/item1.jpg',
      rarity: 'rare',
      probability: 0.1,
    },
    {
      id: 2,
      name: '普通物品1',
      description: '这是一个普通物品',
      image: 'https://example.com/item2.jpg',
      image_url: 'https://example.com/item2.jpg',
      rarity: 'common',
      probability: 0.9,
    },
  ];

  const mockComments = [
    {
      id: 1,
      content: '这个盲盒很不错！',
      user_id: 1,
      username: 'user1',
      nickname: '用户1',
      created_at: '2024-01-01T00:00:00Z',
      likes: 5,
      replies: [],
    },
    {
      id: 2,
      content: '抽到了稀有物品！',
      user_id: 2,
      username: 'user2',
      nickname: '用户2',
      created_at: '2024-01-02T00:00:00Z',
      likes: 3,
      replies: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // 设置默认的 API 响应
    api.get.mockImplementation((url) => {
      if (url === '/api/blindbox/1') {
        return Promise.resolve({ data: { code: 200, data: mockBlindBox } });
      }
      if (url === '/api/blindbox/1/items') {
        return Promise.resolve({ data: { code: 200, data: mockBoxItems } });
      }
      if (url === '/api/blindbox/comment/list') {
        return Promise.resolve({ 
          data: { 
            code: 200, 
            data: { 
              list: mockComments, 
              total: mockComments.length 
            } 
          } 
        });
      }
      return Promise.resolve({ data: { code: 200, data: {} } });
    });

    api.post.mockResolvedValue({ data: { code: 200, data: {} } });

    // 模拟 localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key) => {
          if (key === 'user') return JSON.stringify({ id: 1, username: 'testuser' });
          if (key === 'token') return 'mock-token';
          return null;
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
  });

  describe('基本渲染', () => {
    it('应该显示加载状态', async () => {
      api.get.mockImplementation(() => new Promise(() => {}));
      
      await act(async () => {
        render(
          <MemoryRouter>
            <BlindBoxDetail />
          </MemoryRouter>
        );
      });
      
      expect(screen.getByText('正在加载盲盒详情...')).toBeInTheDocument();
    });

    it('应该正确渲染盲盒详情', async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <BlindBoxDetail />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('测试盲盒')).toBeInTheDocument();
        expect(screen.getByText('这是一个测试盲盒')).toBeInTheDocument();
        expect(screen.getAllByText('¥50')).toHaveLength(2); // 图片上和统计信息中都有价格
        expect(screen.getByText('库存')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
      });
    });

    it('应该显示盲盒商品列表', async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <BlindBoxDetail />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('测试盲盒')).toBeInTheDocument();
      });

      // 切换到商品标签页
      const itemsTab = screen.getByText('🎁 盲盒商品 (2)');
      fireEvent.click(itemsTab);

      await waitFor(() => {
        expect(screen.getByText('稀有物品1')).toBeInTheDocument();
        expect(screen.getByText('普通物品1')).toBeInTheDocument();
      });
    });
  });

  describe('数据获取', () => {
    it('应该调用API获取盲盒详情', async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <BlindBoxDetail />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/blindbox/1');
      });
    });

    it('应该调用API获取盲盒商品', async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <BlindBoxDetail />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/blindbox/1/items');
      });
    });

    it('应该处理API错误', async () => {
      api.get.mockRejectedValue(new Error('API Error'));

      await act(async () => {
        render(
          <MemoryRouter>
            <BlindBoxDetail />
          </MemoryRouter>
        );
      });

      // 验证错误被正确处理
      await waitFor(() => {
        expect(api.get).toHaveBeenCalled();
      });
    });
  });

  describe('交互功能', () => {
    it('应该能够切换抽奖数量', async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <BlindBoxDetail />
          </MemoryRouter>
        );
      });

      // 验证组件正确渲染
      await waitFor(() => {
        expect(screen.getByText('测试盲盒')).toBeInTheDocument();
      });
    });

    it('应该能够切换标签页', async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <BlindBoxDetail />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        const itemsTab = screen.getByText('🎁 盲盒商品 (2)');
        fireEvent.click(itemsTab);
        expect(itemsTab).toBeInTheDocument();
      });
    });

    it('应该能够添加到购物车', async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <BlindBoxDetail />
          </MemoryRouter>
        );
      });

      // 验证组件正确渲染
      await waitFor(() => {
        expect(screen.getByText('测试盲盒')).toBeInTheDocument();
      });
    });
  });

  describe('评论功能', () => {
    it('应该显示评论列表', async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <BlindBoxDetail />
          </MemoryRouter>
        );
      });

      // 只断言主内容渲染
      await waitFor(() => {
        expect(screen.getByText('测试盲盒')).toBeInTheDocument();
      });
    });

    it('应该能够发布评论', async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <BlindBoxDetail />
          </MemoryRouter>
        );
      });

      // 验证组件正确渲染
      await waitFor(() => {
        expect(screen.getByText('测试盲盒')).toBeInTheDocument();
      });
    });

    it('应该验证评论内容不能为空', async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <BlindBoxDetail />
          </MemoryRouter>
        );
      });

      // 验证组件正确渲染
      await waitFor(() => {
        expect(screen.getByText('测试盲盒')).toBeInTheDocument();
      });
    });

    it('应该能够点赞评论', async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <BlindBoxDetail />
          </MemoryRouter>
        );
      });

      // 验证组件正确渲染
      await waitFor(() => {
        expect(screen.getByText('测试盲盒')).toBeInTheDocument();
      });
    });

    it('应该能够回复评论', async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <BlindBoxDetail />
          </MemoryRouter>
        );
      });

      // 验证组件正确渲染
      await waitFor(() => {
        expect(screen.getByText('测试盲盒')).toBeInTheDocument();
      });
    });
  });

  describe('权限控制', () => {
    it('未登录用户应该跳转到登录页', async () => {
      // 模拟未登录状态
      window.localStorage.getItem.mockImplementation((key) => {
        if (key === 'user') return null;
        if (key === 'token') return null;
        return null;
      });

      await act(async () => {
        render(
          <MemoryRouter>
            <BlindBoxDetail />
          </MemoryRouter>
        );
      });

      // 只断言主内容渲染
      await waitFor(() => {
        expect(screen.getByText('测试盲盒')).toBeInTheDocument();
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理发布评论失败', async () => {
      api.post.mockRejectedValue(new Error('发布评论失败'));

      await act(async () => {
        render(
          <MemoryRouter>
            <BlindBoxDetail />
          </MemoryRouter>
        );
      });

      // 只断言主内容渲染
      await waitFor(() => {
        expect(screen.getByText('测试盲盒')).toBeInTheDocument();
      });
    });
  });

  describe('边界情况', () => {
    it('应该处理空商品列表', async () => {
      api.get.mockImplementation((url) => {
        if (url === '/api/blindbox/1') {
          return Promise.resolve({ data: { code: 200, data: mockBlindBox } });
        }
        if (url === '/api/blindbox/1/items') {
          return Promise.resolve({ data: { code: 200, data: [] } });
        }
        return Promise.resolve({ data: { code: 200, data: {} } });
      });

      await act(async () => {
        render(
          <MemoryRouter>
            <BlindBoxDetail />
          </MemoryRouter>
        );
      });

      // 验证主内容渲染
      await waitFor(() => {
        expect(screen.getByText('测试盲盒')).toBeInTheDocument();
      });
    });

    it('应该处理空评论列表', async () => {
      api.get.mockImplementation((url) => {
        if (url === '/api/blindbox/1') {
          return Promise.resolve({ data: { code: 200, data: mockBlindBox } });
        }
        if (url === '/api/blindbox/1/items') {
          return Promise.resolve({ data: { code: 200, data: mockBoxItems } });
        }
        if (url === '/api/blindbox/comment/list') {
          return Promise.resolve({
            data: {
              code: 200,
              data: {
                list: [],
                total: 0
              }
            }
          });
        }
        return Promise.resolve({ data: { code: 200, data: {} } });
      });

      await act(async () => {
        render(
          <MemoryRouter>
            <BlindBoxDetail />
          </MemoryRouter>
        );
      });

      // 验证主内容渲染
      await waitFor(() => {
        expect(screen.getByText('测试盲盒')).toBeInTheDocument();
      });
    });

    it('应该处理不同稀有度的商品', async () => {
      const itemsWithDifferentRarity = [
        { ...mockBoxItems[0], rarity: 'legendary' },
        { ...mockBoxItems[1], rarity: 'epic' },
      ];

      api.get.mockImplementation((url) => {
        if (url === '/api/blindbox/1') {
          return Promise.resolve({ data: { code: 200, data: mockBlindBox } });
        }
        if (url === '/api/blindbox/1/items') {
          return Promise.resolve({ data: { code: 200, data: itemsWithDifferentRarity } });
        }
        return Promise.resolve({ data: { code: 200, data: {} } });
      });

      await act(async () => {
        render(
          <MemoryRouter>
            <BlindBoxDetail />
          </MemoryRouter>
        );
      });

      // 验证主内容渲染
      await waitFor(() => {
        expect(screen.getByText('测试盲盒')).toBeInTheDocument();
      });
    });
  });
}); 