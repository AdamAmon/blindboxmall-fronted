import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ManageBoxItems from '../../../src/pages/seller/ManageBoxItems';
import { vi } from 'vitest';
import api from '../../../src/utils/axios';

// 模拟 axios
vi.mock('../../../src/utils/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('ManageBoxItems', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 模拟 API 响应
    api.get.mockResolvedValue({
      data: {
        code: 200,
        data: {
          list: [
            { id: 1, name: '测试商品1', rarity: '普通', price: 29.99 },
            { id: 2, name: '测试商品2', rarity: '稀有', price: 39.99 },
          ],
          total: 2,
        },
      },
    });
  });

  it('页面渲染成功', async () => {
    // 模拟一个永不解析的 Promise 来保持加载状态
    api.get.mockImplementation(() => new Promise(() => {}));
    
    await act(async () => {
      render(
        <MemoryRouter>
          <ManageBoxItems />
        </MemoryRouter>
      );
    });
    expect(screen.getByText('正在加载商品数据...')).toBeInTheDocument();
  });
}); 