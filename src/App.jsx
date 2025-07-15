import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import './App.css';

function App() {
    const [count, setCount] = useState(0);

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-grow container mx-auto p-4">
                <Outlet />

                {/* 示例内容保留 */}
                <div className="text-center mt-8">
                    <div className="flex justify-center space-x-8 mb-6">
                        <a href="https://vite.dev" target="_blank" rel="noreferrer">
                            <img src="/vite.svg" className="logo" alt="Vite logo" />
                        </a>
                        <a href="https://react.dev" target="_blank" rel="noreferrer">
                            <img src="/react.svg" className="logo react" alt="React logo" />
                        </a>
                    </div>

                    <h1 className="text-3xl font-bold mb-4">Vite + React</h1>

                    <div className="card bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
                        <button
                            onClick={() => setCount((count) => count + 1)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            count is {count}
                        </button>
                        <p className="mt-4">
                            Edit <code>src/App.jsx</code> and save to test HMR
                        </p>
                    </div>

                    <p className="read-the-docs mt-6 text-gray-500">
                        Click on the Vite and React logos to learn more
                    </p>
                </div>
            </main>

            <footer className="bg-gray-100 py-4 text-center">
                <p>© 2025 盲盒商城 - 版权所有</p>
            </footer>
        </div>
    );
}

export default App;
