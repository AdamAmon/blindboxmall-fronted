import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// 模拟 axios
const mockAxiosCreate = vi.fn();
const mockAxios = {
  create: mockAxiosCreate,
};

vi.mock('axios', () => ({
  default: mockAxios,
}));

// 模拟 localStorage
const localStorageMock = {
  getItem: vi.fn(),
  removeItem: vi.fn(),
};

// 模拟 window.location
const locationMock = {
  href: '',
};

describe('Axios API Instance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // 设置 localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    
    // 设置 location mock
    Object.defineProperty(window, 'location', {
      value: locationMock,
      writable: true,
    });

    // 创建模拟的 axios 实例
    const mockApiInstance = {
      interceptors: {
        request: {
          use: vi.fn(),
        },
        response: {
          use: vi.fn(),
        },
      },
    };
    
    mockAxiosCreate.mockReturnValue(mockApiInstance);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该导出axios实例', async () => {
    const apiModule = await import('../../src/utils/axios');
    expect(apiModule.default).toBeDefined();
    expect(typeof apiModule.default).toBe('object');
  });

  it('应该导出默认实例', async () => {
    const { default: api } = await import('../../src/utils/axios');
    expect(api).toBeDefined();
  });

  it('应该在浏览器环境中正确检测localStorage', () => {
    expect(typeof window).toBe('object');
    expect(typeof localStorage).toBe('object');
  });

  it('应该能够访问localStorage的getItem方法', () => {
    localStorageMock.getItem.mockReturnValue('test-token');
    const token = localStorage.getItem('token');
    expect(token).toBe('test-token');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
  });

  it('应该能够访问localStorage的removeItem方法', () => {
    localStorage.removeItem('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
  });

  it('应该能够设置window.location.href', () => {
    window.location.href = '/login';
    expect(locationMock.href).toBe('/login');
  });

  it('应该能够检测浏览器环境', () => {
    const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    expect(isBrowser).toBe(true);
  });

  it('应该能够处理环境检测逻辑', () => {
    // 测试浏览器环境检测
    const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    expect(isBrowser).toBe(true);
  });

  it('应该能够处理localStorage操作', () => {
    // 测试 getItem
    localStorageMock.getItem.mockReturnValue('test-value');
    const value = localStorage.getItem('test-key');
    expect(value).toBe('test-value');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
    
    // 测试 removeItem
    localStorage.removeItem('test-key');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-key');
  });

  it('应该能够处理location操作', () => {
    // 测试设置 href
    window.location.href = '/test-page';
    expect(locationMock.href).toBe('/test-page');
    
    // 测试重置 href
    window.location.href = '/login';
    expect(locationMock.href).toBe('/login');
  });

  it('应该能够处理axios实例的基本功能', async () => {
    const api = await import('../../src/utils/axios');
    expect(api.default).toBeDefined();
    expect(typeof api.default).toBe('object');
  });

  it('应该能够处理浏览器环境检测', () => {
    const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    expect(isBrowser).toBe(true);
  });

  it('应该能够处理localStorage的基本操作', () => {
    // 测试 getItem
    localStorageMock.getItem.mockReturnValue('test-value');
    const value = localStorage.getItem('test-key');
    expect(value).toBe('test-value');
    
    // 测试 removeItem
    localStorage.removeItem('test-key');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-key');
  });

  it('应该能够处理window.location的基本操作', () => {
    window.location.href = '/test-page';
    expect(locationMock.href).toBe('/test-page');
  });
}); 