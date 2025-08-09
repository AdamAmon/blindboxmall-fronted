import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ManageBoxItems from '../../../src/pages/seller/ManageBoxItems';
import api from '../../../src/utils/axios';

// mock useParams，提供 blindBoxId
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ blindBoxId: '1' }),
  };
});

// 模拟 axios
vi.mock('../../../src/utils/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// mock toast
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ManageBoxItems', () => {
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
    api.get.mockImplementation(() => new Promise(() => {}));

    await act(async () => {
      render(
        <MemoryRouter>
          <ManageBoxItems />
        </MemoryRouter>
      );
    });
    expect(screen.getByText('正在加载商品数据...')).toBeInTheDocument();
  });

  it('删除时确认后调用删除接口', async () => {
    api.get
      .mockResolvedValueOnce({ data: { code: 200, data: { id: 1, name: '盲盒A', description: 'desc', price: 10, stock: 2, status: 1, cover_image: 'a.png' } } })
      .mockResolvedValueOnce({ data: { code: 200, data: [
        { id: 31, name: '待删除', image: 'i.png', rarity: 1, probability: 0.1 },
      ] } });

    api.delete.mockResolvedValue({ data: { code: 200 } });
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <MemoryRouter>
        <ManageBoxItems />
      </MemoryRouter>
    );

    await screen.findByText('待删除');

    fireEvent.click(screen.getByText('删除'));
    await waitFor(() => expect(api.delete).toHaveBeenCalledTimes(1));
    expect(api.delete.mock.calls[0][0]).toBe('/api/blindbox/items/31');
  });

  it('筛选关键字与稀有度后仍能显示过滤结果', async () => {
    api.get
      .mockResolvedValueOnce({ data: { code: 200, data: { id: 1, name: '盲盒A', description: 'desc', price: 10, stock: 2, status: 1, cover_image: 'a.png' } } })
      .mockResolvedValueOnce({ data: { code: 200, data: [
        { id: 41, name: '星空徽章', image: 'i.png', rarity: 2, probability: 0.2 },
        { id: 42, name: '海洋贴纸', image: 'i.png', rarity: 1, probability: 0.8 },
      ] } });

    render(
      <MemoryRouter>
        <ManageBoxItems />
      </MemoryRouter>
    );

    await screen.findByText('星空徽章');

    const keyword = screen.getByPlaceholderText('搜索商品名称...');
    fireEvent.change(keyword, { target: { value: '星空' } });

    const sortSelect = screen.getByDisplayValue('⭐ 稀有度');
    fireEvent.change(sortSelect, { target: { value: 'name' } });

    const orderSelect = screen.getByDisplayValue('⬆️ 升序');
    fireEvent.change(orderSelect, { target: { value: 'asc' } });

    await waitFor(() => expect(screen.getByText('星空徽章')).toBeInTheDocument());
  });
}); 