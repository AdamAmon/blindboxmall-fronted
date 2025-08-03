import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BlindBoxTabs from '../../src/components/BlindBoxTabs';

describe('BlindBoxTabs Component', () => {
  const mockStats = {
    common: { blindBoxCount: 10 },
    rare: { blindBoxCount: 5 },
    hidden: { blindBoxCount: 2 }
  };

  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染', () => {
    it('应该正确渲染所有标签页', () => {
      render(<BlindBoxTabs stats={mockStats} active="all" onChange={mockOnChange} />);
      
      expect(screen.getByText('全部(17)')).toBeInTheDocument();
      expect(screen.getByText('普通(10)')).toBeInTheDocument();
      expect(screen.getByText('稀有(5)')).toBeInTheDocument();
      expect(screen.getByText('隐藏(2)')).toBeInTheDocument();
    });

    it('应该显示正确的图标', () => {
      render(<BlindBoxTabs stats={mockStats} active="all" onChange={mockOnChange} />);
      
      expect(screen.getByText('🎁')).toBeInTheDocument();
      expect(screen.getByText('⭐')).toBeInTheDocument();
      expect(screen.getByText('💎')).toBeInTheDocument();
      expect(screen.getByText('🌟')).toBeInTheDocument();
    });

    it('应该正确计算总数', () => {
      render(<BlindBoxTabs stats={mockStats} active="all" onChange={mockOnChange} />);
      
      // 总数应该是 10 + 5 + 2 = 17
      expect(screen.getByText('全部(17)')).toBeInTheDocument();
    });
  });

  describe('交互功能', () => {
    it('点击标签页应该调用onChange回调', () => {
      render(<BlindBoxTabs stats={mockStats} active="all" onChange={mockOnChange} />);
      
      const commonTab = screen.getByText('普通(10)');
      fireEvent.click(commonTab);
      
      expect(mockOnChange).toHaveBeenCalledWith('common');
    });

    it('点击不同标签页应该传递正确的key', () => {
      render(<BlindBoxTabs stats={mockStats} active="all" onChange={mockOnChange} />);
      
      const rareTab = screen.getByText('稀有(5)');
      fireEvent.click(rareTab);
      
      expect(mockOnChange).toHaveBeenCalledWith('rare');
    });

    it('点击隐藏标签页应该传递正确的key', () => {
      render(<BlindBoxTabs stats={mockStats} active="all" onChange={mockOnChange} />);
      
      const hiddenTab = screen.getByText('隐藏(2)');
      fireEvent.click(hiddenTab);
      
      expect(mockOnChange).toHaveBeenCalledWith('hidden');
    });
  });

  describe('激活状态', () => {
    it('应该正确显示激活的标签页', () => {
      render(<BlindBoxTabs stats={mockStats} active="common" onChange={mockOnChange} />);
      
      const commonTab = screen.getByText('普通(10)').closest('button');
      expect(commonTab).toHaveClass('bg-gradient-to-r');
    });

    it('非激活标签页应该有不同的样式', () => {
      render(<BlindBoxTabs stats={mockStats} active="common" onChange={mockOnChange} />);
      
      const allTab = screen.getByText('全部(17)').closest('button');
      expect(allTab).toHaveClass('bg-white/70');
    });
  });

  describe('数据边界情况', () => {
    it('当stats为空时应该显示0', () => {
      render(<BlindBoxTabs stats={{}} active="all" onChange={mockOnChange} />);
      
      expect(screen.getByText('全部(0)')).toBeInTheDocument();
      expect(screen.getByText('普通(0)')).toBeInTheDocument();
      expect(screen.getByText('稀有(0)')).toBeInTheDocument();
      expect(screen.getByText('隐藏(0)')).toBeInTheDocument();
    });

    it('当stats为undefined时应该显示0', () => {
      render(<BlindBoxTabs active="all" onChange={mockOnChange} />);
      
      expect(screen.getByText('全部(0)')).toBeInTheDocument();
      expect(screen.getByText('普通(0)')).toBeInTheDocument();
      expect(screen.getByText('稀有(0)')).toBeInTheDocument();
      expect(screen.getByText('隐藏(0)')).toBeInTheDocument();
    });

    it('当部分stats数据缺失时应该正确处理', () => {
      const partialStats = {
        common: { blindBoxCount: 5 },
        // rare 和 hidden 缺失
      };
      
      render(<BlindBoxTabs stats={partialStats} active="all" onChange={mockOnChange} />);
      
      expect(screen.getByText('全部(5)')).toBeInTheDocument();
      expect(screen.getByText('普通(5)')).toBeInTheDocument();
      expect(screen.getByText('稀有(0)')).toBeInTheDocument();
      expect(screen.getByText('隐藏(0)')).toBeInTheDocument();
    });
  });

  describe('组件属性', () => {
    it('应该接受自定义的active属性', () => {
      render(<BlindBoxTabs stats={mockStats} active="rare" onChange={mockOnChange} />);
      
      const rareTab = screen.getByText('稀有(5)').closest('button');
      expect(rareTab).toHaveClass('bg-gradient-to-r');
    });

    it('应该接受自定义的onChange回调', () => {
      const customOnChange = vi.fn();
      render(<BlindBoxTabs stats={mockStats} active="all" onChange={customOnChange} />);
      
      const allTab = screen.getByText('全部(17)');
      fireEvent.click(allTab);
      
      expect(customOnChange).toHaveBeenCalledWith('all');
    });
  });

  describe('样式和布局', () => {
    it('标签页应该包含正确的按钮样式', () => {
      render(<BlindBoxTabs stats={mockStats} active="all" onChange={mockOnChange} />);
      
      const allTab = screen.getByText('全部(17)').closest('button');
      expect(allTab).toHaveClass('relative', 'group', 'px-8', 'py-4', 'rounded-2xl');
    });
  });

  describe('可访问性', () => {
    it('所有标签页都应该是可点击的按钮', () => {
      render(<BlindBoxTabs stats={mockStats} active="all" onChange={mockOnChange} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4);
    });

    it('标签页应该有正确的文本内容', () => {
      render(<BlindBoxTabs stats={mockStats} active="all" onChange={mockOnChange} />);
      
      expect(screen.getByText('全部(17)')).toBeInTheDocument();
      expect(screen.getByText('普通(10)')).toBeInTheDocument();
      expect(screen.getByText('稀有(5)')).toBeInTheDocument();
      expect(screen.getByText('隐藏(2)')).toBeInTheDocument();
    });
  });
}); 