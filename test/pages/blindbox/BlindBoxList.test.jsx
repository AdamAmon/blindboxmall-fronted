import { render, screen } from '@testing-library/react';
import BlindBoxList from '../../../src/pages/blindbox/BlindBoxList';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

// 模拟 react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('BlindBoxList', () => {
  it('页面渲染成功', () => {
    render(
      <MemoryRouter>
        <BlindBoxList />
      </MemoryRouter>
    );
    expect(screen.getByText('正在加载盲盒...')).toBeInTheDocument();
  });
}); 