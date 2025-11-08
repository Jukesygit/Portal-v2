import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Box } from '@mui/material';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';

function RootComponent() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Outlet />
        </Box>
      </NotificationProvider>
    </AuthProvider>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
