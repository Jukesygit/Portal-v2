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
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useCreateClient } from '../../hooks/useClients';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { ApiClientError } from '../../lib/api-client';

function NewClientComponent() {
  const navigate = useNavigate();
  const createClient = useCreateClient();

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
    notes: '',
    status: 'active' as const,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      newErrors.name = 'Client name is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
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
      await createClient.mutateAsync({
        name: formData.name,
        contactPerson: formData.contactPerson || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        postalCode: formData.postalCode || undefined,
        country: formData.country || undefined,
        notes: formData.notes || undefined,
        status: formData.status,
      });

      navigate({ to: '/clients' });
    } catch (err) {
      if (err instanceof ApiClientError) {
        setSubmitError(err.error.message);
      } else {
        setSubmitError('Failed to create client. Please try again.');
      }
    }
  };

  return (
    <ProtectedRoute requiredPermission="client:create">
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate({ to: '/clients' })}
            sx={{ mb: 2 }}
          >
            Back to Clients
          </Button>
          <Typography variant="h4" component="h1">
            Create New Client
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Client Name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                  placeholder="ACME Corporation"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Person"
                  value={formData.contactPerson}
                  onChange={handleChange('contactPerson')}
                  placeholder="John Doe"
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
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="prospect">Prospect</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  error={!!errors.email}
                  helperText={errors.email}
                  placeholder="contact@acme.com"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  placeholder="+1 (555) 123-4567"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.address}
                  onChange={handleChange('address')}
                  placeholder="123 Main Street"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={handleChange('city')}
                  placeholder="Houston"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="State/Province"
                  value={formData.state}
                  onChange={handleChange('state')}
                  placeholder="TX"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  value={formData.postalCode}
                  onChange={handleChange('postalCode')}
                  placeholder="77001"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Country"
                  value={formData.country}
                  onChange={handleChange('country')}
                  placeholder="USA"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={formData.notes}
                  onChange={handleChange('notes')}
                  multiline
                  rows={4}
                  placeholder="Additional notes about this client..."
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate({ to: '/clients' })}
                    disabled={createClient.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={createClient.isPending}
                  >
                    {createClient.isPending ? 'Creating...' : 'Create Client'}
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

export const Route = createFileRoute('/clients/new')({
  component: NewClientComponent,
});
