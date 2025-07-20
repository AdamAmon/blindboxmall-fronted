import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../../src/components/ErrorBoundary';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useRouteError: () => ({ status: 404 })
  };
});

describe('ErrorBoundary', () => {
  it('渲染404错误信息', () => {
    render(
      <MemoryRouter>
        <ErrorBoundary />
      </MemoryRouter>
    );
    expect(screen.getByText(/页面未找到/)).toBeInTheDocument();
  });
}); 