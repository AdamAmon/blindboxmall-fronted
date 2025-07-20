import { render, screen } from '@testing-library/react';
import CreateBoxItem from '../../../src/pages/seller/CreateBoxItem';
import { MemoryRouter } from 'react-router-dom';

describe('CreateBoxItem', () => {
  it('页面渲染成功', () => {
    render(
      <MemoryRouter>
        <CreateBoxItem />
      </MemoryRouter>
    );
    expect(screen.getByText('添加盲盒商品')).toBeInTheDocument();
  });
}); 