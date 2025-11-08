import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Box } from '@mui/material';

function RootComponent() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Outlet />
    </Box>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
