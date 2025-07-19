import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import Register from '../../src/pages/user/Register';
import { useNavigate } from 'react-router-dom';
import { vi } from 'vitest';

vi.mock('axios');
vi.mock('react-router-dom', () => ({
    ...vi.importActual('react-router-dom'),
    useNavigate: vi.fn(),
}));

describe('Register Component', () => {
    const mockNavigate = vi.fn();

    beforeEach(() => {
        useNavigate.mockImplementation(() => mockNavigate);
        axios.post.mockClear();
        mockNavigate.mockClear();
        localStorage.clear();
        window.alert = vi.fn();
    });

    test('渲染注册表单', () => {
        render(<Register />);
        expect(screen.getByText('用户注册')).toBeInTheDocument();
        expect(screen.getByLabelText('用户名*')).toBeInTheDocument();
        expect(screen.getByLabelText('密码*')).toBeInTheDocument();
        expect(screen.getByLabelText('确认密码*')).toBeInTheDocument();
        expect(screen.getByLabelText('昵称*')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '注册' })).toBeInTheDocument();
    });

    test('处理用户输入', () => {
        render(<Register />);
        const usernameInput = screen.getByLabelText('用户名*');
        const passwordInput = screen.getByLabelText('密码*');
        const confirmPasswordInput = screen.getByLabelText('确认密码*');
        const nicknameInput = screen.getByLabelText('昵称*');

        fireEvent.change(usernameInput, { target: { value: 'newuser' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        fireEvent.change(nicknameInput, { target: { value: '新用户' } });

        expect(usernameInput.value).toBe('newuser');
        expect(passwordInput.value).toBe('password123');
        expect(confirmPasswordInput.value).toBe('password123');
        expect(nicknameInput.value).toBe('新用户');
    });

    test('密码不匹配验证', async () => {
        render(<Register />);
        
        fireEvent.change(screen.getByLabelText('用户名*'), { target: { value: 'newuser' } });
        fireEvent.change(screen.getByLabelText('密码*'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('确认密码*'), { target: { value: 'different' } });
        fireEvent.change(screen.getByLabelText('昵称*'), { target: { value: '新用户' } });
        
        fireEvent.click(screen.getByRole('button', { name: '注册' }));

        await waitFor(() => {
            expect(screen.getByText('两次输入的密码不一致')).toBeInTheDocument();
        });
    });

    test('成功注册处理', async () => {
        axios.post.mockResolvedValue({
            data: {
                code: 200,
                message: '注册成功'
            }
        });

        render(<Register />);
        fireEvent.change(screen.getByLabelText('用户名*'), { target: { value: 'newuser' } });
        fireEvent.change(screen.getByLabelText('密码*'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('确认密码*'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('昵称*'), { target: { value: '新用户' } });
        fireEvent.click(screen.getByRole('button', { name: '注册' }));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith('/api/auth/register', {
                username: 'newuser',
                password: 'password123',
                nickname: '新用户',
                avatar: '',
                email: '',
                phone: '',
                role: 'customer'
            });
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

    test('注册失败处理', async () => {
        axios.post.mockRejectedValue({
            response: {
                data: { message: '用户名已存在' }
            }
        });

        render(<Register />);
        fireEvent.change(screen.getByLabelText('用户名*'), { target: { value: 'existinguser' } });
        fireEvent.change(screen.getByLabelText('密码*'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('确认密码*'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('昵称*'), { target: { value: '新用户' } });
        fireEvent.click(screen.getByRole('button', { name: '注册' }));

        await waitFor(() => {
            expect(screen.getByText('用户名已存在')).toBeInTheDocument();
        });
    });

    test('导航到登录页面', () => {
        render(<Register />);
        fireEvent.click(screen.getByText('立即登录'));
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
}); 