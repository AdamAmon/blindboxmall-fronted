import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';

const ErrorBoundary = () => {
    const error = useRouteError();
    const navigate = useNavigate();

    console.error('路由错误:', error);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-6xl mb-4">😵</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                    {error.status === 404 ? '页面未找到' : '应用错误'}
                </h1>
                <p className="text-gray-600 mb-6">
                    {error.status === 404 
                        ? '抱歉，您访问的页面不存在。' 
                        : '抱歉，应用出现了错误。'
                    }
                </p>
                <div className="space-y-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        返回上一页
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        返回首页
                    </button>
                </div>
                {import.meta.env.MODE === 'development' && (
                    <details className="mt-6 text-left">
                        <summary className="cursor-pointer text-sm text-gray-500">
                            错误详情 (开发模式)
                        </summary>
                        <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                            {JSON.stringify(error, null, 2)}
                        </pre>
                    </details>
                )}
            </div>
        </div>
    );
};

export default ErrorBoundary; 