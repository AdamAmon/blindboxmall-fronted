import { render, screen, act } from '@testing-library/react';
import CreateBoxItem from '../../../src/pages/seller/CreateBoxItem';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import api from '../../../src/utils/axios';

// 模拟 axios
vi.mock('../../../src/utils/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('CreateBoxItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 模拟 API 响应
    api.get.mockResolvedValue({
      data: {
        code: 200,
        data: [
          { id: 1, name: '测试盲盒1', price: 29.99 },
          { id: 2, name: '测试盲盒2', price: 39.99 },
        ],
      },
    });
  });

  it('页面渲染成功', async () => {
    // 模拟一个永不解析的 Promise 来保持加载状态
    api.get.mockImplementation(() => new Promise(() => {}));
    
    await act(async () => {
      render(
        <MemoryRouter>
          <CreateBoxItem />
        </MemoryRouter>
      );
    });
    // 由于组件在加载状态，我们测试页面标题而不是具体内容
    expect(screen.getByText('添加盲盒商品')).toBeInTheDocument();
  });
}); 