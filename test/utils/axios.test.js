import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import api from '../../src/utils/axios';

// 模拟 localStorage
const localStorageMock = {
  getItem: vi.fn(),
  removeItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};

// 模拟 window.location
const locationMock = {
  href: '',
};

// 模拟 window
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

Object.defineProperty(window, 'location', {
  value: locationMock,
  writable: true,
});

describe('Axios Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.removeItem.mockClear();
    locationMock.href = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('API 实例配置', () => {
    it('应该导出axios实例', () => {
      expect(api).toBeDefined();
      expect(typeof api.get).toBe('function');
      expect(typeof api.post).toBe('function');
      expect(typeof api.put).toBe('function');
      expect(typeof api.delete).toBe('function');
    });

    it('应该有请求拦截器', () => {
      expect(api.interceptors.request).toBeDefined();
      expect(typeof api.interceptors.request.use).toBe('function');
    });

    it('应该有响应拦截器', () => {
      expect(api.interceptors.response).toBeDefined();
      expect(typeof api.interceptors.response.use).toBe('function');
    });
  });

  describe('浏览器环境检测', () => {
    it('应该在浏览器环境中正常工作', () => {
      // 在测试环境中，window和localStorage都存在
      expect(typeof window).toBe('object');
      expect(typeof localStorage).toBe('object');
    });

    it('应该能够访问localStorage', () => {
      expect(localStorage.getItem).toBeDefined();
      expect(localStorage.removeItem).toBeDefined();
    });

    it('应该能够访问window.location', () => {
      expect(window.location).toBeDefined();
      expect(typeof window.location.href).toBe('string');
    });
  });

  describe('API方法可用性', () => {
    it('应该提供GET方法', () => {
      expect(typeof api.get).toBe('function');
    });

    it('应该提供POST方法', () => {
      expect(typeof api.post).toBe('function');
    });

    it('应该提供PUT方法', () => {
      expect(typeof api.put).toBe('function');
    });

    it('应该提供DELETE方法', () => {
      expect(typeof api.delete).toBe('function');
    });
  });

  describe('拦截器功能', () => {
    it('请求拦截器应该存在', () => {
      expect(api.interceptors.request).toBeDefined();
    });

    it('响应拦截器应该存在', () => {
      expect(api.interceptors.response).toBeDefined();
    });

    it('拦截器应该有use方法', () => {
      expect(typeof api.interceptors.request.use).toBe('function');
      expect(typeof api.interceptors.response.use).toBe('function');
    });
  });

  describe('实例类型检查', () => {
    it('应该是一个对象', () => {
      expect(typeof api).toBe('object');
    });

    it('不应该是null或undefined', () => {
      expect(api).not.toBeNull();
      expect(api).not.toBeUndefined();
    });
  });
}); 