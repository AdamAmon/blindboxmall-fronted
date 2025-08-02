import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import AddressManageModal from '../../src/components/AddressManageModal';

// 模拟 API
vi.mock('../../src/utils/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// 模拟 window.confirm
const mockConfirm = vi.fn();
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true,
});

describe('AddressManageModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSelectDefault = vi.fn();
  const mockUserId = 1;

  const mockAddresses = [
    {
      id: 1,
      recipient: '张三',
      phone: '13800138000',
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      detail: '科技园路1号',
      is_default: true,
    },
    {
      id: 2,
      recipient: '李四',
      phone: '13900139000',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail: '建国路2号',
      is_default: false,
    },
  ];

  // 获取 mock API 实例
  let mockApi;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // 动态获取 mock API
    const axiosModule = await import('../../src/utils/axios');
    mockApi = axiosModule.default;
    
    mockApi.get.mockResolvedValue({ data: { data: mockAddresses } });
    mockApi.post.mockResolvedValue({ data: { code: 200 } });
    mockConfirm.mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('模态框显示/隐藏', () => {
    it('当open为false时不应该渲染', () => {
      const { container } = render(
        <AddressManageModal 
          open={false} 
          userId={mockUserId} 
          onClose={mockOnClose} 
          onSelectDefault={mockOnSelectDefault} 
        />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('当open为true时应该渲染模态框', async () => {
      render(
        <AddressManageModal 
          open={true} 
          userId={mockUserId} 
          onClose={mockOnClose} 
          onSelectDefault={mockOnSelectDefault} 
        />
      );
      
      expect(screen.getByText('地址管理')).toBeInTheDocument();
      expect(screen.getByText('我的地址')).toBeInTheDocument();
      
      // 等待API调用完成
      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/api/address/list', { params: { userId: mockUserId } });
      });
    });

    it('点击关闭按钮应该调用onClose', async () => {
      await act(async () => {
        render(
          <AddressManageModal 
            open={true} 
            userId={mockUserId} 
            onClose={mockOnClose} 
            onSelectDefault={mockOnSelectDefault} 
          />
        );
      });
      
      const closeButton = screen.getByRole('button', { name: '' }); // 关闭按钮
      await act(async () => {
        fireEvent.click(closeButton);
      });
      
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('地址列表管理', () => {
    it('应该显示地址列表', async () => {
      render(
        <AddressManageModal 
          open={true} 
          userId={mockUserId} 
          onClose={mockOnClose} 
          onSelectDefault={mockOnSelectDefault} 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('张三')).toBeInTheDocument();
        expect(screen.getByText('李四')).toBeInTheDocument();
        expect(screen.getByText('13800138000')).toBeInTheDocument();
        expect(screen.getByText('13900139000')).toBeInTheDocument();
      });
    });

    it('应该显示默认地址标识', async () => {
      render(
        <AddressManageModal 
          open={true} 
          userId={mockUserId} 
          onClose={mockOnClose} 
          onSelectDefault={mockOnSelectDefault} 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('默认')).toBeInTheDocument();
      });
    });

    it('应该显示空状态当没有地址时', async () => {
      mockApi.get.mockResolvedValue({ data: { data: [] } });
      
      render(
        <AddressManageModal 
          open={true} 
          userId={mockUserId} 
          onClose={mockOnClose} 
          onSelectDefault={mockOnSelectDefault} 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('暂无地址')).toBeInTheDocument();
        expect(screen.getByText('点击上方按钮添加新地址')).toBeInTheDocument();
      });
    });

    it('应该显示加载状态', () => {
      mockApi.get.mockImplementation(() => new Promise(() => {})); // 永不解析的Promise
      
      render(
        <AddressManageModal 
          open={true} 
          userId={mockUserId} 
          onClose={mockOnClose} 
          onSelectDefault={mockOnSelectDefault} 
        />
      );
      
      expect(screen.getByText('加载中...')).toBeInTheDocument();
    });

    it('应该显示错误状态', async () => {
      mockApi.get.mockRejectedValue(new Error('网络错误'));
      
      render(
        <AddressManageModal 
          open={true} 
          userId={mockUserId} 
          onClose={mockOnClose} 
          onSelectDefault={mockOnSelectDefault} 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('获取地址失败')).toBeInTheDocument();
      });
    });
  });

  describe('地址操作', () => {
    it('点击设为默认应该调用API', async () => {
      await act(async () => {
        render(
          <AddressManageModal 
            open={true} 
            userId={mockUserId} 
            onClose={mockOnClose} 
            onSelectDefault={mockOnSelectDefault} 
          />
        );
      });
      
      await waitFor(() => {
        const setDefaultButtons = screen.getAllByText('设为默认');
        fireEvent.click(setDefaultButtons[0]);
      });
      
      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith('/api/address/set_default?userId=1', { id: 2 });
        expect(mockOnSelectDefault).toHaveBeenCalled();
      });
    });

    it('点击编辑应该切换到编辑模式', async () => {
      await act(async () => {
        render(
          <AddressManageModal 
            open={true} 
            userId={mockUserId} 
            onClose={mockOnClose} 
            onSelectDefault={mockOnSelectDefault} 
          />
        );
      });
      
      await waitFor(() => {
        const editButtons = screen.getAllByText('编辑');
        fireEvent.click(editButtons[0]);
      });
      
      expect(screen.getByText('编辑地址')).toBeInTheDocument();
    });

    it('点击删除应该调用确认对话框和API', async () => {
      await act(async () => {
        render(
          <AddressManageModal 
            open={true} 
            userId={mockUserId} 
            onClose={mockOnClose} 
            onSelectDefault={mockOnSelectDefault} 
          />
        );
      });
      
      await waitFor(() => {
        const deleteButtons = screen.getAllByText('删除');
        fireEvent.click(deleteButtons[0]);
      });
      
      expect(mockConfirm).toHaveBeenCalledWith('确定删除该地址吗？');
      
      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith('/api/address/delete?userId=1', { id: 1 });
      });
    });

    it('删除时用户取消应该不调用API', async () => {
      mockConfirm.mockReturnValue(false);
      
      render(
        <AddressManageModal 
          open={true} 
          userId={mockUserId} 
          onClose={mockOnClose} 
          onSelectDefault={mockOnSelectDefault} 
        />
      );
      
      await waitFor(() => {
        const deleteButtons = screen.getAllByText('删除');
        fireEvent.click(deleteButtons[0]);
      });
      
      expect(mockConfirm).toHaveBeenCalled();
      expect(mockApi.post).not.toHaveBeenCalled();
    });
  });

  describe('新增地址', () => {
    it('点击新增地址应该切换到新增模式', async () => {
      render(
        <AddressManageModal 
          open={true} 
          userId={mockUserId} 
          onClose={mockOnClose} 
          onSelectDefault={mockOnSelectDefault} 
        />
      );
      
      await waitFor(() => {
        const addButton = screen.getByRole('button', { name: /新增地址/ });
        fireEvent.click(addButton);
      });
      
      // 使用更精确的选择器，避免多个"新增地址"元素的冲突
      expect(screen.getByPlaceholderText('请输入收件人姓名')).toBeInTheDocument();
      expect(screen.getByText('添加地址')).toBeInTheDocument();
    });

    it('新增地址表单应该正确提交', async () => {
      render(
        <AddressManageModal 
          open={true} 
          userId={mockUserId} 
          onClose={mockOnClose} 
          onSelectDefault={mockOnSelectDefault} 
        />
      );
      
      await waitFor(() => {
        const addButton = screen.getByRole('button', { name: /新增地址/ });
        fireEvent.click(addButton);
      });
      
      // 填写表单
      fireEvent.change(screen.getByPlaceholderText('请输入收件人姓名'), { target: { value: '王五' } });
      fireEvent.change(screen.getByPlaceholderText('请输入手机号'), { target: { value: '13700137000' } });
      fireEvent.change(screen.getByPlaceholderText('省'), { target: { value: '上海市' } });
      fireEvent.change(screen.getByPlaceholderText('市'), { target: { value: '上海市' } });
      fireEvent.change(screen.getByPlaceholderText('区'), { target: { value: '浦东新区' } });
      fireEvent.change(screen.getByPlaceholderText('请输入详细地址'), { target: { value: '陆家嘴路3号' } });
      
      // 提交表单
      const submitButton = screen.getByText('添加地址');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith('/api/address/create?userId=1', {
          recipient: '王五',
          phone: '13700137000',
          province: '上海市',
          city: '上海市',
          district: '浦东新区',
          detail: '陆家嘴路3号',
          is_default: false,
        });
      });
    });

    it('新增地址时设为默认应该正确提交', async () => {
      render(
        <AddressManageModal 
          open={true} 
          userId={mockUserId} 
          onClose={mockOnClose} 
          onSelectDefault={mockOnSelectDefault} 
        />
      );
      
      await waitFor(() => {
        const addButton = screen.getByRole('button', { name: /新增地址/ });
        fireEvent.click(addButton);
      });
      
      // 勾选设为默认
      const defaultCheckbox = screen.getByLabelText('设为默认地址');
      fireEvent.click(defaultCheckbox);
      
      // 填写必要信息
      fireEvent.change(screen.getByPlaceholderText('请输入收件人姓名'), { target: { value: '王五' } });
      fireEvent.change(screen.getByPlaceholderText('请输入手机号'), { target: { value: '13700137000' } });
      fireEvent.change(screen.getByPlaceholderText('省'), { target: { value: '上海市' } });
      fireEvent.change(screen.getByPlaceholderText('市'), { target: { value: '上海市' } });
      fireEvent.change(screen.getByPlaceholderText('区'), { target: { value: '浦东新区' } });
      fireEvent.change(screen.getByPlaceholderText('请输入详细地址'), { target: { value: '陆家嘴路3号' } });
      
      // 提交表单
      const submitButton = screen.getByText('添加地址');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith('/api/address/create?userId=1', {
          recipient: '王五',
          phone: '13700137000',
          province: '上海市',
          city: '上海市',
          district: '浦东新区',
          detail: '陆家嘴路3号',
          is_default: true,
        });
      });
    });
  });

  describe('表单验证', () => {
    it('提交空表单应该不调用API', async () => {
      render(
        <AddressManageModal 
          open={true} 
          userId={mockUserId} 
          onClose={mockOnClose} 
          onSelectDefault={mockOnSelectDefault} 
        />
      );
      
      await waitFor(() => {
        const addButton = screen.getByRole('button', { name: /新增地址/ });
        fireEvent.click(addButton);
      });
      
      // 直接提交空表单
      const submitButton = screen.getByText('添加地址');
      fireEvent.click(submitButton);
      
      // 由于HTML5验证，表单不会提交
      expect(mockApi.post).not.toHaveBeenCalled();
    });

    it('表单字段应该正确设置required属性', async () => {
      render(
        <AddressManageModal 
          open={true} 
          userId={mockUserId} 
          onClose={mockOnClose} 
          onSelectDefault={mockOnSelectDefault} 
        />
      );
      
      await waitFor(() => {
        const addButton = screen.getByRole('button', { name: /新增地址/ });
        fireEvent.click(addButton);
      });
      
      const recipientInput = screen.getByPlaceholderText('请输入收件人姓名');
      const phoneInput = screen.getByPlaceholderText('请输入手机号');
      const provinceInput = screen.getByPlaceholderText('省');
      const cityInput = screen.getByPlaceholderText('市');
      const districtInput = screen.getByPlaceholderText('区');
      const detailInput = screen.getByPlaceholderText('请输入详细地址');
      
      expect(recipientInput).toHaveAttribute('required');
      expect(phoneInput).toHaveAttribute('required');
      expect(provinceInput).toHaveAttribute('required');
      expect(cityInput).toHaveAttribute('required');
      expect(districtInput).toHaveAttribute('required');
      expect(detailInput).toHaveAttribute('required');
    });
  });

  describe('组件状态管理', () => {
    it('模态框重新打开时应该重新获取数据', async () => {
      const { rerender } = render(
        <AddressManageModal 
          open={false} 
          userId={mockUserId} 
          onClose={mockOnClose} 
          onSelectDefault={mockOnSelectDefault} 
        />
      );
      
      // 初始状态不调用API
      expect(mockApi.get).not.toHaveBeenCalled();
      
      // 重新渲染为打开状态
      rerender(
        <AddressManageModal 
          open={true} 
          userId={mockUserId} 
          onClose={mockOnClose} 
          onSelectDefault={mockOnSelectDefault} 
        />
      );
      
      // 应该调用API获取数据
      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/api/address/list', { params: { userId: mockUserId } });
      });
    });
  });
}); 