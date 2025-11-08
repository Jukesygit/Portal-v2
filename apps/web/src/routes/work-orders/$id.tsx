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
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useWorkOrder, useDeleteWorkOrder } from '../../hooks/useWorkOrders';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const statusColors: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
  pending: 'info',
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

function WorkOrderDetailComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { data: workOrder, isLoading, error } = useWorkOrder(id);
  const deleteWorkOrder = useDeleteWorkOrder();

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete work order ${workOrder?.woNumber}?`
      )
    ) {
      try {
        await deleteWorkOrder.mutateAsync(id);
        showSuccess('Work order deleted successfully');
        navigate({ to: '/work-orders' });
      } catch (err) {
        showError('Failed to delete work order');
      }
    }
  };

  const canUpdate = hasPermission('work_order:update');
  const canDelete = hasPermission('work_order:delete');

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

  if (error || !workOrder) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Failed to load work order details.</Alert>
      </Container>
    );
  }

  return (
    <ProtectedRoute requiredPermission="work_order:read">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate({ to: '/work-orders' })}
            sx={{ mb: 2 }}
          >
            Back to Work Orders
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
                {workOrder.woNumber}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip
                  label={workOrder.status.replace('_', ' ')}
                  color={statusColors[workOrder.status]}
                  size="medium"
                />
                <Chip
                  label={workOrder.priority}
                  color={priorityColors[workOrder.priority]}
                  size="medium"
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {canUpdate && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => navigate({ to: `/work-orders/${id}/edit` })}
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
                  disabled={deleteWorkOrder.isPending}
                >
                  Delete
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Work Order Information */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Work Order Details
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {workOrder.description}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Start Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(workOrder.startDate).toLocaleDateString()}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Target End Date
                  </Typography>
                  <Typography variant="body1">
                    {workOrder.targetEndDate
                      ? new Date(workOrder.targetEndDate).toLocaleDateString()
                      : 'Not set'}
                  </Typography>
                </Grid>

                {workOrder.actualEndDate && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Actual End Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(workOrder.actualEndDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Assigned To
                  </Typography>
                  <Typography variant="body1">
                    {workOrder.assignedToUser
                      ? `${workOrder.assignedToUser.profile.firstName} ${workOrder.assignedToUser.profile.lastName} (${workOrder.assignedToUser.email})`
                      : 'Unassigned'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body1">
                    {new Date(workOrder.createdAt).toLocaleString()}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1">
                    {new Date(workOrder.updatedAt).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Project Information */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentIcon />
                  Project
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Typography variant="subtitle2" color="text.secondary">
                  Project Name
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {workOrder.project.name}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Project Number
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {workOrder.project.projectNumber}
                </Typography>

                {workOrder.project.client && (
                  <>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                      Client
                    </Typography>
                    <Typography variant="body1">
                      {workOrder.project.client.name}
                    </Typography>
                  </>
                )}

                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  sx={{ mt: 3 }}
                  onClick={() => navigate({ to: `/projects/${workOrder.projectId}` })}
                >
                  View Project
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </ProtectedRoute>
  );
}

export const Route = createFileRoute('/work-orders/$id')({
  component: WorkOrderDetailComponent,
});
