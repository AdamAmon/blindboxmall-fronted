import { render, screen, act } from '@testing-library/react';
import SellerDashboard from '../../../src/pages/seller/SellerDashboard';
import { MemoryRouter } from 'react-router-dom';

describe('SellerDashboard', () => {
  it('页面渲染成功', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <SellerDashboard />
        </MemoryRouter>
      );
    });
    expect(screen.getByText('无权限访问')).toBeInTheDocument();
  });
}); 