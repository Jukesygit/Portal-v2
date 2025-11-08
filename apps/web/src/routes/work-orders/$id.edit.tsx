import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useWorkOrder, useUpdateWorkOrder } from '../../hooks/useWorkOrders';
import { useProjects } from '../../hooks/useProjects';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useNotification } from '../../contexts/NotificationContext';
import { ApiClientError } from '../../lib/api-client';

function EditWorkOrderComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const updateWorkOrder = useUpdateWorkOrder();
  const { data: workOrder, isLoading: loadingWorkOrder } = useWorkOrder(id);
  const { data: projectsData, isLoading: loadingProjects } = useProjects({ limit: 100 });

  const [formData, setFormData] = useState<{
    description: string;
    startDate: string;
    targetEndDate: string;
    actualEndDate: string;
    status: 'pending' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignedTo: string;
  }>({
    description: '',
    startDate: '',
    targetEndDate: '',
    actualEndDate: '',
    status: 'pending',
    priority: 'medium',
    assignedTo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Populate form when work order data loads
  useEffect(() => {
    if (workOrder) {
      const startDate = workOrder.startDate?.split('T')[0] || '';
      const targetEndDate = workOrder.targetEndDate?.split('T')[0] || '';
      const actualEndDate = workOrder.actualEndDate?.split('T')[0] || '';

      setFormData({
        description: workOrder.description,
        startDate,
        targetEndDate,
        actualEndDate,
        status: workOrder.status,
        priority: workOrder.priority,
        assignedTo: workOrder.assignedTo || '',
      });
    }
  }, [workOrder]);

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (formData.targetEndDate && formData.targetEndDate < formData.startDate) {
      newErrors.targetEndDate = 'Target end date must be after start date';
    }
    if (formData.actualEndDate && formData.actualEndDate < formData.startDate) {
      newErrors.actualEndDate = 'Actual end date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    try {
      await updateWorkOrder.mutateAsync({
        id,
        data: {
          description: formData.description,
          startDate: formData.startDate,
          targetEndDate: formData.targetEndDate || undefined,
          actualEndDate: formData.actualEndDate || undefined,
          status: formData.status,
          priority: formData.priority,
          assignedTo: formData.assignedTo || undefined,
        },
      });

      showSuccess('Work order updated successfully');
      navigate({ to: `/work-orders/${id}` });
    } catch (err) {
      if (err instanceof ApiClientError) {
        setSubmitError(err.error.message);
        showError(err.error.message);
      } else {
        const errorMsg = 'Failed to update work order. Please try again.';
        setSubmitError(errorMsg);
        showError(errorMsg);
      }
    }
  };

  if (loadingWorkOrder) {
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

  if (!workOrder) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Work order not found.</Alert>
      </Container>
    );
  }

  return (
    <ProtectedRoute requiredPermission="work_order:update">
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate({ to: `/work-orders/${id}` })}
            sx={{ mb: 2 }}
          >
            Back to Work Order
          </Button>
          <Typography variant="h4" component="h1">
            Edit Work Order: {workOrder.woNumber}
          </Typography>
        </Box>

        <Paper sx={{ p: 3 }}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {submitError}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <strong>Work Order Number:</strong> {workOrder.woNumber} (cannot be changed)
                  <br />
                  <strong>Project:</strong> {workOrder.project.name} (cannot be changed)
                </Alert>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  required
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleChange('description')}
                  error={!!errors.description}
                  helperText={errors.description || 'Describe the work to be performed'}
                  placeholder="Enter detailed description of the work order..."
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  required
                  value={formData.startDate}
                  onChange={handleChange('startDate')}
                  error={!!errors.startDate}
                  helperText={errors.startDate}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Target End Date"
                  type="date"
                  fullWidth
                  value={formData.targetEndDate}
                  onChange={handleChange('targetEndDate')}
                  error={!!errors.targetEndDate}
                  helperText={errors.targetEndDate}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Actual End Date"
                  type="date"
                  fullWidth
                  value={formData.actualEndDate}
                  onChange={handleChange('actualEndDate')}
                  error={!!errors.actualEndDate}
                  helperText={errors.actualEndDate || 'Set when work order is completed'}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Status"
                  fullWidth
                  required
                  value={formData.status}
                  onChange={handleChange('status')}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="on_hold">On Hold</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Priority"
                  fullWidth
                  required
                  value={formData.priority}
                  onChange={handleChange('priority')}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate({ to: `/work-orders/${id}` })}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={updateWorkOrder.isPending}
                  >
                    {updateWorkOrder.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </ProtectedRoute>
  );
}

export const Route = createFileRoute('/work-orders/$id/edit')({
  component: EditWorkOrderComponent,
});
