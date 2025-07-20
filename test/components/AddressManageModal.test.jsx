import { render, screen, fireEvent } from '@testing-library/react';
import AddressManageModal from '../../src/components/AddressManageModal';

describe('AddressManageModal', () => {
  it('弹窗打开时渲染内容', () => {
    render(<AddressManageModal open={true} userId={1} onClose={() => {}} />);
    expect(screen.getByText(/地址管理/)).toBeInTheDocument();
  });

  it('点击关闭按钮触发onClose', () => {
    const onClose = vi.fn();
    render(<AddressManageModal open={true} userId={1} onClose={onClose} />);
    // 直接点击第一个button
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it('未打开时不渲染', () => {
    const { container } = render(<AddressManageModal open={false} userId={1} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
}); 