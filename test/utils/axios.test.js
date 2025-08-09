import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// 在本测试文件内重写对 axios 的 mock，以捕获 create 参数与拦截器
let capturedConfig;
let capturedRequestHandler;
let capturedResponseSuccess;
let capturedResponseFailure;

const mockApiInstance = {
  interceptors: {
    request: {
      use: (handler) => {
        capturedRequestHandler = handler;
      },
    },
    response: {
      use: (onSuccess, onError) => {
        capturedResponseSuccess = onSuccess;
        capturedResponseFailure = onError;
      },
    },
  },
};

const mockAxios = {
  create: vi.fn((config) => {
    capturedConfig = config;
    return mockApiInstance;
  }),
};

vi.mock('axios', () => ({
  default: mockAxios,
}));

describe('utils/axios 实际模块集成测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedConfig = undefined;
    capturedRequestHandler = undefined;
    capturedResponseSuccess = undefined;
    capturedResponseFailure = undefined;

    // 准备 window.localStorage 与 location
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });

    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应当以默认 baseURL 创建实例，并注册拦截器', async () => {
    await vi.resetModules();
    const { default: api } = await vi.importActual('../../src/utils/axios');
    expect(api).toBeDefined();

    expect(mockAxios.create).toHaveBeenCalledTimes(1);
    expect(capturedConfig).toBeDefined();
    expect(capturedConfig.baseURL).toBe('http://localhost:7001');
    expect(capturedConfig.timeout).toBe(10000);

    // 拦截器已注册
    expect(typeof capturedRequestHandler).toBe('function');
    expect(typeof capturedResponseSuccess).toBe('function');
    expect(typeof capturedResponseFailure).toBe('function');
  });

  it('请求拦截器应在存在 token 时添加 Authorization 头', async () => {
    await vi.resetModules();
    await vi.importActual('../../src/utils/axios');

    window.localStorage.getItem.mockReturnValue('test-token');
    const cfg = { headers: {} };
    const nextCfg = await capturedRequestHandler(cfg);
    expect(nextCfg.headers.Authorization).toBe('Bearer test-token');
  });

  it('请求拦截器在无 token 时不修改头', async () => {
    await vi.resetModules();
    await vi.importActual('../../src/utils/axios');

    window.localStorage.getItem.mockReturnValue(null);
    const cfg = { headers: {} };
    const nextCfg = await capturedRequestHandler(cfg);
    expect(nextCfg.headers.Authorization).toBeUndefined();
  });

  it('响应成功拦截器应透传响应', async () => {
    await vi.resetModules();
    await vi.importActual('../../src/utils/axios');

    const resp = { data: { ok: true } };
    const nextResp = await capturedResponseSuccess(resp);
    expect(nextResp).toBe(resp);
  });

  it('响应错误 401 时应清除本地并跳转登录', async () => {
    await vi.resetModules();
    await vi.importActual('../../src/utils/axios');

    const error = { response: { status: 401 } };
    await expect(capturedResponseFailure(error)).rejects.toBe(error);

    expect(window.localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('user');
    expect(window.location.href).toBe('/login');
  });
});
