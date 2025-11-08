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
import { useCreateProject } from '../../hooks/useProjects';
import { useClients } from '../../hooks/useClients';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { ApiClientError } from '../../lib/api-client';

function NewProjectComponent() {
  const navigate = useNavigate();
  const createProject = useCreateProject();
  const { data: clientsData, isLoading: loadingClients } = useClients({ limit: 100 });

  const [formData, setFormData] = useState({
    projectNumber: '',
    name: '',
    description: '',
    clientId: '',
    startDate: new Date().toISOString().split('T')[0],
    targetEndDate: '',
    status: 'planning' as const,
    priority: 'medium' as const,
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

    if (!formData.projectNumber.trim()) {
      newErrors.projectNumber = 'Project number is required';
    }
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
      await createProject.mutateAsync({
        projectNumber: formData.projectNumber,
        name: formData.name,
        description: formData.description || undefined,
        clientId: formData.clientId,
        startDate: formData.startDate,
        targetEndDate: formData.targetEndDate || undefined,
        status: formData.status,
        priority: formData.priority,
      });

      // Navigate back to projects list on success
      navigate({ to: '/projects' });
    } catch (err) {
      if (err instanceof ApiClientError) {
        setSubmitError(err.error.message);
      } else {
        setSubmitError('Failed to create project. Please try again.');
      }
    }
  };

  return (
    <ProtectedRoute requiredPermission="project:create">
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate({ to: '/projects' })}
            sx={{ mb: 2 }}
          >
            Back to Projects
          </Button>
          <Typography variant="h4" component="h1">
            Create New Project
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
                  onChange={handleChange('projectNumber')}
                  error={!!errors.projectNumber}
                  helperText={errors.projectNumber}
                  required
                  placeholder="PRJ-2024-001"
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
                  helperText={errors.clientId || 'Select the client for this project'}
                  required
                  disabled={loadingClients}
                >
                  {loadingClients ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : clientsData?.data.length === 0 ? (
                    <MenuItem disabled>No clients available</MenuItem>
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
                  placeholder="Pipeline Inspection - Main Street"
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
                  placeholder="Detailed description of the project scope and objectives..."
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

              <Grid item xs={12} sm={6}>
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

              <Grid item xs={12} sm={6}>
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

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate({ to: '/projects' })}
                    disabled={createProject.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={createProject.isPending}
                  >
                    {createProject.isPending ? 'Creating...' : 'Create Project'}
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

export const Route = createFileRoute('/projects/new')({
  component: NewProjectComponent,
});
