import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export const AuthGuard: React.FC = () => {
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Protection for Admin routes
    if (window.location.pathname === '/admin' && user?.role !== 'admin') {
        return <Navigate to="/tabs/jingxin" replace />;
    }

    return <Outlet />;
};
