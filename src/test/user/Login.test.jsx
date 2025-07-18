import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import Login from '../../pages/user/Login';
import { useNavigate } from 'react-router-dom';
import { vi } from 'vitest';

vi.mock('axios');
vi.mock('react-router-dom', () => ({
    ...vi.importActual('react-router-dom'),
    useNavigate: vi.fn(),
}));

describe('Login Component', () => {
    const mockNavigate = vi.fn();

    beforeEach(() => {
        useNavigate.mockImplementation(() => mockNavigate);
        axios.post.mockClear();
        mockNavigate.mockClear();
        localStorage.clear();
        window.alert = vi.fn();
    });

    test('渲染登录表单', () => {
        render(<Login />);
        expect(screen.getByText('欢迎登录盲盒商城')).toBeInTheDocument();
        expect(screen.getByLabelText('用户名')).toBeInTheDocument();
        expect(screen.getByLabelText('密码')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument();
    });

    test('处理用户输入', () => {
        render(<Login />);
        const usernameInput = screen.getByLabelText('用户名');
        const passwordInput = screen.getByLabelText('密码');

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(usernameInput.value).toBe('testuser');
        expect(passwordInput.value).toBe('password123');
    });

    test('成功登录处理', async () => {
        // 模拟API成功响应
        axios.post.mockResolvedValue({
            data: {
                code: 200,
                result: {
                    token: 'fake-token',
                    user: { id: 1, username: 'testuser' }
                }
            }
        });

        render(<Login />);
        fireEvent.change(screen.getByLabelText('用户名'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: '登录' }));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
                username: 'testuser',
                password: 'password123'
            });
            expect(localStorage.getItem('token')).toBe('fake-token');
            expect(localStorage.getItem('user')).toBe(JSON.stringify({ id: 1, username: 'testuser' }));
            expect(mockNavigate).toHaveBeenCalledWith('/profile');
        });
    });

    test('登录失败处理', async () => {
        // 模拟API失败响应
        axios.post.mockRejectedValue({
            response: {
                data: { message: '无效凭证' }
            }
        });

        render(<Login />);
        fireEvent.change(screen.getByLabelText('用户名'), { target: { value: 'wronguser' } });
        fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: '登录' }));

        await waitFor(() => {
            expect(screen.getByText('无效凭证')).toBeInTheDocument();
        });
    });

    test('导航到注册页面', () => {
        render(<Login />);
        fireEvent.click(screen.getByText('立即注册'));
        expect(mockNavigate).toHaveBeenCalledWith('/register');
    });
});
