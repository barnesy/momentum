import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Button,
  TextField,
  InputAdornment,
  Tooltip,
  Badge,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';

export interface DashboardDataTableCardProps {
  title?: string;
  subtitle?: string;
  data: Array<Record<string, any>>;
  columns: Array<{
    field: string;
    headerName: string;
    width?: number;
    render?: (value: any, row: any) => React.ReactNode;
    sortable?: boolean;
  }>;
  loading?: boolean;
  error?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  showActions?: boolean;
  showPagination?: boolean;
  rowsPerPage?: number;
  onRowClick?: (row: any) => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onAdd?: () => void;
  onExport?: () => void;
  onRefresh?: () => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
}

export const DashboardDataTableCard: React.FC<DashboardDataTableCardProps> = ({
  title = 'Data Table',
  subtitle,
  data = [],
  columns = [],
  loading = false,
  error,
  showSearch = true,
  showFilters = true,
  showActions = true,
  showPagination = true,
  rowsPerPage = 10,
  onRowClick,
  onEdit,
  onDelete,
  onAdd,
  onExport,
  onRefresh,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No data available',
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter data based on search term
  const filteredData = data.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sort data
  const sortedData = sortField
    ? [...filteredData].sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      })
    : filteredData;

  // Paginate data
  const paginatedData = showPagination
    ? sortedData.slice(page * rowsPerPage, (page + 1) * rowsPerPage)
    : sortedData;

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const renderCell = (column: any, row: any) => {
    if (column.render) {
      return column.render(row[column.field], row);
    }
    return row[column.field];
  };

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <Card className={className} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" component="h2">
              {title}
            </Typography>
            {loading && <LinearProgress sx={{ flex: 1, ml: 2 }} />}
          </Box>
        }
        subheader={subtitle}
        action={
          showActions && (
            <Stack direction="row" spacing={1}>
              {onRefresh && (
                <Tooltip title="Refresh">
                  <IconButton size="small" onClick={onRefresh} disabled={loading}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              )}
              {onExport && (
                <Tooltip title="Export">
                  <IconButton size="small" onClick={onExport}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              )}
              {onAdd && (
                <Tooltip title="Add New">
                  <IconButton size="small" onClick={onAdd} color="primary">
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          )
        }
      />
      
      <CardContent sx={{ flex: 1, p: 0 }}>
        {/* Search and Filters */}
        {(showSearch || showFilters) && (
          <Box sx={{ p: 2, pb: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              {showSearch && (
                <TextField
                  size="small"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 200 }}
                />
              )}
              {showFilters && (
                <Button
                  size="small"
                  startIcon={<FilterIcon />}
                  variant="outlined"
                  disabled={loading}
                >
                  Filters
                </Button>
              )}
              <Box sx={{ flex: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {filteredData.length} of {data.length} records
              </Typography>
            </Stack>
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {/* Data Table */}
        <TableContainer component={Paper} sx={{ flex: 1 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.field}
                    sx={{
                      fontWeight: 'bold',
                      cursor: column.sortable ? 'pointer' : 'default',
                      userSelect: 'none',
                      width: column.width,
                    }}
                    onClick={() => column.sortable && handleSort(column.field)}
                  >
                    <Box display="flex" alignItems="center" gap={0.5}>
                      {column.headerName}
                      {column.sortable && renderSortIcon(column.field)}
                    </Box>
                  </TableCell>
                ))}
                {showActions && <TableCell align="right" width={80}>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (showActions ? 1 : 0)} align="center">
                    <Box sx={{ py: 4 }}>
                      <LinearProgress />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Loading...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (showActions ? 1 : 0)} align="center">
                    <Box sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm ? 'No results found' : emptyMessage}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, index) => (
                  <TableRow
                    key={row.id || index}
                    hover
                    onClick={() => onRowClick?.(row)}
                    sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    {columns.map((column) => (
                      <TableCell key={column.field}>
                        {renderCell(column, row)}
                      </TableCell>
                    ))}
                    {showActions && (
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5}>
                          {onEdit && (
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(row);
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {onDelete && (
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(row);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {showPagination && filteredData.length > rowsPerPage && (
          <Box sx={{ p: 2, pt: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, filteredData.length)} of {filteredData.length} results
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  disabled={page === 0}
                  onClick={() => handlePageChange(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="small"
                  disabled={(page + 1) * rowsPerPage >= filteredData.length}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardDataTableCard; 