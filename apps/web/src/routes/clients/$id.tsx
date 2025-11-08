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
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useClient, useDeleteClient } from '../../hooks/useClients';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

function ClientDetailComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { data: client, isLoading, error } = useClient(id);
  const deleteClient = useDeleteClient();

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete client "${client?.name}"?`)) {
      try {
        await deleteClient.mutateAsync(id);
        showSuccess('Client deleted successfully');
        navigate({ to: '/clients' });
      } catch (err) {
        showError('Failed to delete client. It may have active projects.');
      }
    }
  };

  const canUpdate = hasPermission('client:update');
  const canDelete = hasPermission('client:delete');

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

  if (error || !client) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Failed to load client details.</Alert>
      </Container>
    );
  }

  return (
    <ProtectedRoute requiredPermission="client:read">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate({ to: '/clients' })}
            sx={{ mb: 2 }}
          >
            Back to Clients
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
                {client.name}
              </Typography>
              <Chip
                label={client.status}
                color={
                  client.status === 'active'
                    ? 'success'
                    : client.status === 'inactive'
                    ? 'default'
                    : 'info'
                }
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {canUpdate && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => navigate({ to: `/clients/${id}/edit` })}
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
                  disabled={deleteClient.isPending}
                >
                  Delete
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Contact Information */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {client.contactPerson && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Contact Person
                  </Typography>
                  <Typography variant="body1">{client.contactPerson}</Typography>
                </Box>
              )}

              {client.email && (
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Email
                    </Typography>
                    <Typography variant="body2">
                      <a href={`mailto:${client.email}`}>{client.email}</a>
                    </Typography>
                  </Box>
                </Box>
              )}

              {client.phone && (
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Phone
                    </Typography>
                    <Typography variant="body2">
                      <a href={`tel:${client.phone}`}>{client.phone}</a>
                    </Typography>
                  </Box>
                </Box>
              )}

              {(client.address || client.city || client.state || client.postalCode || client.country) && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <LocationIcon fontSize="small" color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Address
                    </Typography>
                    {client.address && (
                      <Typography variant="body2">{client.address}</Typography>
                    )}
                    <Typography variant="body2">
                      {[client.city, client.state].filter(Boolean).join(', ')}
                      {client.postalCode && ` ${client.postalCode}`}
                    </Typography>
                    {client.country && (
                      <Typography variant="body2">{client.country}</Typography>
                    )}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Notes */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Notes
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {client.notes ? (
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {client.notes}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No notes available
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Projects */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Projects ({client.projects?.length || 0})
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {client.projects && client.projects.length > 0 ? (
                <List>
                  {client.projects.map((project: any) => (
                    <ListItem
                      key={project.id}
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
                      onClick={() => navigate({ to: `/projects/${project.id}` })}
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
                              {project.projectNumber} - {project.name}
                            </Typography>
                            <Chip
                              label={project.status.replace('_', ' ')}
                              size="small"
                              color={
                                project.status === 'completed'
                                  ? 'success'
                                  : project.status === 'in_progress'
                                  ? 'warning'
                                  : 'default'
                              }
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {new Date(project.startDate).toLocaleDateString()} -{' '}
                            {project.targetEndDate
                              ? new Date(project.targetEndDate).toLocaleDateString()
                              : 'Ongoing'}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No projects for this client yet
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Metadata */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Metadata
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {new Date(client.createdAt).toLocaleString()}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body2">
                    {new Date(client.updatedAt).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </ProtectedRoute>
  );
}

export const Route = createFileRoute('/clients/$id')({
  component: ClientDetailComponent,
});
