import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RechargeModal from '../../src/components/RechargeModal';

describe('RechargeModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnRecharge = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('模态框显示/隐藏', () => {
    it('当open为false时不应该渲染', () => {
      render(<RechargeModal open={false} onClose={mockOnClose} onRecharge={mockOnRecharge} />);
      
      expect(screen.queryByText('余额充值')).not.toBeInTheDocument();
    });

    it('当open为true时应该渲染模态框', () => {
      render(<RechargeModal open={true} onClose={mockOnClose} onRecharge={mockOnRecharge} />);
      
      expect(screen.getByText('余额充值')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('请输入充值金额')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '立即充值' })).toBeInTheDocument();
    });
  });

  describe('表单交互', () => {
    it('应该更新充值金额输入', () => {
      render(<RechargeModal open={true} onClose={mockOnClose} onRecharge={mockOnRecharge} />);
      
      const amountInput = screen.getByPlaceholderText('请输入充值金额');
      fireEvent.change(amountInput, { target: { value: '100.50' } });
      
      expect(amountInput.value).toBe('100.50');
    });

    it('应该处理表单提交', async () => {
      mockOnRecharge.mockResolvedValue();
      
      render(<RechargeModal open={true} onClose={mockOnClose} onRecharge={mockOnRecharge} />);
      
      const amountInput = screen.getByPlaceholderText('请输入充值金额');
      const submitButton = screen.getByRole('button', { name: '立即充值' });
      
      fireEvent.change(amountInput, { target: { value: '50.00' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnRecharge).toHaveBeenCalledWith(50.00);
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('表单验证', () => {
    it('应该验证无效的充值金额', async () => {
      render(<RechargeModal open={true} onClose={mockOnClose} onRecharge={mockOnRecharge} />);
      
      const amountInput = screen.getByPlaceholderText('请输入充值金额');
      const submitButton = screen.getByRole('button', { name: '立即充值' });
      
      // 测试负数
      fireEvent.change(amountInput, { target: { value: '-10.5' } });
      fireEvent.click(submitButton);
      
      // 直接检查错误状态，因为 parseFloat('-10.5') 返回 -10.5，会被验证为 <= 0
      expect(mockOnRecharge).not.toHaveBeenCalled();
    });

    it('应该验证零金额', async () => {
      render(<RechargeModal open={true} onClose={mockOnClose} onRecharge={mockOnRecharge} />);
      
      const amountInput = screen.getByPlaceholderText('请输入充值金额');
      const submitButton = screen.getByRole('button', { name: '立即充值' });
      
      fireEvent.change(amountInput, { target: { value: '0.0' } });
      fireEvent.click(submitButton);
      
      // 直接检查错误状态，因为 parseFloat('0.0') 返回 0，会被验证为 <= 0
      expect(mockOnRecharge).not.toHaveBeenCalled();
    });

    it('应该验证非数字输入', async () => {
      render(<RechargeModal open={true} onClose={mockOnClose} onRecharge={mockOnRecharge} />);
      
      const amountInput = screen.getByPlaceholderText('请输入充值金额');
      const submitButton = screen.getByRole('button', { name: '立即充值' });
      
      fireEvent.change(amountInput, { target: { value: '' } });
      fireEvent.click(submitButton);
      
      // 直接检查错误状态，因为 parseFloat('') 返回 NaN，会被验证为无效
      expect(mockOnRecharge).not.toHaveBeenCalled();
    });
  });

  describe('充值成功', () => {
    it('充值成功后应该清空表单并关闭模态框', async () => {
      mockOnRecharge.mockResolvedValue();
      
      render(<RechargeModal open={true} onClose={mockOnClose} onRecharge={mockOnRecharge} />);
      
      const amountInput = screen.getByPlaceholderText('请输入充值金额');
      const submitButton = screen.getByRole('button', { name: '立即充值' });
      
      fireEvent.change(amountInput, { target: { value: '100.00' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnRecharge).toHaveBeenCalledWith(100.00);
        expect(mockOnClose).toHaveBeenCalled();
        expect(amountInput.value).toBe(''); // 表单应该被清空
      });
    });
  });

  describe('充值失败', () => {
    it('应该显示充值失败的错误信息', async () => {
      const mockError = new Error('网络错误');
      mockOnRecharge.mockRejectedValue(mockError);
      
      render(<RechargeModal open={true} onClose={mockOnClose} onRecharge={mockOnRecharge} />);
      
      const amountInput = screen.getByPlaceholderText('请输入充值金额');
      const submitButton = screen.getByRole('button', { name: '立即充值' });
      
      fireEvent.change(amountInput, { target: { value: '50.00' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('网络错误')).toBeInTheDocument();
        expect(mockOnClose).not.toHaveBeenCalled();
      });
    });

    it('应该显示默认错误信息当没有具体错误时', async () => {
      mockOnRecharge.mockRejectedValue({});
      
      render(<RechargeModal open={true} onClose={mockOnClose} onRecharge={mockOnRecharge} />);
      
      const amountInput = screen.getByPlaceholderText('请输入充值金额');
      const submitButton = screen.getByRole('button', { name: '立即充值' });
      
      fireEvent.change(amountInput, { target: { value: '100' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('充值失败')).toBeInTheDocument();
      });
    });
  });

  describe('加载状态', () => {
    it('充值过程中应该显示加载状态', async () => {
      let resolvePromise;
      const delayedPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      
      mockOnRecharge.mockReturnValue(delayedPromise);
      
      render(<RechargeModal open={true} onClose={mockOnClose} onRecharge={mockOnRecharge} />);
      
      const amountInput = screen.getByPlaceholderText('请输入充值金额');
      const submitButton = screen.getByRole('button', { name: '立即充值' });
      
      fireEvent.change(amountInput, { target: { value: '100.00' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText('提交中...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      expect(amountInput).toBeDisabled();
      
      // 解析Promise
      resolvePromise();
      
      await waitFor(() => {
        expect(screen.getByText('立即充值')).toBeInTheDocument();
      });
    });
  });

  describe('关闭功能', () => {
    it('点击关闭按钮应该调用onClose', () => {
      render(<RechargeModal open={true} onClose={mockOnClose} onRecharge={mockOnRecharge} />);
      
      const closeButton = screen.getByRole('button', { name: 'close' }); // close按钮
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('输入字段属性', () => {
    it('应该设置正确的输入字段属性', () => {
      render(<RechargeModal open={true} onClose={mockOnClose} onRecharge={mockOnRecharge} />);
      
      const amountInput = screen.getByPlaceholderText('请输入充值金额');
      
      expect(amountInput).toHaveAttribute('type', 'number');
      expect(amountInput).toHaveAttribute('min', '0.01');
      expect(amountInput).toHaveAttribute('step', '0.01');
      expect(amountInput).toHaveAttribute('required');
    });
  });
}); 