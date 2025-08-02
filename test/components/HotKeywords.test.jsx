import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import HotKeywords from '../../src/components/HotKeywords';

describe('HotKeywords Component', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染', () => {
    it('应该正确渲染热门关键词', () => {
      const keywords = ['盲盒', '手办', '模型'];
      render(<HotKeywords keywords={keywords} onClick={mockOnClick} />);
      
      expect(screen.getByText('热门搜索：')).toBeInTheDocument();
      expect(screen.getByText('盲盒')).toBeInTheDocument();
      expect(screen.getByText('手办')).toBeInTheDocument();
      expect(screen.getByText('模型')).toBeInTheDocument();
    });

    it('当没有关键词时不应该渲染', () => {
      const { container } = render(<HotKeywords keywords={[]} onClick={mockOnClick} />);
      expect(container.firstChild).toBeNull();
    });

    it('当关键词为空数组时不应该渲染', () => {
      const { container } = render(<HotKeywords keywords={[]} onClick={mockOnClick} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('交互功能', () => {
    it('应该支持点击关键词', () => {
      const keywords = ['盲盒', '手办'];
      render(<HotKeywords keywords={keywords} onClick={mockOnClick} />);
      
      const blindBoxButton = screen.getByText('盲盒');
      fireEvent.click(blindBoxButton);
      
      expect(mockOnClick).toHaveBeenCalledWith('盲盒');
    });

    it('应该支持点击多个关键词', () => {
      const keywords = ['盲盒', '手办', '模型'];
      render(<HotKeywords keywords={keywords} onClick={mockOnClick} />);
      
      const shouBanButton = screen.getByText('手办');
      fireEvent.click(shouBanButton);
      
      expect(mockOnClick).toHaveBeenCalledWith('手办');
    });
  });

  describe('样式和布局', () => {
    it('应该显示正确的样式类', () => {
      const keywords = ['盲盒'];
      render(<HotKeywords keywords={keywords} onClick={mockOnClick} />);
      
      const button = screen.getByText('盲盒');
      expect(button).toHaveClass('mx-1', 'px-2', 'py-0.5', 'bg-gray-100');
    });
  });
}); 