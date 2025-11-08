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
import { useWorkOrders, useDeleteWorkOrder } from '../../hooks/useWorkOrders';
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

function WorkOrdersListComponent() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  const { data, isLoading, error } = useWorkOrders({
    page: page + 1,
    limit: rowsPerPage,
    search: search || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    projectId: projectFilter || undefined,
  });

  const deleteWorkOrder = useDeleteWorkOrder();

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id: string, woNumber: string) => {
    if (window.confirm(`Are you sure you want to delete work order ${woNumber}?`)) {
      try {
        await deleteWorkOrder.mutateAsync(id);
        showSuccess('Work order deleted successfully');
      } catch (err) {
        showError('Failed to delete work order');
      }
    }
  };

  const canCreate = hasPermission('work_order:create');
  const canUpdate = hasPermission('work_order:update');
  const canDelete = hasPermission('work_order:delete');

  return (
    <ProtectedRoute requiredPermission="work_order:read">
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Work Orders
          </Typography>
          {canCreate && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate({ to: '/work-orders/new' })}
            >
              Create Work Order
            </Button>
          )}
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Search"
              placeholder="Search by WO number or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              sx={{ flexGrow: 1 }}
            />
            <TextField
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="on_hold">On Hold</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
            <TextField
              select
              label="Priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              size="small"
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

        {/* Loading State */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Failed to load work orders. Please try again.
          </Alert>
        )}

        {/* Table */}
        {!isLoading && !error && data && (
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>WO Number</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>Target End</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                        <Typography variant="body1" color="text.secondary">
                          No work orders found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.data.map((workOrder) => (
                      <TableRow key={workOrder.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {workOrder.woNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {workOrder.project.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {workOrder.project.projectNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 300,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {workOrder.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={workOrder.status.replace('_', ' ')}
                            color={statusColors[workOrder.status]}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={workOrder.priority}
                            color={priorityColors[workOrder.priority]}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {workOrder.assignedToUser ? (
                            <Typography variant="body2">
                              {workOrder.assignedToUser.profile.firstName}{' '}
                              {workOrder.assignedToUser.profile.lastName}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Unassigned
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(workOrder.startDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {workOrder.targetEndDate
                            ? new Date(workOrder.targetEndDate).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => navigate({ to: `/work-orders/${workOrder.id}` })}
                            title="View details"
                          >
                            <ViewIcon />
                          </IconButton>
                          {canUpdate && (
                            <IconButton
                              size="small"
                              onClick={() => navigate({ to: `/work-orders/${workOrder.id}/edit` })}
                              title="Edit"
                            >
                              <EditIcon />
                            </IconButton>
                          )}
                          {canDelete && (
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(workOrder.id, workOrder.woNumber)}
                              title="Delete"
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
            <TablePagination
              component="div"
              count={data.pagination.total}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 20, 50, 100]}
            />
          </Paper>
        )}
      </Container>
    </ProtectedRoute>
  );
}

export const Route = createFileRoute('/work-orders/')({
  component: WorkOrdersListComponent,
});
