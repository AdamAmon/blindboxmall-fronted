import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';

// 先进行模块 mock（hoisted）
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../../../src/utils/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import CreateBoxItem from '../../../src/pages/seller/CreateBoxItem';
import api from '../../../src/utils/axios';
import * as rrd from 'react-router-dom';
import { toast } from 'react-toastify';

describe('CreateBoxItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key) => (key === 'token' ? 'fake-token' : null)),
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
    // 模拟一个永不解析的 Promise 来保持加载状态
    api.get.mockImplementation(() => new Promise(() => {}));

    await act(async () => {
      render(
        <MemoryRouter>
          <CreateBoxItem />
        </MemoryRouter>
      );
    });
    // 页面标题
    expect(screen.getByText('添加盲盒商品')).toBeInTheDocument();
  });

  it('提交空表单显示校验错误', async () => {
    // mock 列表返回空
    api.get.mockResolvedValue({ data: { code: 200, data: { list: [] } } });

    render(
      <MemoryRouter>
        <CreateBoxItem />
      </MemoryRouter>
    );

    // 等待初次加载完成（出现“选择盲盒”下拉）
    await screen.findByText('选择盲盒');

    fireEvent.click(screen.getByText('添加商品'));

    expect(await screen.findByText('请选择盲盒')).toBeInTheDocument();
    expect(screen.getByText('商品名称不能为空')).toBeInTheDocument();
    expect(screen.getByText('商品图片URL不能为空')).toBeInTheDocument();
    expect(screen.getByText('请输入有效的概率 (0-1之间)')).toBeInTheDocument();
  });

  it('点击取消确认后导航到 /seller', async () => {
    const navigateMock = vi.fn();
    vi.spyOn(rrd, 'useNavigate').mockReturnValue(navigateMock);

    api.get.mockResolvedValue({ data: { code: 200, data: { list: [] } } });

    render(
      <MemoryRouter>
        <CreateBoxItem />
      </MemoryRouter>
    );

    await screen.findByText('添加盲盒商品');

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    fireEvent.click(screen.getByText('取消'));

    expect(navigateMock).toHaveBeenCalledWith('/seller');
  });

  it('有效提交调用创建接口', async () => {
    api.get.mockResolvedValue({
      data: {
        code: 200,
        data: {
          list: [
            { id: 1, name: '测试盲盒1', price: 29.99 },
            { id: 2, name: '测试盲盒2', price: 39.99 },
          ],
        },
      },
    });
    api.post.mockResolvedValue({ data: { code: 200 } });

    render(
      <MemoryRouter>
        <CreateBoxItem />
      </MemoryRouter>
    );

    await screen.findByText('添加盲盒商品');

    // 选择盲盒（第一个下拉框为盲盒选择）
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '1' } });

    // 填写表单
    fireEvent.change(screen.getByPlaceholderText('请输入商品名称，如：星空手办、海洋徽章...'), { target: { value: '物品A' } });
    fireEvent.change(screen.getByPlaceholderText('https://example.com/item.jpg'), { target: { value: 'https://x.png' } });
    fireEvent.change(screen.getByPlaceholderText('0.1'), { target: { value: '0.2' } });

    // 提交
    fireEvent.click(screen.getByText('添加商品'));

    await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));
    expect(api.post.mock.calls[0][0]).toBe('/api/blindbox/items');
    expect(toast.success).toHaveBeenCalled();
  });
}); 