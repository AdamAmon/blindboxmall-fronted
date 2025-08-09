import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';

// 先 hoist mocks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../../../src/utils/axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import CreateBlindBox from '../../../src/pages/seller/CreateBlindBox';
import api from '../../../src/utils/axios';
import { toast } from 'react-toastify';

// 获取 navigate mock 的引用
import * as rrd from 'react-router-dom';

describe('CreateBlindBox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('页面渲染成功', () => {
    render(
      <MemoryRouter>
        <CreateBlindBox />
      </MemoryRouter>
    );
    expect(screen.getByText('创建新盲盒')).toBeInTheDocument();
  });

  it('提交空表单显示校验错误', async () => {
    render(
      <MemoryRouter>
        <CreateBlindBox />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('创建盲盒'));

    expect(await screen.findByText('盲盒名称不能为空')).toBeInTheDocument();
    expect(screen.getByText('盲盒描述不能为空')).toBeInTheDocument();
    expect(screen.getByText('请输入有效的价格')).toBeInTheDocument();
    expect(screen.getByText('封面图片URL不能为空')).toBeInTheDocument();
    expect(screen.getByText('请输入有效的库存数量')).toBeInTheDocument();
  });

  it('无用户信息时提示错误', async () => {
    // 覆盖 localStorage，返回无 user
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'user') return null;
      if (key === 'token') return 'fake-token';
      return null;
    });

    render(
      <MemoryRouter>
        <CreateBlindBox />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('请输入盲盒名称，如：星空系列、海洋奇遇...'), { target: { value: '盒子' } });
    fireEvent.change(screen.getByPlaceholderText('详细描述盲盒的内容、特色和亮点，吸引顾客购买...'), { target: { value: '描述' } });
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '10.5' } });
    fireEvent.change(screen.getByPlaceholderText('https://example.com/image.jpg'), { target: { value: 'https://x.png' } });
    fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '5' } });

    fireEvent.click(screen.getByText('创建盲盒'));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });

  it('点击取消确认后导航到 /seller', () => {
    const navigateSpy = vi.spyOn(rrd, 'useNavigate').mockReturnValue(vi.fn());
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <MemoryRouter>
        <CreateBlindBox />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('取消'));
    expect(navigateSpy().mock.calls[0][0]).toBe('/seller');
  });

  it('有效提交调用创建接口并跳转', async () => {
    const navigateMock = vi.fn();
    vi.spyOn(rrd, 'useNavigate').mockReturnValue(navigateMock);

    api.post.mockResolvedValue({ data: { code: 200 } });

    render(
      <MemoryRouter>
        <CreateBlindBox />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('请输入盲盒名称，如：星空系列、海洋奇遇...'), { target: { value: '盒子' } });
    fireEvent.change(screen.getByPlaceholderText('详细描述盲盒的内容、特色和亮点，吸引顾客购买...'), { target: { value: '描述' } });
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '10.5' } });
    fireEvent.change(screen.getByPlaceholderText('https://example.com/image.jpg'), { target: { value: 'https://x.png' } });
    fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '5' } });

    fireEvent.click(screen.getByText('创建盲盒'));

    await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));
    expect(navigateMock).toHaveBeenCalledWith('/seller/blindbox/manage');
    expect(toast.success).toHaveBeenCalled();
  });
}); 