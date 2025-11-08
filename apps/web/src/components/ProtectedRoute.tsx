import { ReactNode } from 'react';
import { Navigate } from '@tanstack/react-router';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAll?: boolean;
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredPermissions,
  requireAll = false,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check single permission
  if (requiredPermission && !user.permissions.includes(requiredPermission)) {
    return <Navigate to="/unauthorized" />;
  }

  // Check multiple permissions
  if (requiredPermissions) {
    const hasPermissions = requireAll
      ? requiredPermissions.every((p) => user.permissions.includes(p))
      : requiredPermissions.some((p) => user.permissions.includes(p));

    if (!hasPermissions) {
      return <Navigate to="/unauthorized" />;
    }
  }

  return <>{children}</>;
}
