import { createFileRoute, Navigate } from '@tanstack/react-router';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

function IndexComponent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to dashboard if authenticated, otherwise to login
  return user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
}

export const Route = createFileRoute('/')({
  component: IndexComponent,
});
