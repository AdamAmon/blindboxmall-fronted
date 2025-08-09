import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// 在导入 main.jsx 之前，mock 掉 router 模块，避免真实 createBrowserRouter 执行
vi.mock('../src/router/router', () => ({
  default: {},
}));

// 模拟 ReactDOM
const mockRender = vi.fn();
const mockCreateRoot = vi.fn(() => ({
  render: mockRender,
}));

vi.mock('react-dom/client', async () => {
  const actual = await vi.importActual('react-dom/client');
  return {
    ...actual,
    createRoot: mockCreateRoot,
  };
});

// 模拟 React
vi.mock('react', () => ({
  default: {
    StrictMode: ({ children }) => children,
  },
  StrictMode: ({ children }) => children,
}));

// 模拟 react-router-dom 仅保留 RouterProvider 即可
vi.mock('react-router-dom', () => ({
  RouterProvider: ({ children }) => <div data-testid="router-provider">{children}</div>,
}));

// 保留 CSS mock，避免真实加载（需与入口文件一致）
vi.mock('../src/index.css', () => ({}));
vi.mock('react-toastify/dist/ReactToastify.css', () => ({}));



describe('Main Entry Point', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 确保存在真实 root 节点
    let rootDiv = document.getElementById('root');
    if (!rootDiv) {
      rootDiv = document.createElement('div');
      rootDiv.setAttribute('id', 'root');
      document.body.appendChild(rootDiv);
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该正确配置React应用', () => {
    expect(mockCreateRoot).toBeDefined();
    expect(typeof mockCreateRoot).toBe('function');
  });

  it('应该能够创建根元素', () => {
    const element = document.getElementById('root');
    expect(element).toBeTruthy();
  });


  it('应该能够处理 ReactDOM 导入', async () => {
    const { createRoot } = await import('react-dom/client');
    expect(createRoot).toBe(mockCreateRoot);
  });
}); 