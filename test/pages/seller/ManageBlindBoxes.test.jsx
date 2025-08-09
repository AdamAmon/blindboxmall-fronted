import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ManageBlindBoxes from '../../../src/pages/seller/ManageBlindBoxes';
import api from '../../../src/utils/axios';

// 捕获导航
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// 模拟 axios（保持与项目风格一致）
vi.mock('../../../src/utils/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// mock toast，避免真实弹窗
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ManageBlindBoxes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();

    // 本测试内配置 localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key) => {
          if (key === 'user') return JSON.stringify({ id: 1 });
          if (key === 'token') return 'fake-token';
          return null;
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('页面渲染成功（加载态）', async () => {
    api.get.mockImplementation(() => new Promise(() => {}));

    await act(async () => {
      render(
        <MemoryRouter>
          <ManageBlindBoxes />
        </MemoryRouter>
      );
    });

    expect(screen.getByText('正在加载盲盒数据...')).toBeInTheDocument();
  });

  it('加载并显示列表，点击编辑打开弹窗并保存', async () => {
    const list = [
      { id: 1, name: '测试盲盒1', description: 'desc1', price: 29.99, stock: 10, status: 1, cover_image: 'x1.png' },
      { id: 2, name: '测试盲盒2', description: 'desc2', price: 39.99, stock: 0, status: 0, cover_image: 'x2.png' },
    ];
    api.get.mockResolvedValueOnce({ data: { code: 200, data: { list, totalPages: 1 } } });
    api.put.mockResolvedValue({ data: { code: 200 } });

    render(
      <MemoryRouter>
        <ManageBlindBoxes />
      </MemoryRouter>
    );

    // 等待列表渲染
    await screen.findByText('测试盲盒1');
    expect(screen.getByText('测试盲盒2')).toBeInTheDocument();

    // 点击编辑
    fireEvent.click(screen.getAllByText('编辑')[0]);
    expect(screen.getByText('编辑盲盒')).toBeInTheDocument();

    // 点击保存
    fireEvent.click(screen.getByText('保存'));
    await waitFor(() => expect(api.put).toHaveBeenCalledTimes(1));
    expect(api.put.mock.calls[0][0]).toBe('/api/blindbox/1');
  });

  it('点击删除确认后调用删除接口', async () => {
    const list = [
      { id: 1, name: '测试盲盒1', description: 'desc1', price: 29.99, stock: 10, status: 1, cover_image: 'x1.png' },
    ];
    api.get.mockResolvedValueOnce({ data: { code: 200, data: { list, totalPages: 1 } } });
    api.delete.mockResolvedValue({ data: { code: 200 } });

    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <MemoryRouter>
        <ManageBlindBoxes />
      </MemoryRouter>
    );

    await screen.findByText('测试盲盒1');

    fireEvent.click(screen.getByText('删除'));
    await waitFor(() => expect(api.delete).toHaveBeenCalledTimes(1));
    expect(api.delete.mock.calls[0][0]).toBe('/api/blindbox/1');
  });

  it('提交搜索触发重新请求', async () => {
    const list = [
      { id: 1, name: '测试盲盒1', description: 'desc1', price: 29.99, stock: 10, status: 1, cover_image: 'x1.png' },
    ];
    api.get.mockResolvedValue({ data: { code: 200, data: { list, totalPages: 1 } } });

    render(
      <MemoryRouter>
        <ManageBlindBoxes />
      </MemoryRouter>
    );

    await screen.findByText('测试盲盒1');

    const input = screen.getByPlaceholderText('搜索盲盒名称...');
    fireEvent.change(input, { target: { value: '关键字' } });

    const submitBtn = screen.getByText('立即搜索');
    fireEvent.click(submitBtn);

    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));
  });
}); 