import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

    return (
        <nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
            <div className="font-bold text-xl cursor-pointer" onClick={() => navigate('/')}>盲盒商城</div>
            <div className="space-x-4">
                {user ? (
                    <>
                        <span>你好，{user.nickname}</span>
                        <button
                            className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
                            onClick={() => navigate('/profile')}
                        >个人中心</button>
                    </>
                ) : (
                    <>
                        <button
                            className="bg-green-500 px-3 py-1 rounded hover:bg-green-600"
                            onClick={() => navigate('/login')}
                        >登录</button>
                        <button
                            className="bg-gray-500 px-3 py-1 rounded hover:bg-gray-600 ml-2"
                            onClick={() => navigate('/register')}
                        >注册</button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
