import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="bg-blue-600 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-xl font-bold">盲盒商城</Link>

                <div className="flex items-center space-x-4">
                    {user ? (
                        <>
                            <span>欢迎, {user.nickname}</span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                            >
                                退出
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:underline">登录</Link>
                            <Link to="/register" className="hover:underline">注册</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
