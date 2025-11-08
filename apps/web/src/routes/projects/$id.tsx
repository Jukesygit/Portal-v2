import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useProject, useDeleteProject } from '../../hooks/useProjects';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';

const statusColors: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
  planning: 'info',
  in_progress: 'warning',
  on_hold: 'default',
  completed: 'success',
  cancelled: 'error',
};

const priorityColors: Record<string, 'default' | 'info' | 'warning' | 'error'> = {
  low: 'info',
  medium: 'default',
  high: 'warning',
  urgent: 'error',
};

function ProjectDetailComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { data: project, isLoading, error } = useProject(id);
  const deleteProject = useDeleteProject();

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete project ${project?.projectNumber}?`
      )
    ) {
      try {
        await deleteProject.mutateAsync(id);
        navigate({ to: '/projects' });
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const canUpdate = hasPermission('project:update');
  const canDelete = hasPermission('project:delete');
  const canCreateWorkOrder = hasPermission('workorder:create');

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Failed to load project details.</Alert>
      </Container>
    );
  }

  return (
    <ProtectedRoute requiredPermission="project:read">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate({ to: '/projects' })}
            sx={{ mb: 2 }}
          >
            Back to Projects
          </Button>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {project.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {project.projectNumber}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {canUpdate && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => navigate({ to: `/projects/${id}/edit` })}
                >
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                  disabled={deleteProject.isPending}
                >
                  Delete
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Project Information */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Project Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={project.status.replace('_', ' ')}
                      color={statusColors[project.status]}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Priority
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={project.priority}
                      color={priorityColors[project.priority]}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Start Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(project.startDate).toLocaleDateString()}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Target End Date
                  </Typography>
                  <Typography variant="body1">
                    {project.targetEndDate
                      ? new Date(project.targetEndDate).toLocaleDateString()
                      : 'Not set'}
                  </Typography>
                </Grid>

                {project.actualEndDate && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Actual End Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(project.actualEndDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                )}

                {project.description && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {project.description}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>

            {/* Work Orders */}
            <Paper sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6">
                  Work Orders ({project._count.workOrders})
                </Typography>
                {canCreateWorkOrder && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() =>
                      navigate({ to: '/work-orders/new', search: { projectId: id } })
                    }
                  >
                    New Work Order
                  </Button>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />

              {project.workOrders && project.workOrders.length > 0 ? (
                <List>
                  {project.workOrders.map((wo: any) => (
                    <ListItem
                      key={wo.id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                      onClick={() => navigate({ to: `/work-orders/${wo.id}` })}
                    >
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Typography variant="body1" fontWeight="medium">
                              {wo.woNumber}
                            </Typography>
                            <Chip
                              label={wo.status.replace('_', ' ')}
                              size="small"
                              color={statusColors[wo.status]}
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {wo.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(wo.startDate).toLocaleDateString()} -{' '}
                              {wo.targetEndDate
                                ? new Date(wo.targetEndDate).toLocaleDateString()
                                : 'Ongoing'}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No work orders yet
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Client Information */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Client
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Typography variant="body1" fontWeight="medium" gutterBottom>
                {project.client.name}
              </Typography>

              {project.client.contactPerson && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Contact Person
                  </Typography>
                  <Typography variant="body2">
                    {project.client.contactPerson}
                  </Typography>
                </Box>
              )}

              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate({ to: `/clients/${project.clientId}` })}
              >
                View Client Details
              </Button>
            </Paper>

            {/* Metadata */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Metadata
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body2">
                  {new Date(project.createdAt).toLocaleString()}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body2">
                  {new Date(project.updatedAt).toLocaleString()}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </ProtectedRoute>
  );
}

export const Route = createFileRoute('/projects/$id')({
  component: ProjectDetailComponent,
});
