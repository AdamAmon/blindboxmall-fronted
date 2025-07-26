import '@testing-library/jest-dom';
import { vi } from 'vitest';

// 模拟 matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 模拟 IntersectionObserver
window.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// 模拟 ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// 模拟 localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
window.localStorage = localStorageMock;

// 模拟 sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
window.sessionStorage = sessionStorageMock;

// 全局 mock axios，避免测试时真实请求后端
import axios from 'axios';
vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { code: 200, data: {} } })),
    post: vi.fn(() => Promise.resolve({ data: { code: 200, data: {} } })),
    put: vi.fn(() => Promise.resolve({ data: { code: 200, data: {} } })),
    delete: vi.fn(() => Promise.resolve({ data: { code: 200, data: {} } })),
    create: vi.fn(() => axios),
  }
})); 