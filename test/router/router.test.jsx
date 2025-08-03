import { describe, it, expect, vi } from 'vitest';

// 模拟所有页面组件
vi.mock('../../src/pages/user/Login', () => ({
  default: () => <div data-testid="login">Login</div>,
}));

vi.mock('../../src/pages/user/Register', () => ({
  default: () => <div data-testid="register">Register</div>,
}));

vi.mock('../../src/pages/user/Profile', () => ({
  default: () => <div data-testid="profile">Profile</div>,
}));

vi.mock('../../src/pages/blindbox/BlindBoxList', () => ({
  default: () => <div data-testid="blindbox-list">BlindBoxList</div>,
}));

vi.mock('../../src/pages/blindbox/BlindBoxDetail', () => ({
  default: () => <div data-testid="blindbox-detail">BlindBoxDetail</div>,
}));

vi.mock('../../src/pages/seller/SellerDashboard', () => ({
  default: () => <div data-testid="seller-dashboard">SellerDashboard</div>,
}));

vi.mock('../../src/pages/seller/SellerStats', () => ({
  default: () => <div data-testid="seller-stats">SellerStats</div>,
}));

vi.mock('../../src/pages/seller/CreateBlindBox', () => ({
  default: () => <div data-testid="create-blindbox">CreateBlindBox</div>,
}));

vi.mock('../../src/pages/seller/ManageBlindBoxes', () => ({
  default: () => <div data-testid="manage-blindboxes">ManageBlindBoxes</div>,
}));

vi.mock('../../src/pages/seller/ManageBoxItems', () => ({
  default: () => <div data-testid="manage-box-items">ManageBoxItems</div>,
}));

vi.mock('../../src/pages/seller/CreateBoxItem', () => ({
  default: () => <div data-testid="create-box-item">CreateBoxItem</div>,
}));

vi.mock('../../src/pages/admin/AdminDashboard', () => ({
  default: () => <div data-testid="admin-dashboard">AdminDashboard</div>,
}));

vi.mock('../../src/pages/cart/Cart', () => ({
  default: () => <div data-testid="cart">Cart</div>,
}));

vi.mock('../../src/pages/order/OrderConfirm', () => ({
  default: () => <div data-testid="order-confirm">OrderConfirm</div>,
}));

vi.mock('../../src/pages/order/OrderList', () => ({
  default: () => <div data-testid="order-list">OrderList</div>,
}));

vi.mock('../../src/pages/order/OrderDetail', () => ({
  default: () => <div data-testid="order-detail">OrderDetail</div>,
}));

vi.mock('../../src/pages/user/PrizeList', () => ({
  default: () => <div data-testid="prize-list">PrizeList</div>,
}));

vi.mock('../../src/pages/community/PlayerShowList', () => ({
  default: () => <div data-testid="player-show-list">PlayerShowList</div>,
}));

vi.mock('../../src/pages/community/PlayerShowDetail', () => ({
  default: () => <div data-testid="player-show-detail">PlayerShowDetail</div>,
}));

vi.mock('../../src/pages/community/PlayerShowCreate', () => ({
  default: () => <div data-testid="player-show-create">PlayerShowCreate</div>,
}));

vi.mock('../../src/pages/coupon/CouponCenter', () => ({
  default: () => <div data-testid="coupon-center">CouponCenter</div>,
}));

vi.mock('../../src/pages/coupon/MyCoupons', () => ({
  default: () => <div data-testid="my-coupons">MyCoupons</div>,
}));

vi.mock('../../src/pages/coupon/CouponManage', () => ({
  default: () => <div data-testid="coupon-manage">CouponManage</div>,
}));

vi.mock('../../src/components/ErrorBoundary', () => ({
  default: () => <div data-testid="error-boundary">ErrorBoundary</div>,
}));

vi.mock('../../src/router/routerGuards', () => ({
  ProtectedRoute: ({ children }) => <div data-testid="protected-route">{children}</div>,
  RedirectIfLoggedIn: ({ children }) => <div data-testid="redirect-if-logged-in">{children}</div>,
}));

describe('Router Configuration', () => {
  it('应该成功导入router模块', async () => {
    const router = await import('../../src/router/router');
    expect(router.default).toBeDefined();
  });

  it('应该导出路由配置', async () => {
    const router = await import('../../src/router/router');
    expect(router.default).toBeDefined();
    expect(Array.isArray(router.default.routes)).toBe(true);
  });

  it('应该包含所有必要的路由', async () => {
    const router = await import('../../src/router/router');
    const routes = router.default.routes;
    
    // 检查主要路由是否存在
    const routePaths = routes[0].children.map(route => route.path);
    
    expect(routePaths).toContain('login');
    expect(routePaths).toContain('register');
    expect(routePaths).toContain('profile');
    expect(routePaths).toContain('blindboxes');
    expect(routePaths).toContain('cart');
    expect(routePaths).toContain('seller');
    expect(routePaths).toContain('admin');
  });

  it('应该正确配置根路由重定向', async () => {
    const router = await import('../../src/router/router');
    const routes = router.default.routes;
    const indexRoute = routes[0].children.find(route => route.index);
    
    expect(indexRoute).toBeDefined();
    expect(indexRoute.element.type.name).toBe('Navigate');
  });

  it('应该正确配置错误边界', async () => {
    const router = await import('../../src/router/router');
    const routes = router.default.routes;
    
    expect(routes[0].errorElement).toBeDefined();
  });
}); 