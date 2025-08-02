import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BlindBoxFilter from '../../src/components/BlindBoxFilter';
import { vi } from 'vitest';

describe('BlindBoxFilter Component', () => {
    const mockOnFilter = vi.fn();
    const defaultValues = {
        keyword: '测试',
        minPrice: '20',
        maxPrice: '50',
        rarity: '2',
        status: '1',
        sortBy: 'price',
        order: 'asc',
    };

    beforeEach(() => {
        mockOnFilter.mockClear();
    });

    describe('组件渲染', () => {
        test('应该正确渲染筛选组件', () => {
            render(<BlindBoxFilter onFilter={mockOnFilter} />);
            
            // 检查搜索输入框
            expect(screen.getByPlaceholderText('搜索盲盒名称或描述...')).toBeInTheDocument();
            
            // 检查搜索按钮
            expect(screen.getByText('搜索')).toBeInTheDocument();
            
            // 检查展开/折叠按钮
            expect(screen.getByText('展开筛选')).toBeInTheDocument();
        });

        test('应该正确显示默认值', () => {
            render(<BlindBoxFilter onFilter={mockOnFilter} defaultValues={defaultValues} />);
            
            const searchInput = screen.getByPlaceholderText('搜索盲盒名称或描述...');
            expect(searchInput.value).toBe('测试');
        });

        test('应该显示展开筛选按钮', () => {
            render(<BlindBoxFilter onFilter={mockOnFilter} />);
            
            const expandButton = screen.getByText('展开筛选');
            expect(expandButton).toBeInTheDocument();
        });
    });

    describe('搜索功能', () => {
        test('应该处理关键词输入', () => {
            render(<BlindBoxFilter onFilter={mockOnFilter} />);
            
            const searchInput = screen.getByPlaceholderText('搜索盲盒名称或描述...');
            fireEvent.change(searchInput, { target: { value: '新关键词' } });
            
            expect(searchInput.value).toBe('新关键词');
        });

        test('应该提交搜索表单', async () => {
            render(<BlindBoxFilter onFilter={mockOnFilter} />);
            
            const searchInput = screen.getByPlaceholderText('搜索盲盒名称或描述...');
            fireEvent.change(searchInput, { target: { value: '测试搜索' } });
            
            const searchButton = screen.getByText('搜索');
            fireEvent.click(searchButton);
            
            await waitFor(() => {
                expect(mockOnFilter).toHaveBeenCalledWith({
                    keyword: '测试搜索',
                    minPrice: '',
                    maxPrice: '',
                    rarity: '',
                    status: '',
                    sortBy: 'created_at',
                    order: 'desc',
                });
            });
        });

        it('应该支持回车键提交搜索', async () => {
            render(<BlindBoxFilter onFilter={mockOnFilter} />);
            
            const searchInput = screen.getByPlaceholderText('搜索盲盒名称或描述...');
            const form = searchInput.closest('form');
            
            fireEvent.change(searchInput, { target: { value: '回车搜索' } });
            fireEvent.submit(form);
            
            await waitFor(() => {
                expect(mockOnFilter).toHaveBeenCalledWith({
                    keyword: '回车搜索',
                    minPrice: '',
                    maxPrice: '',
                    rarity: '',
                    status: '',
                    sortBy: 'created_at',
                    order: 'desc',
                });
            });
        });
    });

    describe('展开/折叠功能', () => {
        test('应该展开筛选条件', () => {
            render(<BlindBoxFilter onFilter={mockOnFilter} />);
            
            const expandButton = screen.getByText('展开筛选');
            fireEvent.click(expandButton);
            
            // 检查筛选条件是否显示
            expect(screen.getByText('价格范围')).toBeInTheDocument();
            expect(screen.getByText('稀有度')).toBeInTheDocument();
            expect(screen.getByText('状态')).toBeInTheDocument();
            expect(screen.getByText('排序方式')).toBeInTheDocument();
            expect(screen.getByText('收起筛选')).toBeInTheDocument();
        });

        test('应该折叠筛选条件', () => {
            render(<BlindBoxFilter onFilter={mockOnFilter} />);
            
            const expandButton = screen.getByText('展开筛选');
            fireEvent.click(expandButton);
            
            const collapseButton = screen.getByText('收起筛选');
            fireEvent.click(collapseButton);
            
            // 检查筛选条件是否隐藏
            expect(screen.queryByText('价格范围')).not.toBeInTheDocument();
            expect(screen.queryByText('稀有度')).not.toBeInTheDocument();
            expect(screen.getByText('展开筛选')).toBeInTheDocument();
        });

        test('应该显示展开按钮的图标动画', () => {
            render(<BlindBoxFilter onFilter={mockOnFilter} />);
            
            const expandButton = screen.getByText('展开筛选');
            fireEvent.click(expandButton);
            
            // 检查图标是否旋转
            const icon = expandButton.querySelector('svg');
            expect(icon).toHaveClass('rotate-180');
        });
    });

    describe('价格范围筛选', () => {
        test('应该处理最低价格输入', () => {
            render(<BlindBoxFilter onFilter={mockOnFilter} />);
            
            const expandButton = screen.getByText('展开筛选');
            fireEvent.click(expandButton);
            
            const minPriceInput = screen.getByPlaceholderText('最低价');
            fireEvent.change(minPriceInput, { target: { value: '30' } });
            
            expect(minPriceInput.value).toBe('30');
        });

        test('应该处理最高价格输入', () => {
            render(<BlindBoxFilter onFilter={mockOnFilter} />);
            
            const expandButton = screen.getByText('展开筛选');
            fireEvent.click(expandButton);
            
            const maxPriceInput = screen.getByPlaceholderText('最高价');
            fireEvent.change(maxPriceInput, { target: { value: '100' } });
            
            expect(maxPriceInput.value).toBe('100');
        });

        test('应该显示默认价格范围', () => {
            render(<BlindBoxFilter onFilter={mockOnFilter} defaultValues={defaultValues} />);
            
            const expandButton = screen.getByText('展开筛选');
            fireEvent.click(expandButton);
            
            const minPriceInput = screen.getByPlaceholderText('最低价');
            const maxPriceInput = screen.getByPlaceholderText('最高价');
            
            expect(minPriceInput.value).toBe('20');
            expect(maxPriceInput.value).toBe('50');
        });
    });

    describe('稀有度筛选', () => {
        test('应该处理稀有度选择', () => {
            render(<BlindBoxFilter onFilter={mockOnFilter} />);
            
            const expandButton = screen.getByText('展开筛选');
            fireEvent.click(expandButton);
            
            const raritySelect = screen.getByDisplayValue('全部稀有度');
            fireEvent.change(raritySelect, { target: { value: '3' } });
            
            expect(raritySelect.value).toBe('3');
        });

        test('应该显示默认稀有度', () => {
            render(<BlindBoxFilter onFilter={mockOnFilter} defaultValues={defaultValues} />);
            
            const expandButton = screen.getByText('展开筛选');
            fireEvent.click(expandButton);
            
            const raritySelect = screen.getByDisplayValue('稀有');
            expect(raritySelect.value).toBe('2');
        });

        test('应该显示所有稀有度选项', () => {
            render(<BlindBoxFilter onFilter={mockOnFilter} />);
            
            const expandButton = screen.getByText('展开筛选');
            fireEvent.click(expandButton);
            
            const raritySelect = screen.getByDisplayValue('全部稀有度');
            const options = Array.from(raritySelect.options);
            
            expect(options).toHaveLength(4);
            expect(options[0].text).toBe('全部稀有度');
            expect(options[1].text).toBe('普通');
            expect(options[2].text).toBe('稀有');
            expect(options[3].text).toBe('隐藏');
        });
    });

    describe('状态筛选', () => {
        test('应该处理状态选择', () => {
            render(<BlindBoxFilter onFilter={mockOnFilter} />);
            
            const expandButton = screen.getByText('展开筛选');
            fireEvent.click(expandButton);
            
            const statusSelect = screen.getByDisplayValue('全部状态');
            fireEvent.change(statusSelect, { target: { value: '0' } });
            
            expect(statusSelect.value).toBe('0');
        });

        test('应该显示默认状态', () => {
            render(<BlindBoxFilter onFilter={mockOnFilter} defaultValues={defaultValues} />);
            
            const expandButton = screen.getByText('展开筛选');
            fireEvent.click(expandButton);
            
            const statusSelect = screen.getByDisplayValue('上架');
            expect(statusSelect.value).toBe('1');
        });

        test('应该显示所有状态选项', () => {
            render(<BlindBoxFilter onFilter={mockOnFilter} />);
            
            const expandButton = screen.getByText('展开筛选');
            fireEvent.click(expandButton);
            
            const statusSelect = screen.getByDisplayValue('全部状态');
            const options = Array.from(statusSelect.options);
            
            expect(options).toHaveLength(3);
            expect(options[0].text).toBe('全部状态');
            expect(options[1].text).toBe('上架');
            expect(options[2].text).toBe('下架');
        });
    });

    describe('排序功能', () => {
        test('应该处理排序字段选择', () => {
            render(<BlindBoxFilter onFilter={mockOnFilter} />);
            
            const expandButton = screen.getByText('展开筛选');
            fireEvent.click(expandButton);
            
            const sortBySelect = screen.getByDisplayValue('最新');
            fireEvent.change(sortBySelect, { target: { value: 'stock' } });
            
            expect(sortBySelect.value).toBe('stock');
        });

        test('应该处理排序方向选择', () => {
            render(<BlindBoxFilter onFilter={mockOnFilter} />);
            
            const expandButton = screen.getByText('展开筛选');
            fireEvent.click(expandButton);
            
            const orderSelect = screen.getByDisplayValue('降序');
            fireEvent.change(orderSelect, { target: { value: 'asc' } });
            
            expect(orderSelect.value).toBe('asc');
        });

        test('应该显示默认排序设置', () => {
            render(<BlindBoxFilter onFilter={mockOnFilter} defaultValues={defaultValues} />);
            
            const expandButton = screen.getByText('展开筛选');
            fireEvent.click(expandButton);
            
            const sortBySelect = screen.getByDisplayValue('价格');
            const orderSelect = screen.getByDisplayValue('升序');
            
            expect(sortBySelect.value).toBe('price');
            expect(orderSelect.value).toBe('asc');
        });

        test('应该显示所有排序选项', () => {
            render(<BlindBoxFilter onFilter={mockOnFilter} />);
            
            const expandButton = screen.getByText('展开筛选');
            fireEvent.click(expandButton);
            
            const sortBySelect = screen.getByDisplayValue('最新');
            const options = Array.from(sortBySelect.options);
            
            expect(options).toHaveLength(4);
            expect(options[0].text).toBe('最新');
            expect(options[1].text).toBe('价格');
            expect(options[2].text).toBe('库存');
            expect(options[3].text).toBe('名称');
        });
    });

    describe('重置功能', () => {
        test('应该重置所有筛选条件', async () => {
            render(<BlindBoxFilter onFilter={mockOnFilter} defaultValues={defaultValues} />);
            
            const expandButton = screen.getByText('展开筛选');
            fireEvent.click(expandButton);
            
            const resetButton = screen.getByText('重置筛选');
            fireEvent.click(resetButton);
            
            await waitFor(() => {
                expect(mockOnFilter).toHaveBeenCalledWith({});
            });
        });

        test('重置后应该清空所有输入框', () => {
            render(<BlindBoxFilter onFilter={mockOnFilter} defaultValues={defaultValues} />);
            
            const expandButton = screen.getByText('展开筛选');
            fireEvent.click(expandButton);
            
            const resetButton = screen.getByText('重置筛选');
            fireEvent.click(resetButton);
            
            const searchInput = screen.getByPlaceholderText('搜索盲盒名称或描述...');
            const minPriceInput = screen.getByPlaceholderText('最低价');
            const maxPriceInput = screen.getByPlaceholderText('最高价');
            
            expect(searchInput.value).toBe('');
            expect(minPriceInput.value).toBe('');
            expect(maxPriceInput.value).toBe('');
        });
    });

    describe('表单提交', () => {
        test('应该提交完整的筛选条件', async () => {
            render(<BlindBoxFilter onFilter={mockOnFilter} />);
            
            // 展开筛选
            const expandButton = screen.getByText('展开筛选');
            fireEvent.click(expandButton);
            
            // 填写筛选条件
            const searchInput = screen.getByPlaceholderText('搜索盲盒名称或描述...');
            const minPriceInput = screen.getByPlaceholderText('最低价');
            const maxPriceInput = screen.getByPlaceholderText('最高价');
            const raritySelect = screen.getByDisplayValue('全部稀有度');
            const statusSelect = screen.getByDisplayValue('全部状态');
            const sortBySelect = screen.getByDisplayValue('最新');
            const orderSelect = screen.getByDisplayValue('降序');
            
            fireEvent.change(searchInput, { target: { value: '测试盲盒' } });
            fireEvent.change(minPriceInput, { target: { value: '10' } });
            fireEvent.change(maxPriceInput, { target: { value: '100' } });
            fireEvent.change(raritySelect, { target: { value: '2' } });
            fireEvent.change(statusSelect, { target: { value: '1' } });
            fireEvent.change(sortBySelect, { target: { value: 'price' } });
            fireEvent.change(orderSelect, { target: { value: 'asc' } });
            
            // 提交表单
            const searchButton = screen.getByText('搜索');
            fireEvent.click(searchButton);
            
            await waitFor(() => {
                expect(mockOnFilter).toHaveBeenCalledWith({
                    keyword: '测试盲盒',
                    minPrice: '10',
                    maxPrice: '100',
                    rarity: '2',
                    status: '1',
                    sortBy: 'price',
                    order: 'asc',
                });
            });
        });
    });

    describe('输入验证', () => {
        test('价格输入框应该只接受数字', () => {
            render(<BlindBoxFilter onFilter={mockOnFilter} />);
            
            const expandButton = screen.getByText('展开筛选');
            fireEvent.click(expandButton);
            
            const minPriceInput = screen.getByPlaceholderText('最低价');
            const maxPriceInput = screen.getByPlaceholderText('最高价');
            
            expect(minPriceInput).toHaveAttribute('type', 'number');
            expect(maxPriceInput).toHaveAttribute('type', 'number');
        });

        it('搜索输入框应该支持文本输入', () => {
            render(<BlindBoxFilter onFilter={mockOnFilter} />);
            
            const searchInput = screen.getByPlaceholderText('搜索盲盒名称或描述...');
            // 搜索输入框没有显式设置type属性，默认为text
            expect(searchInput).not.toHaveAttribute('type', 'number');
            expect(searchInput).not.toHaveAttribute('type', 'email');
        });
    });

    describe('无障碍功能', () => {
        test('应该为所有输入框提供标签', () => {
            render(<BlindBoxFilter onFilter={mockOnFilter} />);
            
            const expandButton = screen.getByText('展开筛选');
            fireEvent.click(expandButton);
            
            expect(screen.getByText('价格范围')).toBeInTheDocument();
            expect(screen.getByText('稀有度')).toBeInTheDocument();
            expect(screen.getByText('状态')).toBeInTheDocument();
            expect(screen.getByText('排序方式')).toBeInTheDocument();
        });

        test('按钮应该具有正确的角色', () => {
            render(<BlindBoxFilter onFilter={mockOnFilter} />);
            
            const searchButton = screen.getByRole('button', { name: '搜索' });
            const expandButton = screen.getByRole('button', { name: '展开筛选' });
            
            expect(searchButton).toBeInTheDocument();
            expect(expandButton).toBeInTheDocument();
        });
    });
}); 