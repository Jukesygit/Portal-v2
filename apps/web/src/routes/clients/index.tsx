import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  MenuItem,
  IconButton,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useClients, useDeleteClient } from '../../hooks/useClients';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';

function ClientsListComponent() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, error } = useClients({
    page: page + 1,
    limit: rowsPerPage,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const deleteClient = useDeleteClient();

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete client "${name}"?`)) {
      try {
        await deleteClient.mutateAsync(id);
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const canCreate = hasPermission('client:create');
  const canUpdate = hasPermission('client:update');
  const canDelete = hasPermission('client:delete');

  return (
    <ProtectedRoute requiredPermission="client:read">
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Clients
          </Typography>
          {canCreate && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate({ to: '/clients/new' })}
            >
              New Client
            </Button>
          )}
        </Box>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Search"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
            <TextField
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="prospect">Prospect</MenuItem>
            </TextField>
          </Stack>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Failed to load clients. Please try again.
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Contact Person</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Projects</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No clients found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.data.map((client) => (
                      <TableRow key={client.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {client.name}
                          </Typography>
                        </TableCell>
                        <TableCell>{client.contactPerson || '-'}</TableCell>
                        <TableCell>{client.email || '-'}</TableCell>
                        <TableCell>{client.phone || '-'}</TableCell>
                        <TableCell>
                          {client.city && client.state
                            ? `${client.city}, ${client.state}`
                            : client.city || client.state || '-'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={client.status}
                            size="small"
                            color={
                              client.status === 'active'
                                ? 'success'
                                : client.status === 'inactive'
                                ? 'default'
                                : 'info'
                            }
                          />
                        </TableCell>
                        <TableCell align="center">
                          {client._count?.projects || 0}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => navigate({ to: `/clients/${client.id}` })}
                          >
                            <ViewIcon />
                          </IconButton>
                          {canUpdate && (
                            <IconButton
                              size="small"
                              onClick={() => navigate({ to: `/clients/${client.id}/edit` })}
                            >
                              <EditIcon />
                            </IconButton>
                          )}
                          {canDelete && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(client.id, client.name)}
                              disabled={deleteClient.isPending}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {data && (
              <TablePagination
                component="div"
                count={data.pagination.total}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 20, 50, 100]}
              />
            )}
          </>
        )}
      </Container>
    </ProtectedRoute>
  );
}

export const Route = createFileRoute('/clients/')({
  component: ClientsListComponent,
});
