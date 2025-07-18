import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Register from '../pages/user/Register';
import Login from '../pages/user/Login';
import Profile from '../pages/user/Profile';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Login />,
    },
    {
        path: '/register',
        element: <Register />,
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/profile',
        element: <Profile />,
    },
]);

export default router;