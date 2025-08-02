import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../../../src/pages/user/Login';
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
        post: vi.fn(),
    },
}));

describe('Login Component', () => {
    const mockSetItem = vi.fn();
    const mockRemoveItem = vi.fn();

    beforeEach(() => {
        mockNavigate.mockClear();
        mockSetItem.mockClear();
        mockRemoveItem.mockClear();
        vi.clearAllMocks();
        
        // 模拟 localStorage
        Object.defineProperty(window, 'localStorage', {
            value: {
                setItem: mockSetItem,
                removeItem: mockRemoveItem,
                getItem: vi.fn(),
            },
            writable: true,
        });
    });

    describe('组件渲染', () => {
        test('应该正确渲染登录表单', () => {
            render(<Login />);
            
            // 检查品牌标题
            expect(screen.getByText('盲盒商城')).toBeInTheDocument();
            expect(screen.getByText('欢迎回来')).toBeInTheDocument();
            expect(screen.getByText('登录您的账户，开启盲盒探索之旅')).toBeInTheDocument();
            
            // 检查表单元素
            expect(screen.getByLabelText('用户名')).toBeInTheDocument();
            expect(screen.getByLabelText('密码')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '立即登录' })).toBeInTheDocument();
            
            // 检查注册链接
            expect(screen.getByText('还没有账户？')).toBeInTheDocument();
            expect(screen.getByText('立即注册')).toBeInTheDocument();
        });

        test('应该显示正确的输入框占位符', () => {
            render(<Login />);
            
            const usernameInput = screen.getByLabelText('用户名');
            const passwordInput = screen.getByLabelText('密码');
            
            expect(usernameInput).toHaveAttribute('placeholder', '请输入您的用户名');
            expect(passwordInput).toHaveAttribute('placeholder', '请输入您的密码');
        });
    });

    describe('用户输入处理', () => {
        test('应该正确处理用户名输入', () => {
            render(<Login />);
            const usernameInput = screen.getByLabelText('用户名');
            
            fireEvent.change(usernameInput, { target: { value: 'testuser' } });
            expect(usernameInput.value).toBe('testuser');
        });

        test('应该正确处理密码输入', () => {
            render(<Login />);
            const passwordInput = screen.getByLabelText('密码');
            
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            expect(passwordInput.value).toBe('password123');
        });

        test('应该支持回车键提交表单', async () => {
            render(<Login />);
            const passwordInput = screen.getByLabelText('密码');
            
            fireEvent.change(screen.getByLabelText('用户名'), { target: { value: 'testuser' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.keyDown(passwordInput, { key: 'Enter' });
            
            await waitFor(() => {
                expect(api.post).toHaveBeenCalled();
            });
        });
    });

    describe('登录成功处理', () => {
        test('应该正确处理顾客用户登录成功', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        token: 'mock-token',
                        user: {
                            id: 1,
                            username: 'testuser',
                            nickname: '测试用户',
                            role: 'customer'
                        }
                    }
                }
            };
            
            api.post.mockResolvedValue(mockResponse);
            
            render(<Login />);
            
            fireEvent.change(screen.getByLabelText('用户名'), { target: { value: 'testuser' } });
            fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'password123' } });
            fireEvent.click(screen.getByRole('button', { name: '立即登录' }));
            
            await waitFor(() => {
                expect(api.post).toHaveBeenCalledWith('/api/auth/login', {
                    username: 'testuser',
                    password: 'password123'
                });
                expect(mockRemoveItem).toHaveBeenCalledWith('token');
                expect(mockRemoveItem).toHaveBeenCalledWith('user');
                expect(mockSetItem).toHaveBeenCalledWith('token', 'mock-token');
                expect(mockSetItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponse.data.data.user));
                expect(mockNavigate).toHaveBeenCalledWith('/blindboxes');
            });
        });

        test('应该正确处理管理员用户登录成功', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        token: 'mock-token',
                        user: {
                            id: 1,
                            username: 'admin',
                            nickname: '管理员',
                            role: 'admin'
                        }
                    }
                }
            };
            
            api.post.mockResolvedValue(mockResponse);
            
            render(<Login />);
            
            fireEvent.change(screen.getByLabelText('用户名'), { target: { value: 'admin' } });
            fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'admin123' } });
            fireEvent.click(screen.getByRole('button', { name: '立即登录' }));
            
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/admin');
            });
        });

        test('应该正确处理商家用户登录成功', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        token: 'mock-token',
                        user: {
                            id: 1,
                            username: 'seller',
                            nickname: '商家',
                            role: 'seller'
                        }
                    }
                }
            };
            
            api.post.mockResolvedValue(mockResponse);
            
            render(<Login />);
            
            fireEvent.change(screen.getByLabelText('用户名'), { target: { value: 'seller' } });
            fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'seller123' } });
            fireEvent.click(screen.getByRole('button', { name: '立即登录' }));
            
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/seller');
            });
        });
    });

    describe('登录失败处理', () => {
        test('应该正确处理API错误', async () => {
            const mockError = {
                response: {
                    data: {
                        message: '用户名或密码错误'
                    }
                }
            };
            
            api.post.mockRejectedValue(mockError);
            
            render(<Login />);
            
            fireEvent.change(screen.getByLabelText('用户名'), { target: { value: 'wronguser' } });
            fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'wrongpass' } });
            fireEvent.click(screen.getByRole('button', { name: '立即登录' }));
            
            await waitFor(() => {
                expect(screen.getByText('用户名或密码错误')).toBeInTheDocument();
            });
        });

        test('应该正确处理网络错误', async () => {
            const mockError = {
                message: 'Network Error'
            };
            
            api.post.mockRejectedValue(mockError);
            
            render(<Login />);
            
            fireEvent.change(screen.getByLabelText('用户名'), { target: { value: 'testuser' } });
            fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'password123' } });
            fireEvent.click(screen.getByRole('button', { name: '立即登录' }));
            
            await waitFor(() => {
                expect(screen.getByText('登录失败')).toBeInTheDocument();
            });
        });

        test('应该正确处理服务器返回失败状态', async () => {
            const mockResponse = {
                data: {
                    success: false,
                    message: '登录失败，请检查用户名和密码'
                }
            };
            
            api.post.mockResolvedValue(mockResponse);
            
            render(<Login />);
            
            fireEvent.change(screen.getByLabelText('用户名'), { target: { value: 'testuser' } });
            fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'password123' } });
            fireEvent.click(screen.getByRole('button', { name: '立即登录' }));
            
            await waitFor(() => {
                expect(screen.getByText('登录失败，请检查用户名和密码')).toBeInTheDocument();
            });
        });
    });

    describe('加载状态', () => {
        test('应该在登录过程中显示加载状态', async () => {
            // 模拟延迟响应
            api.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
            
            render(<Login />);
            
            fireEvent.change(screen.getByLabelText('用户名'), { target: { value: 'testuser' } });
            fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'password123' } });
            fireEvent.click(screen.getByRole('button', { name: '立即登录' }));
            
            expect(screen.getByText('登录中...')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '登录中...' })).toBeDisabled();
        });

        test('应该在加载时禁用输入框', async () => {
            api.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
            
            render(<Login />);
            
            const usernameInput = screen.getByLabelText('用户名');
            const passwordInput = screen.getByLabelText('密码');
            const submitButton = screen.getByRole('button', { name: '立即登录' });
            
            fireEvent.change(usernameInput, { target: { value: 'testuser' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.click(submitButton);
            
            expect(usernameInput).toBeDisabled();
            expect(passwordInput).toBeDisabled();
            expect(submitButton).toBeDisabled();
        });
    });

    describe('导航功能', () => {
        test('点击注册链接应该导航到注册页面', () => {
            render(<Login />);
            const registerButton = screen.getByText('立即注册');
            fireEvent.click(registerButton);
            expect(mockNavigate).toHaveBeenCalledWith('/register');
        });
    });

    describe('表单验证', () => {
        test('应该要求用户名和密码字段', () => {
            render(<Login />);
            
            const usernameInput = screen.getByLabelText('用户名');
            const passwordInput = screen.getByLabelText('密码');
            
            expect(usernameInput).toBeRequired();
            expect(passwordInput).toBeRequired();
        });

        test('应该阻止空表单提交', async () => {
            render(<Login />);
            
            const submitButton = screen.getByRole('button', { name: '立即登录' });
            fireEvent.click(submitButton);
            
            // 由于HTML5验证，表单不会提交
            await waitFor(() => {
                expect(api.post).not.toHaveBeenCalled();
            });
        });
    });
}); 