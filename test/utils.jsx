import React from 'react';
import { render, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// 自定义渲染函数，包含路由上下文
export function renderWithRouter(ui, { route = '/' } = {}) {
  window.history.pushState({}, 'Test page', route);

  return render(ui, { wrapper: BrowserRouter });
}

// 带 act() 包装的渲染函数
export function renderWithAct(ui, { route = '/' } = {}) {
  let result;
  act(() => {
    window.history.pushState({}, 'Test page', route);
    result = render(ui, { wrapper: BrowserRouter });
  });
  return result;
}

// 模拟 API 响应
export const mockApiResponse = (data, status = 200) => {
  return Promise.resolve({
    data,
    status,
    ok: status >= 200 && status < 300,
  });
};

// 模拟 API 错误
export const mockApiError = (message = 'API Error', status = 500) => {
  return Promise.reject({
    message,
    status,
    response: { data: { message } },
  });
};

// 等待异步操作完成
export const waitFor = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

// 带 act() 的等待函数
export const waitForWithAct = async (callback, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      try {
        const result = callback();
        if (result) {
          resolve(result);
          return;
        }
      } catch {
        // 继续尝试
      }
      
      if (Date.now() - startTime > timeout) {
        reject(new Error('waitForWithAct timeout'));
        return;
      }
      
      setTimeout(check, 10);
    };
    
    check();
  });
};

// 模拟用户事件
export const userEvent = {
  click: (element) => element.click(),
  type: (element, text) => {
    element.value = text;
    element.dispatchEvent(new Event('input', { bubbles: true }));
  },
  submit: (form) => form.dispatchEvent(new Event('submit', { bubbles: true })),
};

// 测试数据
export const testData = {
  user: {
    id: 1,
    username: 'testuser',
    nickname: 'Test User',
    balance: 100.00,
    role: 'customer',
  },
  rechargeRecords: [
    {
      recharge_id: 1,
      recharge_amount: 50.00,
      recharge_status: 'success',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      recharge_id: 2,
      recharge_amount: 100.00,
      recharge_status: 'pending',
      created_at: '2024-01-02T00:00:00Z',
    },
  ],
}; 