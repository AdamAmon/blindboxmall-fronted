import { render, screen, act } from '@testing-library/react';
import BlindBoxDetail from '../../../src/pages/blindbox/BlindBoxDetail';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import api from '../../../src/utils/axios';

// 模拟 react-router-dom 的 useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
  };
});

// 模拟 react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// 模拟 axios
vi.mock('../../../src/utils/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('BlindBoxDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('页面渲染成功', async () => {
    // 模拟一个永不解析的 Promise 来保持加载状态
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
}); 