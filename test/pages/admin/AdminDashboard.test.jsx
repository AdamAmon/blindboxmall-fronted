import { render, screen } from '@testing-library/react';
import AdminDashboard from '../../../src/pages/admin/AdminDashboard';
import { MemoryRouter } from 'react-router-dom';

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