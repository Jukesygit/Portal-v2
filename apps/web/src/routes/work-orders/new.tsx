import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
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
import { useCreateWorkOrder } from '../../hooks/useWorkOrders';
import { useProjects } from '../../hooks/useProjects';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useNotification } from '../../contexts/NotificationContext';
import { ApiClientError } from '../../lib/api-client';

function NewWorkOrderComponent() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const createWorkOrder = useCreateWorkOrder();
  const { data: projectsData, isLoading: loadingProjects } = useProjects({ limit: 100 });

  const [formData, setFormData] = useState({
    woNumber: '',
    projectId: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    targetEndDate: '',
    status: 'pending' as const,
    priority: 'medium' as const,
    assignedTo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear error for this field
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

    if (!formData.woNumber.trim()) {
      newErrors.woNumber = 'Work order number is required';
    }
    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (formData.targetEndDate && formData.startDate && formData.targetEndDate < formData.startDate) {
      newErrors.targetEndDate = 'Target end date must be after start date';
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

    // After validation, we know required fields are populated
    if (!formData.startDate || !formData.woNumber || !formData.description || !formData.projectId) {
      return;
    }

    try {
      await createWorkOrder.mutateAsync({
        woNumber: formData.woNumber,
        projectId: formData.projectId,
        description: formData.description,
        startDate: formData.startDate,
        targetEndDate: formData.targetEndDate || undefined,
        status: formData.status,
        priority: formData.priority,
        assignedTo: formData.assignedTo || undefined,
      });

      showSuccess('Work order created successfully');
      navigate({ to: '/work-orders' });
    } catch (err) {
      if (err instanceof ApiClientError) {
        setSubmitError(err.error.message);
        showError(err.error.message);
      } else {
        const errorMsg = 'Failed to create work order. Please try again.';
        setSubmitError(errorMsg);
        showError(errorMsg);
      }
    }
  };

  return (
    <ProtectedRoute requiredPermission="work_order:create">
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate({ to: '/work-orders' })}
            sx={{ mb: 2 }}
          >
            Back to Work Orders
          </Button>
          <Typography variant="h4" component="h1">
            Create New Work Order
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
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Work Order Number"
                  fullWidth
                  required
                  value={formData.woNumber}
                  onChange={handleChange('woNumber')}
                  error={!!errors.woNumber}
                  helperText={errors.woNumber}
                  placeholder="e.g., WO-001"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Project"
                  fullWidth
                  required
                  value={formData.projectId}
                  onChange={handleChange('projectId')}
                  error={!!errors.projectId}
                  helperText={errors.projectId || 'Select the project for this work order'}
                  disabled={loadingProjects}
                >
                  {loadingProjects ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : (
                    projectsData?.data.map((project) => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.projectNumber} - {project.name}
                      </MenuItem>
                    ))
                  )}
                </TextField>
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
                    onClick={() => navigate({ to: '/work-orders' })}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={createWorkOrder.isPending}
                  >
                    {createWorkOrder.isPending ? 'Creating...' : 'Create Work Order'}
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

export const Route = createFileRoute('/work-orders/new')({
  component: NewWorkOrderComponent,
});
