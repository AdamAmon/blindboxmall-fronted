import '@testing-library/jest-dom';
import { render, screen, waitFor, act } from '@testing-library/react';
import BlindBoxList from '../../../src/pages/blindbox/BlindBoxList';
import { vi } from 'vitest';
import api from '../../../src/utils/axios';
import * as useUserModule from '../../../src/hooks/useUser';

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
        post: vi.fn(),
    },
}));

// 模拟自定义 hooks
vi.mock('../../../src/hooks/useUser', () => ({
    useUser: vi.fn(),
}));

describe('BlindBoxList Component', () => {
    const mockBlindBoxes = [
        {
            id: 1,
            name: '测试盲盒1',
            price: 29.99,
            description: '这是一个测试盲盒',
            cover_image: 'https://example.com/image1.jpg',
            stock: 100,
            comment_count: 5,
            category: '普通',
        },
        {
            id: 2,
            name: '测试盲盒2',
            price: 39.99,
            description: '这是另一个测试盲盒',
            cover_image: 'https://example.com/image2.jpg',
            stock: 50,
            comment_count: 3,
            category: '稀有',
        },
    ];

    const mockApiResponse = {
        data: {
            code: 200,
            data: {
                list: mockBlindBoxes,
                total: 2,
                current_page: 1,
                totalPages: 1,
                per_page: 6,
            },
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
        
        // 模拟 useUser hook
        vi.spyOn(useUserModule, 'useUser').mockReturnValue({
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
        });
        
        // 模拟 API 响应
        api.get.mockResolvedValue(mockApiResponse);
        
        api.post.mockResolvedValue({
            data: {
                code: 200,
                message: '成功',
            },
        });
    });

    describe('基本渲染', () => {
        test('应该渲染页面标题', async () => {
            await act(async () => {
                render(<BlindBoxList />);
            });
            
            await waitFor(() => {
                expect(screen.getByText('盲盒商城')).toBeInTheDocument();
            });
        });

        test('应该显示加载状态', async () => {
            // 模拟一个永不解析的 Promise 来保持加载状态
            api.get.mockImplementation(() => new Promise(() => {}));
            
            await act(async () => {
                render(<BlindBoxList />);
            });
            
            expect(screen.getByText('正在加载盲盒...')).toBeInTheDocument();
        });

        test('应该显示盲盒列表', async () => {
            await act(async () => {
                render(<BlindBoxList />);
            });
            
            await waitFor(() => {
                expect(screen.getByText('测试盲盒1')).toBeInTheDocument();
                expect(screen.getByText('测试盲盒2')).toBeInTheDocument();
            });
        });
    });

    describe('API调用', () => {
        test('应该调用API获取盲盒列表', async () => {
            await act(async () => {
                render(<BlindBoxList />);
            });
            
            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('http://localhost:7001/api/blindbox', {
                    params: expect.objectContaining({
                        page: 1,
                        limit: 12,
                    }),
                });
            });
        });
    });
}); 