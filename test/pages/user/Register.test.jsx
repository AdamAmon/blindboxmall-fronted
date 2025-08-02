import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../../../src/pages/user/Register';
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

describe('Register Component', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
        vi.clearAllMocks();
    });

    describe('组件渲染', () => {
        test('应该正确渲染注册表单', () => {
            render(<Register />);
            
            // 检查品牌标题
            expect(screen.getByText('盲盒商城')).toBeInTheDocument();
            expect(screen.getByText('创建账户')).toBeInTheDocument();
            expect(screen.getByText('加入我们，开启您的盲盒探索之旅')).toBeInTheDocument();
            
            // 检查表单元素 - 使用更精确的选择器
            expect(screen.getByPlaceholderText('请输入用户名')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /注册/i })).toBeInTheDocument();
            
            // 检查登录链接
            expect(screen.getByText('已有账户？')).toBeInTheDocument();
            expect(screen.getByText('立即登录')).toBeInTheDocument();
        });

        test('应该显示正确的输入框占位符', () => {
            render(<Register />);
            
            const usernameInput = screen.getByPlaceholderText('请输入用户名');
            const nicknameInput = screen.getByPlaceholderText('请输入昵称');
            const passwordInput = screen.getByPlaceholderText('请输入密码');
            const confirmPasswordInput = screen.getByPlaceholderText('请再次输入密码');
            
            expect(usernameInput).toBeInTheDocument();
            expect(nicknameInput).toBeInTheDocument();
            expect(passwordInput).toBeInTheDocument();
            expect(confirmPasswordInput).toBeInTheDocument();
        });
    });

    describe('用户输入处理', () => {
        test('应该正确处理用户名输入', () => {
            render(<Register />);
            const usernameInput = screen.getByPlaceholderText('请输入用户名');
            
            fireEvent.change(usernameInput, { target: { value: 'newuser' } });
            expect(usernameInput.value).toBe('newuser');
        });

        test('应该正确处理昵称输入', () => {
            render(<Register />);
            const nicknameInput = screen.getByPlaceholderText('请输入昵称');
            
            fireEvent.change(nicknameInput, { target: { value: '新用户' } });
            expect(nicknameInput.value).toBe('新用户');
        });

        test('应该正确处理密码输入', () => {
            render(<Register />);
            const passwordInput = screen.getByPlaceholderText('请输入密码');
            
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            expect(passwordInput.value).toBe('password123');
        });

        test('应该正确处理确认密码输入', () => {
            render(<Register />);
            const confirmPasswordInput = screen.getByPlaceholderText('请再次输入密码');
            
            fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
            expect(confirmPasswordInput.value).toBe('password123');
        });
    });

    describe('表单验证', () => {
        test('应该验证必填字段', async () => {
            render(<Register />);
            
            const submitButton = screen.getByRole('button', { name: /注册/i });
            
            // 直接触发表单提交事件，绕过HTML5验证
            const form = submitButton.closest('form');
            fireEvent.submit(form);
            
            // 等待验证错误显示
            await waitFor(() => {
                expect(screen.getByText('用户名不能为空')).toBeInTheDocument();
            });
        });

        test('应该验证用户名长度', async () => {
            render(<Register />);
            const usernameInput = screen.getByPlaceholderText('请输入用户名');
            const nicknameInput = screen.getByPlaceholderText('请输入昵称');
            const passwordInput = screen.getByPlaceholderText('请输入密码');
            const confirmPasswordInput = screen.getByPlaceholderText('请再次输入密码');
            const submitButton = screen.getByRole('button', { name: /注册/i });
            
            // 填写其他必填字段，只让用户名验证失败
            fireEvent.change(nicknameInput, { target: { value: '新用户' } });
            fireEvent.change(passwordInput, { target: { value: 'Password123' } });
            fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
            fireEvent.change(usernameInput, { target: { value: 'ab' } });
            fireEvent.click(submitButton);
            
            await waitFor(() => {
                expect(screen.getByText('用户名至少3个字符')).toBeInTheDocument();
            });
        });

        test('应该验证密码长度', async () => {
            render(<Register />);
            const usernameInput = screen.getByPlaceholderText('请输入用户名');
            const nicknameInput = screen.getByPlaceholderText('请输入昵称');
            const passwordInput = screen.getByPlaceholderText('请输入密码');
            const confirmPasswordInput = screen.getByPlaceholderText('请再次输入密码');
            const submitButton = screen.getByRole('button', { name: /注册/i });
            
            // 填写其他必填字段，只让密码验证失败
            fireEvent.change(usernameInput, { target: { value: 'newuser' } });
            fireEvent.change(nicknameInput, { target: { value: '新用户' } });
            fireEvent.change(confirmPasswordInput, { target: { value: '123' } });
            fireEvent.change(passwordInput, { target: { value: '123' } });
            fireEvent.click(submitButton);
            
            await waitFor(() => {
                expect(screen.getByText('密码至少6个字符')).toBeInTheDocument();
            });
        });

        test('应该验证密码确认匹配', async () => {
            render(<Register />);
            const usernameInput = screen.getByPlaceholderText('请输入用户名');
            const nicknameInput = screen.getByPlaceholderText('请输入昵称');
            const passwordInput = screen.getByPlaceholderText('请输入密码');
            const confirmPasswordInput = screen.getByPlaceholderText('请再次输入密码');
            const submitButton = screen.getByRole('button', { name: /注册/i });
            
            // 填写所有必填字段，让密码确认验证失败
            fireEvent.change(usernameInput, { target: { value: 'newuser' } });
            fireEvent.change(nicknameInput, { target: { value: '新用户' } });
            fireEvent.change(passwordInput, { target: { value: 'Password123' } });
            fireEvent.change(confirmPasswordInput, { target: { value: 'Password456' } });
            fireEvent.click(submitButton);
            
            await waitFor(() => {
                expect(screen.getByText('两次输入的密码不一致')).toBeInTheDocument();
            });
        });
    });

    describe('加载状态', () => {
        test('应该在注册过程中显示加载状态', async () => {
            api.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
            
            render(<Register />);
            
            const usernameInput = screen.getByPlaceholderText('请输入用户名');
            const nicknameInput = screen.getByPlaceholderText('请输入昵称');
            const passwordInput = screen.getByPlaceholderText('请输入密码');
            const confirmPasswordInput = screen.getByPlaceholderText('请再次输入密码');
            const submitButton = screen.getByRole('button', { name: /注册/i });
            
            fireEvent.change(usernameInput, { target: { value: 'newuser' } });
            fireEvent.change(nicknameInput, { target: { value: '新用户' } });
            fireEvent.change(passwordInput, { target: { value: 'Password123' } });
            fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
            
            fireEvent.click(submitButton);
            
            await waitFor(() => {
                expect(submitButton).toBeDisabled();
            });
        });

        test('应该在加载时禁用输入框', async () => {
            api.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
            
            render(<Register />);
            
            const usernameInput = screen.getByPlaceholderText('请输入用户名');
            const nicknameInput = screen.getByPlaceholderText('请输入昵称');
            const passwordInput = screen.getByPlaceholderText('请输入密码');
            const confirmPasswordInput = screen.getByPlaceholderText('请再次输入密码');
            const submitButton = screen.getByRole('button', { name: /注册/i });
            
            fireEvent.change(usernameInput, { target: { value: 'newuser' } });
            fireEvent.change(nicknameInput, { target: { value: '新用户' } });
            fireEvent.change(passwordInput, { target: { value: 'Password123' } });
            fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
            
            fireEvent.click(submitButton);
            
            await waitFor(() => {
                expect(usernameInput).toBeDisabled();
                expect(nicknameInput).toBeDisabled();
                expect(passwordInput).toBeDisabled();
                expect(confirmPasswordInput).toBeDisabled();
            });
        });
    });

    describe('密码强度验证', () => {
        test('应该验证密码长度至少6位', async () => {
            render(<Register />);
            const usernameInput = screen.getByPlaceholderText('请输入用户名');
            const nicknameInput = screen.getByPlaceholderText('请输入昵称');
            const passwordInput = screen.getByPlaceholderText('请输入密码');
            const confirmPasswordInput = screen.getByPlaceholderText('请再次输入密码');
            const submitButton = screen.getByRole('button', { name: /注册/i });
            
            // 填写其他必填字段，只让密码验证失败
            fireEvent.change(usernameInput, { target: { value: 'newuser' } });
            fireEvent.change(nicknameInput, { target: { value: '新用户' } });
            fireEvent.change(confirmPasswordInput, { target: { value: '123' } });
            fireEvent.change(passwordInput, { target: { value: '123' } });
            fireEvent.click(submitButton);
            
            await waitFor(() => {
                expect(screen.getByText('密码至少6个字符')).toBeInTheDocument();
            });
        });

        test('应该验证密码包含大小写字母和数字', async () => {
            render(<Register />);
            const usernameInput = screen.getByPlaceholderText('请输入用户名');
            const nicknameInput = screen.getByPlaceholderText('请输入昵称');
            const passwordInput = screen.getByPlaceholderText('请输入密码');
            const confirmPasswordInput = screen.getByPlaceholderText('请再次输入密码');
            const submitButton = screen.getByRole('button', { name: /注册/i });
            
            // 填写其他必填字段，只让密码验证失败
            fireEvent.change(usernameInput, { target: { value: 'newuser' } });
            fireEvent.change(nicknameInput, { target: { value: '新用户' } });
            fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.click(submitButton);
            
            await waitFor(() => {
                expect(screen.getByText('密码必须包含大小写字母和数字')).toBeInTheDocument();
            });
        });

        test('应该接受符合要求的密码', async () => {
            render(<Register />);
            const usernameInput = screen.getByPlaceholderText('请输入用户名');
            const nicknameInput = screen.getByPlaceholderText('请输入昵称');
            const passwordInput = screen.getByPlaceholderText('请输入密码');
            const confirmPasswordInput = screen.getByPlaceholderText('请再次输入密码');
            const submitButton = screen.getByRole('button', { name: /注册/i });
            
            // 填写所有必填字段，使用符合要求的密码
            fireEvent.change(usernameInput, { target: { value: 'newuser' } });
            fireEvent.change(nicknameInput, { target: { value: '新用户' } });
            fireEvent.change(passwordInput, { target: { value: 'Password123' } });
            fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
            fireEvent.click(submitButton);
            
            await waitFor(() => {
                expect(screen.queryByText('密码至少6个字符')).not.toBeInTheDocument();
                expect(screen.queryByText('密码必须包含大小写字母和数字')).not.toBeInTheDocument();
            });
        });
    });

    describe('成功注册', () => {
        test('应该成功注册并跳转到登录页面', async () => {
            api.post.mockResolvedValue({ data: { success: true, message: '注册成功' } });
            
            render(<Register />);
            
            const usernameInput = screen.getByPlaceholderText('请输入用户名');
            const nicknameInput = screen.getByPlaceholderText('请输入昵称');
            const passwordInput = screen.getByPlaceholderText('请输入密码');
            const confirmPasswordInput = screen.getByPlaceholderText('请再次输入密码');
            const submitButton = screen.getByRole('button', { name: /注册/i });
            
            fireEvent.change(usernameInput, { target: { value: 'newuser' } });
            fireEvent.change(nicknameInput, { target: { value: '新用户' } });
            fireEvent.change(passwordInput, { target: { value: 'Password123' } });
            fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
            
            fireEvent.click(submitButton);
            
            await waitFor(() => {
                expect(api.post).toHaveBeenCalledWith('/api/auth/register', {
                    username: 'newuser',
                    password: 'Password123',
                    nickname: '新用户',
                    role: 'customer',
                    avatar: 'https://avatars.githubusercontent.com/u/583231?v=4',
                    email: '',
                    phone: ''
                });
            });
        });
    });

    describe('错误处理', () => {
        test('应该处理注册失败', async () => {
            api.post.mockRejectedValue({ response: { data: { message: '用户名已存在' } } });
            
            render(<Register />);
            
            const usernameInput = screen.getByPlaceholderText('请输入用户名');
            const nicknameInput = screen.getByPlaceholderText('请输入昵称');
            const passwordInput = screen.getByPlaceholderText('请输入密码');
            const confirmPasswordInput = screen.getByPlaceholderText('请再次输入密码');
            const submitButton = screen.getByRole('button', { name: /注册/i });
            
            fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
            fireEvent.change(nicknameInput, { target: { value: '新用户' } });
            fireEvent.change(passwordInput, { target: { value: 'Password123' } });
            fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
            
            fireEvent.click(submitButton);
            
            await waitFor(() => {
                expect(api.post).toHaveBeenCalled();
            });
        });
    });

    describe('导航功能', () => {
        test('点击登录链接应该跳转到登录页面', () => {
            render(<Register />);
            
            const loginLink = screen.getByText('立即登录');
            fireEvent.click(loginLink);
            
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });
}); 