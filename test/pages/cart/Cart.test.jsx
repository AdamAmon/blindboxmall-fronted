import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Cart from '../../../src/pages/cart/Cart';
import { vi } from 'vitest';
import api from '../../../src/utils/axios';


const mockNavigate = vi.fn();

// 模拟 react-toastify
vi.mock('react-toastify', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// 模拟 axios
vi.mock('../../../src/utils/axios', () => ({
    default: {
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        post: vi.fn(),
    },
}));

describe('Cart Component', () => {
    const mockUser = {
        id: 1,
        username: 'testuser',
        nickname: '测试用户',
        role: 'customer',
        balance: 100.00,
    };

    const mockCartItems = [
        {
            id: 1,
            blind_box_id: 1,
            quantity: 1, // 数量为1，减少按钮应该被禁用
            blindBox: {
                id: 1,
                name: '测试盲盒1',
                price: 29.99,
                cover_image: 'https://example.com/image1.jpg',
                stock: 100,
            },
        },
        {
            id: 2,
            blind_box_id: 2,
            quantity: 50, // 数量等于库存，增加按钮应该被禁用
            blindBox: {
                id: 2,
                name: '测试盲盒2',
                price: 39.99,
                cover_image: 'https://example.com/image2.jpg',
                stock: 50,
            },
        },
    ];

    beforeEach(() => {
        mockNavigate.mockClear();
        vi.clearAllMocks();
        
        // 模拟 localStorage
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: vi.fn((key) => {
                    if (key === 'user') return JSON.stringify(mockUser);
                    if (key === 'token') return 'mock-token';
                    return null;
                }),
                setItem: vi.fn(),
                removeItem: vi.fn(),
                clear: vi.fn(),
            },
            writable: true,
        });
        
        // 模拟 API 响应
        api.get.mockResolvedValue({
            data: {
                success: true,
                data: mockCartItems,
            },
        });
        
        api.post.mockResolvedValue({
            data: {
                success: true,
                message: '操作成功',
            },
        });
    });

    describe('组件渲染', () => {
        test('应该正确渲染购物车页面', async () => {
            await act(async () => {
                render(<Cart />);
            });
            
            await waitFor(() => {
                expect(screen.getByText('购物车')).toBeInTheDocument();
                expect(screen.getByText('管理您的盲盒收藏')).toBeInTheDocument();
            });
        });

        test('应该显示加载状态', async () => {
            // 模拟一个永不解析的 Promise 来保持加载状态
            api.get.mockImplementation(() => new Promise(() => {}));
            
            await act(async () => {
                render(<Cart />);
            });
            expect(screen.getByText('正在加载购物车...')).toBeInTheDocument();
        });

        test('应该显示空购物车状态', async () => {
            api.get.mockResolvedValue({
                data: {
                    success: true,
                    data: [],
                },
            });

            await act(async () => {
                render(<Cart />);
            });
            
            await waitFor(() => {
                expect(screen.getByText('购物车空空如也')).toBeInTheDocument();
                expect(screen.getByText('快去挑选心仪的盲盒吧！')).toBeInTheDocument();
                expect(screen.getByText('去购物')).toBeInTheDocument();
            });
        });
    });

    describe('数据获取', () => {
        test('应该正确获取购物车数据', async () => {
            render(<Cart />);
            
            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/api/cart/list', {
                    params: { user_id: mockUser.id }
                });
            });
        });

        test('应该处理API错误', async () => {
            api.get.mockRejectedValue(new Error('API Error'));
            
            render(<Cart />);
            
            await waitFor(() => {
                expect(screen.getByText('获取购物车失败')).toBeInTheDocument();
            });
        });
    });

    describe('购物车商品显示', () => {
        test('应该正确显示商品信息', async () => {
            render(<Cart />);
            
            await waitFor(() => {
                expect(screen.getByText('测试盲盒1')).toBeInTheDocument();
                expect(screen.getByText('测试盲盒2')).toBeInTheDocument();
                expect(screen.getByText('单价: ¥29.99')).toBeInTheDocument();
                expect(screen.getByText('单价: ¥39.99')).toBeInTheDocument();
            });
        });

        test('应该显示商品小计', async () => {
            render(<Cart />);
            
            await waitFor(() => {
                expect(screen.getByText('小计: ¥29.99')).toBeInTheDocument();
                expect(screen.getByText('小计: ¥1999.50')).toBeInTheDocument();
            });
        });

        test('应该显示总价', async () => {
            render(<Cart />);
            
            await waitFor(() => {
                expect(screen.getByText('总价: ¥2029.49')).toBeInTheDocument();
                expect(screen.getByText('共 2 件商品')).toBeInTheDocument();
            });
        });

        test('应该处理图片加载错误', async () => {
            render(<Cart />);
            
            await waitFor(() => {
                const images = screen.getAllByAltText('盲盒封面');
                expect(images).toHaveLength(2);
            });
        });
    });

    describe('商品数量操作', () => {
        test('应该增加商品数量', async () => {
            render(<Cart />);
            
            await waitFor(() => {
                // 使用SVG路径来找到增加按钮
                const increaseButtons = screen.getAllByText((content, element) => {
                    return element.tagName.toLowerCase() === 'svg' && 
                           element.innerHTML.includes('M12 4v16m8-8H4');
                });
                fireEvent.click(increaseButtons[0]);
            });
            
            await waitFor(() => {
                expect(api.post).toHaveBeenCalledWith('/api/cart/update', {
                    cart_id: 1,
                    quantity: 2
                });
            });
        });

        test('应该减少商品数量', async () => {
            render(<Cart />);
            
            await waitFor(() => {
                // 使用SVG路径来找到减少按钮
                const decreaseButtons = screen.getAllByText((content, element) => {
                    return element.tagName.toLowerCase() === 'svg' && 
                           element.innerHTML.includes('M20 12H4');
                });
                fireEvent.click(decreaseButtons[1]); // 点击第二个商品的减少按钮
            });
            
            await waitFor(() => {
                expect(api.post).toHaveBeenCalledWith('/api/cart/update', {
                    cart_id: 2,
                    quantity: 49
                });
            });
        });

        test('应该直接修改数量输入框', async () => {
            render(<Cart />);
            
            await waitFor(() => {
                const quantityInputs = screen.getAllByDisplayValue('1');
                fireEvent.change(quantityInputs[0], { target: { value: '5' } });
            });
            
            await waitFor(() => {
                expect(api.post).toHaveBeenCalledWith('/api/cart/update', {
                    cart_id: 1,
                    quantity: 5
                });
            });
        });

        test('应该处理数量更新失败', async () => {
            api.post.mockRejectedValue(new Error('Update failed'));
            
            render(<Cart />);
            
            await waitFor(() => {
                const increaseButtons = screen.getAllByText((content, element) => {
                    return element.tagName.toLowerCase() === 'svg' && 
                           element.innerHTML.includes('M12 4v16m8-8H4');
                });
                fireEvent.click(increaseButtons[0]);
            });
            
            await waitFor(() => {
                expect(screen.getByText('更新数量失败')).toBeInTheDocument();
            });
        });

        test('应该限制最小数量为1', async () => {
            render(<Cart />);
            
            await waitFor(() => {
                // 找到包含减少图标的按钮元素
                const decreaseButtons = screen.getAllByText((content, element) => {
                    return element.tagName.toLowerCase() === 'svg' && 
                           element.innerHTML.includes('M20 12H4');
                });
                const firstButton = decreaseButtons[0].closest('button');
                expect(firstButton).toBeDisabled();
            });
        });

        test('应该限制最大数量不超过库存', async () => {
            render(<Cart />);
            
            await waitFor(() => {
                // 找到包含增加图标的按钮元素
                const increaseButtons = screen.getAllByText((content, element) => {
                    return element.tagName.toLowerCase() === 'svg' && 
                           element.innerHTML.includes('M12 4v16m8-8H4');
                });
                const secondButton = increaseButtons[1].closest('button');
                expect(secondButton).toBeDisabled();
            });
        });
    });

    describe('删除商品', () => {
        test('应该删除购物车商品', async () => {
            render(<Cart />);
            
            await waitFor(() => {
                const deleteButtons = screen.getAllByText('删除');
                fireEvent.click(deleteButtons[0]);
            });
            
            await waitFor(() => {
                expect(api.post).toHaveBeenCalledWith('/api/cart/delete', {
                    cart_id: 1
                });
            });
        });

        test('应该处理删除失败', async () => {
            api.post.mockRejectedValue(new Error('Delete failed'));
            
            render(<Cart />);
            
            await waitFor(() => {
                const deleteButtons = screen.getAllByText('删除');
                fireEvent.click(deleteButtons[0]);
            });
            
            await waitFor(() => {
                expect(screen.getByText('删除失败')).toBeInTheDocument();
            });
        });
    });

    describe('清空购物车', () => {
        test('应该清空购物车', async () => {
            render(<Cart />);
            
            await waitFor(() => {
                const clearButton = screen.getByText('清空购物车');
                fireEvent.click(clearButton);
            });
            
            await waitFor(() => {
                expect(api.post).toHaveBeenCalledWith('/api/cart/clear', {
                    user_id: mockUser.id
                });
            });
        });
    });

    describe('结算功能', () => {
        test('应该显示结算按钮', async () => {
            render(<Cart />);
            
            await waitFor(() => {
                expect(screen.getByText('去结算')).toBeInTheDocument();
            });
        });

        test('应该处理结算操作', async () => {
            render(<Cart />);
            
            await waitFor(() => {
                const checkoutButton = screen.getByText('去结算');
                fireEvent.click(checkoutButton);
            });
            
            expect(mockNavigate).toHaveBeenCalledWith('/order/confirm');
        });
    });

    describe('继续购物', () => {
        test('应该支持继续购物功能', async () => {
            render(<Cart />);
            
            await waitFor(() => {
                const continueShoppingButton = screen.getByText('继续购物');
                fireEvent.click(continueShoppingButton);
            });
            
            expect(mockNavigate).toHaveBeenCalledWith('/blindboxes');
        });
    });

    describe('未登录用户', () => {
        test('未登录用户应该跳转到登录页面', () => {
            // 模拟未登录状态
            Object.defineProperty(window, 'localStorage', {
                value: {
                    getItem: vi.fn(() => null),
                    setItem: vi.fn(),
                    removeItem: vi.fn(),
                    clear: vi.fn(),
                },
                writable: true,
            });
            
            render(<Cart />);
            
            expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
        });
    });
}); 