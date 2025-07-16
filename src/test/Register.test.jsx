import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import Register from '../pages/Register';
import { useNavigate } from 'react-router-dom';
import { vi } from 'vitest';

vi.mock('axios');
vi.mock('react-router-dom', () => ({
    ...vi.importActual('react-router-dom'),
    useNavigate: vi.fn(),
}));

describe('Register Component', () => {
    const mockNavigate = vi.fn();
    const mockFormData = {
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123',
        nickname: 'Test User',
        avatar: '',
        email: 'test@example.com',
        phone: '13800138000',
        role: 'customer'
    };

    beforeEach(() => {
        useNavigate.mockImplementation(() => mockNavigate);
        axios.post.mockClear();
        mockNavigate.mockClear();
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
        const confirmInput = screen.getByLabelText('确认密码*');

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmInput, { target: { value: 'password123' } });

        expect(usernameInput.value).toBe('testuser');
        expect(passwordInput.value).toBe('password123');
        expect(confirmInput.value).toBe('password123');
    });

    test('成功注册处理', async () => {
        axios.post.mockResolvedValue({ data: { code: 200, message: '注册成功' } });

        render(<Register />);

        // 定义字段映射关系
        const fieldMap = {
            username: '用户名*',
            password: '密码*',
            confirmPassword: '确认密码*',
            nickname: '昵称*',
            avatar: '头像URL',
            email: '邮箱',
            phone: '手机号'
        };

        // 填充表单
        Object.keys(mockFormData).forEach(key => {
            if (key !== 'role' && fieldMap[key]) {
                fireEvent.change(screen.getByLabelText(fieldMap[key]), {
                    target: { value: mockFormData[key] }
                });
            }
        });

        // 提交表单
        fireEvent.click(screen.getByRole('button', { name: '注册' }));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

    test('注册失败处理', async () => {
        axios.post.mockRejectedValue({
            response: { data: { message: '用户名已存在' } }
        });

        render(<Register />);

        // 填充表单
        fireEvent.change(screen.getByLabelText('用户名*'), { target: { value: 'existinguser' } });
        fireEvent.change(screen.getByLabelText('密码*'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('确认密码*'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('昵称*'), { target: { value: 'Test User' } });

        fireEvent.click(screen.getByRole('button', { name: '注册' }));

        // 等待错误消息出现
        const errorMessage = await screen.findByText('用户名已存在');
        expect(errorMessage).toBeInTheDocument();
    });

    test('密码不匹配处理', async () => {
        render(<Register />);

        // 填充表单
        fireEvent.change(screen.getByLabelText('用户名*'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('密码*'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('确认密码*'), { target: { value: 'different' } });
        fireEvent.change(screen.getByLabelText('昵称*'), { target: { value: 'Test User' } });

        fireEvent.click(screen.getByRole('button', { name: '注册' }));

        // 等待错误消息出现
        const errorMessage = await screen.findByText('两次输入的密码不一致');
        expect(errorMessage).toBeInTheDocument();
    });

    test('导航到登录页面', () => {
        render(<Register />);
        fireEvent.click(screen.getByRole('link', { name: '立即登录' }));
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
});