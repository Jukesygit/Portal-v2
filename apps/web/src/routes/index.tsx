import { createFileRoute } from '@tanstack/react-router';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

export const Route = createFileRoute('/')({
  component: IndexComponent,
});

function IndexComponent() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 4,
          }}
        >
          <RocketLaunchIcon
            sx={{
              fontSize: 80,
              color: 'primary.main',
              mb: 3,
            }}
          />
          <Typography variant="h2" component="h1" gutterBottom>
            NDT Suite V2
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Enterprise-Grade NDT Management Platform
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
            Complete rebuild with React 19, TypeScript, and modern best practices.
            Your comprehensive solution for managing NDT projects, personnel, equipment,
            quality management, and compliance.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" size="large" startIcon={<RocketLaunchIcon />}>
              Get Started
            </Button>
            <Button variant="outlined" size="large">
              View Documentation
            </Button>
          </Box>
          <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              Phase 1 - Foundation & Core Infrastructure
              <br />
              Tech Stack: React 19 • TypeScript • TanStack Router • TanStack Query • MUI v7
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
