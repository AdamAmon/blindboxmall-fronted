import { render, screen } from '@testing-library/react';
import SellerDashboard from '../../../src/pages/seller/SellerDashboard';
import { MemoryRouter } from 'react-router-dom';

describe('SellerDashboard', () => {
  it('页面渲染成功', () => {
    render(
      <MemoryRouter>
        <SellerDashboard />
      </MemoryRouter>
    );
    expect(screen.getByText('无权限访问')).toBeInTheDocument();
  });
}); 