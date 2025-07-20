import { render, screen } from '@testing-library/react';
import ManageBoxItems from '../../../src/pages/seller/ManageBoxItems';
import { MemoryRouter } from 'react-router-dom';

describe('ManageBoxItems', () => {
  it('页面渲染成功', () => {
    render(
      <MemoryRouter>
        <ManageBoxItems />
      </MemoryRouter>
    );
    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });
}); 