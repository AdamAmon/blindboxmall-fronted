import { render, screen } from '@testing-library/react';
import AdminDashboard from '../../../src/pages/admin/AdminDashboard';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

// 模拟 react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AdminDashboard', () => {
  it('页面渲染成功', () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );
    expect(screen.getByText(/管理员/)).toBeInTheDocument();
  });
}); 