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
import { useProject, useUpdateProject } from '../../hooks/useProjects';
import { useClients } from '../../hooks/useClients';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useNotification } from '../../contexts/NotificationContext';
import { ApiClientError } from '../../lib/api-client';

function EditProjectComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const updateProject = useUpdateProject(id);
  const { data: project, isLoading: loadingProject } = useProject(id);
  const { data: clientsData, isLoading: loadingClients } = useClients({ limit: 100 });

  const [formData, setFormData] = useState<{
    projectNumber: string;
    name: string;
    description: string;
    clientId: string;
    startDate: string;
    targetEndDate: string;
    actualEndDate: string;
    status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }>({
    projectNumber: '',
    name: '',
    description: '',
    clientId: '',
    startDate: '',
    targetEndDate: '',
    actualEndDate: '',
    status: 'planning',
    priority: 'medium',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Populate form when project data loads
  useEffect(() => {
    if (project) {
      const startDate = project.startDate?.split('T')[0] || '';
      const targetEndDate = project.targetEndDate?.split('T')[0] || '';
      const actualEndDate = project.actualEndDate?.split('T')[0] || '';

      setFormData({
        projectNumber: project.projectNumber,
        name: project.name,
        description: project.description || '',
        clientId: project.clientId,
        startDate,
        targetEndDate,
        actualEndDate,
        status: project.status,
        priority: project.priority,
      });
    }
  }, [project]);

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

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    if (!formData.clientId) {
      newErrors.clientId = 'Client is required';
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
      await updateProject.mutateAsync({
        name: formData.name,
        description: formData.description || undefined,
        clientId: formData.clientId,
        startDate: formData.startDate,
        targetEndDate: formData.targetEndDate || undefined,
        actualEndDate: formData.actualEndDate || undefined,
        status: formData.status,
        priority: formData.priority,
      });

      showSuccess('Project updated successfully');
      navigate({ to: `/projects/${id}` });
    } catch (err) {
      if (err instanceof ApiClientError) {
        setSubmitError(err.error.message);
        showError(err.error.message);
      } else {
        const errorMsg = 'Failed to update project. Please try again.';
        setSubmitError(errorMsg);
        showError(errorMsg);
      }
    }
  };

  if (loadingProject) {
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

  if (!project) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Project not found</Alert>
      </Container>
    );
  }

  return (
    <ProtectedRoute requiredPermission="project:update">
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate({ to: `/projects/${id}` })}
            sx={{ mb: 2 }}
          >
            Back to Project
          </Button>
          <Typography variant="h4" component="h1">
            Edit Project
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {project.projectNumber}
          </Typography>
        </Box>

        {submitError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {submitError}
          </Alert>
        )}

        <Paper sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Project Number"
                  value={formData.projectNumber}
                  disabled
                  helperText="Project number cannot be changed"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Client"
                  value={formData.clientId}
                  onChange={handleChange('clientId')}
                  error={!!errors.clientId}
                  helperText={errors.clientId}
                  required
                  disabled={loadingClients}
                >
                  {loadingClients ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : (
                    clientsData?.data.map((client) => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.name}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Project Name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={handleChange('description')}
                  multiline
                  rows={4}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={formData.status}
                  onChange={handleChange('status')}
                >
                  <MenuItem value="planning">Planning</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="on_hold">On Hold</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Priority"
                  value={formData.priority}
                  onChange={handleChange('priority')}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={formData.startDate}
                  onChange={handleChange('startDate')}
                  error={!!errors.startDate}
                  helperText={errors.startDate}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Target End Date"
                  value={formData.targetEndDate}
                  onChange={handleChange('targetEndDate')}
                  error={!!errors.targetEndDate}
                  helperText={errors.targetEndDate || 'Optional'}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Actual End Date"
                  value={formData.actualEndDate}
                  onChange={handleChange('actualEndDate')}
                  error={!!errors.actualEndDate}
                  helperText={errors.actualEndDate || 'Optional'}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate({ to: `/projects/${id}` })}
                    disabled={updateProject.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={updateProject.isPending}
                  >
                    {updateProject.isPending ? 'Saving...' : 'Save Changes'}
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

export const Route = createFileRoute('/projects/$id/edit')({
  component: EditProjectComponent,
});
