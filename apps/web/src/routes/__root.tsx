import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Box } from '@mui/material';

export const Route = createRootRoute({
  component: RootComponent,
});

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
