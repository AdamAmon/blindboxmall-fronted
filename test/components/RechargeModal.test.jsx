import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RechargeModal from '../../src/components/RechargeModal';
import { vi } from 'vitest';

const mockOnClose = vi.fn();
const mockOnRecharge = vi.fn();

describe('RechargeModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染', () => {
    it('应该正确渲染充值模态框', () => {
      render(<RechargeModal open={true} onClose={mockOnClose} onRecharge={mockOnRecharge} />);
      
      expect(screen.getByText('余额充值')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /立即充值/i })).toBeInTheDocument();
    });

    it('应该显示快捷金额选择按钮', () => {
      render(<RechargeModal open={true} onClose={mockOnClose} onRecharge={mockOnRecharge} />);
      
      expect(screen.getByText('￥10')).toBeInTheDocument();
      expect(screen.getByText('￥50')).toBeInTheDocument();
      expect(screen.getByText('￥100')).toBeInTheDocument();
      expect(screen.getByText('￥200')).toBeInTheDocument();
      expect(screen.getByText('￥500')).toBeInTheDocument();
      expect(screen.getByText('￥1000')).toBeInTheDocument();
    });

    it('应该显示安全提示信息', () => {
      render(<RechargeModal open={true} onClose={mockOnClose} onRecharge={mockOnRecharge} />);
      
      expect(screen.getByText('安全充值，资金安全有保障')).toBeInTheDocument();
    });
  });

  describe('交互功能', () => {
    it('应该支持输入充值金额', () => {
      render(<RechargeModal open={true} onClose={mockOnClose} onRecharge={mockOnRecharge} />);
      
      const amountInput = screen.getByPlaceholderText('0.00');
      fireEvent.change(amountInput, { target: { value: '100' } });
      
      expect(amountInput.value).toBe('100');
    });

    it('应该支持快捷金额选择', () => {
      render(<RechargeModal open={true} onClose={mockOnClose} onRecharge={mockOnRecharge} />);
      
      const quickButton = screen.getByText('￥100');
      fireEvent.click(quickButton);
      
      const amountInput = screen.getByPlaceholderText('0.00');
      expect(amountInput.value).toBe('100');
    });

    it('应该调用关闭回调', () => {
      render(<RechargeModal open={true} onClose={mockOnClose} onRecharge={mockOnRecharge} />);
      
      const closeButton = screen.getByRole('button', { name: '' });
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('表单提交', () => {
    it('应该成功提交有效金额', async () => {
      mockOnRecharge.mockResolvedValue();
      render(<RechargeModal open={true} onClose={mockOnClose} onRecharge={mockOnRecharge} />);
      
      const amountInput = screen.getByPlaceholderText('0.00');
      const submitButton = screen.getByRole('button', { name: /立即充值/i });
      
      fireEvent.change(amountInput, { target: { value: '100' } });
      fireEvent.submit(submitButton.closest('form'));
      
      await waitFor(() => {
        expect(mockOnRecharge).toHaveBeenCalledWith(100);
      });
    });
  });
});