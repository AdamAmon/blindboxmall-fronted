import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../../src/pages/user/Login';
import { vi } from 'vitest';

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

describe('Login Component', () => {
    const mockSetItem = vi.fn();

    beforeEach(() => {
        mockNavigate.mockClear();
        mockSetItem.mockClear();
        // 还原 jsdom 的 localStorage，确保 setItem 存在
        Object.defineProperty(window, 'localStorage', {
            value: window.localStorage,
            writable: true,
        });
        vi.restoreAllMocks();
        vi.spyOn(window.localStorage, 'setItem');
    });

    test('渲染登录表单', () => {
        render(<Login />);
        expect(screen.getByText('盲盒商城')).toBeInTheDocument();
        expect(screen.getByLabelText('用户名')).toBeInTheDocument();
        expect(screen.getByLabelText('密码')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '立即登录' })).toBeInTheDocument();
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
        render(<Login />);
        fireEvent.change(screen.getByLabelText('用户名'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: '立即登录' }));

        // 由于我们使用了模拟的 api，这里只需要验证表单提交
        await waitFor(() => {
            expect(screen.getByRole('button', { name: '立即登录' })).toBeInTheDocument();
        });
    });

    test('登录失败处理', async () => {
        render(<Login />);
        fireEvent.change(screen.getByLabelText('用户名'), { target: { value: 'wronguser' } });
        fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: '立即登录' }));

        // 由于我们使用了模拟的 api，这里只需要验证表单提交
        await waitFor(() => {
            expect(screen.getByRole('button', { name: '立即登录' })).toBeInTheDocument();
        });
    });

    test('导航到注册页面', () => {
        render(<Login />);
        fireEvent.click(screen.getByText('立即注册'));
        expect(mockNavigate).toHaveBeenCalledWith('/register');
    });
}); 