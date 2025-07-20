import { render, screen } from '@testing-library/react';
import BlindBoxList from '../../../src/pages/blindbox/BlindBoxList';
import { MemoryRouter } from 'react-router-dom';

describe('BlindBoxList', () => {
  it('页面渲染成功', () => {
    render(
      <MemoryRouter>
        <BlindBoxList />
      </MemoryRouter>
    );
    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });
}); 