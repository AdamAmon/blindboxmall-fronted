import { useMemo, useState, useEffect, useRef } from 'react';

// 全局状态管理，避免重复监听
let globalUser = null;
let globalToken = null;
let listeners = new Set();

const updateGlobalState = () => {
    const userStr = localStorage.getItem('user');
    const newUser = userStr ? JSON.parse(userStr) : null;
    const newToken = localStorage.getItem('token');
    
    if (JSON.stringify(globalUser) !== JSON.stringify(newUser) || globalToken !== newToken) {
        globalUser = newUser;
        globalToken = newToken;
        // 通知所有监听器
        listeners.forEach(listener => listener());
    }
};

/**
 * 自定义 Hook：获取当前登录用户信息
 * 使用全局状态管理，避免重复渲染
 */
export const useUser = () => {
    const [user, setUser] = useState(() => {
        if (globalUser === null) {
            updateGlobalState();
        }
        return globalUser;
    });

    const listenerRef = useRef(() => {
        setUser(globalUser);
    });

    useEffect(() => {
        const listener = listenerRef.current;
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }, []);

    return user;
};

/**
 * 自定义 Hook：获取当前登录用户的 token
 * 使用全局状态管理
 */
export const useToken = () => {
    const [token, setToken] = useState(() => {
        if (globalToken === null) {
            updateGlobalState();
        }
        return globalToken;
    });

    const listenerRef = useRef(() => {
        setToken(globalToken);
    });

    useEffect(() => {
        const listener = listenerRef.current;
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }, []);

    return token;
};

/**
 * 自定义 Hook：检查用户是否已登录
 */
export const useIsLoggedIn = () => {
    const user = useUser();
    const token = useToken();
    return useMemo(() => !!(user && token), [user, token]);
};

/**
 * 工具函数：触发用户状态变化事件
 * 在登录、登出时调用此函数来通知所有组件更新
 */
export const triggerUserStateChange = () => {
    updateGlobalState();
}; 