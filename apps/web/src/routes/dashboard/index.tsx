import { createFileRoute } from '@tantml:router';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  AccountCircle,
  Dashboard as DashboardIcon,
  Assignment,
  Business,
  Assessment,
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from '@tanstack/react-router';
import { ProtectedRoute } from '../../components/ProtectedRoute';

function DashboardComponent() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/login' });
  };

  return (
    <ProtectedRoute>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <DashboardIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              NDT Suite
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">
                {user?.profile.firstName} {user?.profile.lastName}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  bgcolor: 'primary.dark',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                }}
              >
                {user?.role.toUpperCase()}
              </Typography>
              <IconButton
                size="large"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleClose}>Settings</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.profile.firstName}!
          </Typography>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            {/* Projects Card */}
            <Grid item xs={12} md={6} lg={3}>
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                onClick={() => navigate({ to: '/projects' })}
              >
                <Assignment sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Projects
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Manage your NDT projects
                </Typography>
              </Paper>
            </Grid>

            {/* Work Orders Card */}
            <Grid item xs={12} md={6} lg={3}>
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                onClick={() => navigate({ to: '/work-orders' })}
              >
                <DashboardIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Work Orders
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Track work assignments
                </Typography>
              </Paper>
            </Grid>

            {/* Clients Card */}
            <Grid item xs={12} md={6} lg={3}>
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                onClick={() => navigate({ to: '/clients' })}
              >
                <Business sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Clients
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Manage client database
                </Typography>
              </Paper>
            </Grid>

            {/* Reports Card */}
            <Grid item xs={12} md={6} lg={3}>
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Assessment sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Reports
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  View analytics
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Recent Activity Section */}
          <Paper sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No recent activity to display
            </Typography>
          </Paper>
        </Container>
      </Box>
    </ProtectedRoute>
  );
}

export const Route = createFileRoute('/dashboard/')({
  component: DashboardComponent,
});
