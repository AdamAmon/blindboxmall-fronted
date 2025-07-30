import { render, screen } from '@testing-library/react';
import BlindBoxDetail from '../../../src/pages/blindbox/BlindBoxDetail';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

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

describe('BlindBoxDetail', () => {
  it('页面渲染成功', () => {
    render(
      <MemoryRouter>
        <BlindBoxDetail />
      </MemoryRouter>
    );
    expect(screen.getByText('正在加载盲盒详情...')).toBeInTheDocument();
  });
}); 