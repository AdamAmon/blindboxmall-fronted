import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithRouter } from '../utils';
import Navbar from '../../src/components/Navbar';

// 模拟 react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('未登录状态', () => {
    it('应该显示登录和注册按钮', () => {
      renderWithRouter(<Navbar />);
      
      expect(screen.getByText('登录')).toBeInTheDocument();
      expect(screen.getByText('注册')).toBeInTheDocument();
      expect(screen.queryByText(/你好/)).not.toBeInTheDocument();
    });

    it('点击登录按钮应该导航到登录页面', () => {
      renderWithRouter(<Navbar />);
      
      const loginButton = screen.getByText('登录');
      fireEvent.click(loginButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('点击注册按钮应该导航到注册页面', () => {
      renderWithRouter(<Navbar />);
      
      const registerButton = screen.getByText('注册');
      fireEvent.click(registerButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });
  });

  describe('已登录状态', () => {
    beforeEach(() => {
      const mockUser = {
        nickname: '测试用户',
        username: 'testuser'
      };
      // 模拟 localStorage.getItem 返回用户数据
      window.localStorage.getItem.mockImplementation((key) => {
        if (key === 'user') {
          return JSON.stringify(mockUser);
        }
        return null;
      });
    });

    it('应该显示用户昵称和个人中心按钮', () => {
      renderWithRouter(<Navbar />);
      
      expect(screen.getByText('你好，测试用户')).toBeInTheDocument();
      expect(screen.getByText('个人中心')).toBeInTheDocument();
      expect(screen.queryByText('登录')).not.toBeInTheDocument();
      expect(screen.queryByText('注册')).not.toBeInTheDocument();
    });

    it('点击个人中心按钮应该导航到个人中心页面', () => {
      renderWithRouter(<Navbar />);
      
      const profileButton = screen.getByText('个人中心');
      fireEvent.click(profileButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
  });

  describe('品牌导航', () => {
    it('点击品牌名称应该导航到首页', () => {
      renderWithRouter(<Navbar />);
      
      const brandElement = screen.getByText('盲盒商城');
      fireEvent.click(brandElement);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('组件渲染', () => {
    it('应该正确渲染导航栏结构', () => {
      renderWithRouter(<Navbar />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveClass('flex', 'items-center', 'justify-between', 'p-4', 'bg-gray-800', 'text-white');
    });
  });
}); 