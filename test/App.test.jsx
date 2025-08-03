import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// 模拟 react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Outlet</div>,
  };
});

// 模拟 Navbar 组件
vi.mock('./src/components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

describe('App Component', () => {
  it('应该正确渲染应用结构', async () => {
    const App = (await import('../src/App')).default;
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('应该包含主要布局元素', async () => {
    const App = (await import('../src/App')).default;
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // 检查是否有主要的容器元素
    const container = screen.getByTestId('outlet').parentElement;
    expect(container).toBeInTheDocument();
  });

  it('应该正确导入App组件', async () => {
    const App = await import('../src/App');
    expect(App.default).toBeDefined();
    expect(typeof App.default).toBe('function');
  });
}); 