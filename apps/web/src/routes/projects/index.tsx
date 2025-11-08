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
import { useProjects, useDeleteProject } from '../../hooks/useProjects';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

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

function ProjectsListComponent() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const { data, isLoading, error } = useProjects({
    page: page + 1,
    limit: rowsPerPage,
    search: search || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
  });

  const deleteProject = useDeleteProject();

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id: string, projectNumber: string) => {
    if (window.confirm(`Are you sure you want to delete project ${projectNumber}?`)) {
      try {
        await deleteProject.mutateAsync(id);
        showSuccess('Project deleted successfully');
      } catch (err) {
        showError('Failed to delete project. It may have active work orders.');
      }
    }
  };

  const canCreate = hasPermission('project:create');
  const canUpdate = hasPermission('project:update');
  const canDelete = hasPermission('project:delete');

  return (
    <ProtectedRoute requiredPermission="project:read">
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Projects
          </Typography>
          {canCreate && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate({ to: '/projects/new' })}
            >
              New Project
            </Button>
          )}
        </Box>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Search"
              placeholder="Search projects..."
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
              <MenuItem value="planning">Planning</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="on_hold">On Hold</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
            <TextField
              select
              label="Priority"
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </TextField>
          </Stack>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Failed to load projects. Please try again.
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
                    <TableCell>Project #</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell align="center">Work Orders</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No projects found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.data.map((project) => (
                      <TableRow key={project.id} hover>
                        <TableCell>{project.projectNumber}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {project.name}
                          </Typography>
                          {project.description && (
                            <Typography variant="caption" color="text.secondary">
                              {project.description.substring(0, 60)}
                              {project.description.length > 60 ? '...' : ''}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{project.client.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={project.status.replace('_', ' ')}
                            size="small"
                            color={statusColors[project.status]}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={project.priority}
                            size="small"
                            color={priorityColors[project.priority]}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(project.startDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center">{project._count.workOrders}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => navigate({ to: `/projects/${project.id}` })}
                          >
                            <ViewIcon />
                          </IconButton>
                          {canUpdate && (
                            <IconButton
                              size="small"
                              onClick={() => navigate({ to: `/projects/${project.id}/edit` })}
                            >
                              <EditIcon />
                            </IconButton>
                          )}
                          {canDelete && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(project.id, project.projectNumber)}
                              disabled={deleteProject.isPending}
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

export const Route = createFileRoute('/projects/')({
  component: ProjectsListComponent,
});
