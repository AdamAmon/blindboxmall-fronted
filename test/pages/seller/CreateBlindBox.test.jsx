import { render, screen } from '@testing-library/react';
import CreateBlindBox from '../../../src/pages/seller/CreateBlindBox';
import { MemoryRouter } from 'react-router-dom';

describe('CreateBlindBox', () => {
  it('页面渲染成功', () => {
    render(
      <MemoryRouter>
        <CreateBlindBox />
      </MemoryRouter>
    );
    expect(screen.getByText('创建新盲盒')).toBeInTheDocument();
  });
}); 