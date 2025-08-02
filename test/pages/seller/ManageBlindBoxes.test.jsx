import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ManageBlindBoxes from '../../../src/pages/seller/ManageBlindBoxes';
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

describe('ManageBlindBoxes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 模拟 API 响应
    api.get.mockResolvedValue({
      data: {
        code: 200,
        data: {
          list: [
            { id: 1, name: '测试盲盒1', price: 29.99, status: 1 },
            { id: 2, name: '测试盲盒2', price: 39.99, status: 0 },
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
          <ManageBlindBoxes />
        </MemoryRouter>
      );
    });
    expect(screen.getByText('正在加载盲盒数据...')).toBeInTheDocument();
  });
}); 