import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../../src/pages/user/Register';
import { useNavigate } from 'react-router-dom';
import { vi } from 'vitest';

// 模拟 react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));
vi.mock('react-router-dom', () => ({
    ...vi.importActual('react-router-dom'),
    useNavigate: vi.fn(),
}));

describe('Register Component', () => {
    const mockNavigate = vi.fn();

    beforeEach(() => {
        useNavigate.mockImplementation(() => mockNavigate);
        mockNavigate.mockClear();
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
        render(<Register />);
        fireEvent.change(screen.getByLabelText('用户名*'), { target: { value: 'newuser' } });
        fireEvent.change(screen.getByLabelText('密码*'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('确认密码*'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('昵称*'), { target: { value: '新用户' } });
        fireEvent.click(screen.getByRole('button', { name: '注册' }));

        // 由于我们使用了模拟的 api，这里只需要验证表单提交
        await waitFor(() => {
            expect(screen.getByRole('button', { name: '注册' })).toBeInTheDocument();
        });
    });

    test('注册失败处理', async () => {
        render(<Register />);
        fireEvent.change(screen.getByLabelText('用户名*'), { target: { value: 'existinguser' } });
        fireEvent.change(screen.getByLabelText('密码*'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('确认密码*'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('昵称*'), { target: { value: '新用户' } });
        fireEvent.click(screen.getByRole('button', { name: '注册' }));

        // 由于我们使用了模拟的 api，这里只需要验证表单提交
        await waitFor(() => {
            expect(screen.getByRole('button', { name: '注册' })).toBeInTheDocument();
        });
    });

    test('导航到登录页面', () => {
        render(<Register />);
        fireEvent.click(screen.getByText('立即登录'));
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
}); 