import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Box } from '@mui/material';
import { AuthProvider } from '../contexts/AuthContext';

function RootComponent() {
  return (
    <AuthProvider>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Outlet />
      </Box>
    </AuthProvider>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
