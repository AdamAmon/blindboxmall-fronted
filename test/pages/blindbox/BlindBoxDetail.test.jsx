import { render, screen } from '@testing-library/react';
import BlindBoxDetail from '../../../src/pages/blindbox/BlindBoxDetail';
import { MemoryRouter } from 'react-router-dom';

describe('BlindBoxDetail', () => {
  it('页面渲染成功', () => {
    render(
      <MemoryRouter>
        <BlindBoxDetail />
      </MemoryRouter>
    );
    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });
}); 