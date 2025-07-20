import { render, screen } from '@testing-library/react';
import ManageBlindBoxes from '../../../src/pages/seller/ManageBlindBoxes';
import { MemoryRouter } from 'react-router-dom';

describe('ManageBlindBoxes', () => {
  it('页面渲染成功', () => {
    render(
      <MemoryRouter>
        <ManageBlindBoxes />
      </MemoryRouter>
    );
    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });
}); 