import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Breadcrumbs,
  Link,
  Chip,
  IconButton,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Tooltip,
  InputBase,
  Paper,
  Divider,
} from '@mui/material';
import {
  Home as HomeIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  AccountBalance as AccountBalanceIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Gavel as GavelIcon,
  AttachMoney as AttachMoneyIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  HelpOutline as HelpOutlineIcon,
  Language as LanguageIcon,
  AccessTime as AccessTimeIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';

/**
 * @component OpenGovHeaderBasic
 * @category OpenGov Headers
 * @description Basic header for OpenGov platform pages
 */
export const OpenGovHeaderBasic = ({ 
  title, 
  department, 
  lastUpdated,
  breadcrumbs = []
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      {breadcrumbs.length > 0 && (
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link underline="hover" color="inherit" href="/" sx={{ display: 'flex', alignItems: 'center' }}>
            <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
            Home
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <Link
              key={index}
              underline="hover"
              color={index === breadcrumbs.length - 1 ? 'text.primary' : 'inherit'}
              href={crumb.href}
            >
              {crumb.label}
            </Link>
          ))}
        </Breadcrumbs>
      )}
      
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {title}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            {department && (
              <Chip
                icon={<AccountBalanceIcon />}
                label={department}
                size="small"
                variant="outlined"
              />
            )}
            {lastUpdated && (
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                Last updated: {lastUpdated}
              </Typography>
            )}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

/**
 * @component OpenGovHeaderWithSearch
 * @category OpenGov Headers
 * @description Header with integrated search for data exploration
 */
export const OpenGovHeaderWithSearch = ({ 
  title, 
  subtitle,
  onSearch,
  searchPlaceholder = "Search public records...",
  totalRecords,
  filters
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  return (
    <Box sx={{ mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {totalRecords && (
          <Chip
            label={`${totalRecords.toLocaleString()} Records`}
            color="primary"
            variant="outlined"
          />
        )}
      </Box>

      <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <SearchIcon color="action" />
        <InputBase
          sx={{ flex: 1 }}
          placeholder={searchPlaceholder}
          onChange={(e) => onSearch?.(e.target.value)}
        />
        <Divider orientation="vertical" flexItem />
        <Button
          startIcon={<FilterListIcon />}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          Filters {filters?.length > 0 && `(${filters.length})`}
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem>Date Range</MenuItem>
          <MenuItem>Department</MenuItem>
          <MenuItem>Document Type</MenuItem>
          <MenuItem>Status</MenuItem>
        </Menu>
      </Paper>
    </Box>
  );
};

/**
 * @component OpenGovHeaderBudget
 * @category OpenGov Headers
 * @description Specialized header for budget and financial pages
 */
export const OpenGovHeaderBudget = ({ 
  title,
  fiscalYear,
  totalBudget,
  status,
  actions,
  comparisonData
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Stack direction="row" spacing={2} alignItems="center" mb={1}>
            <Typography variant="h4" component="h1">
              {title}
            </Typography>
            <Chip
              label={`FY ${fiscalYear}`}
              color="primary"
              size="small"
            />
            {status && (
              <Chip
                label={status}
                color={status === 'Approved' ? 'success' : 'warning'}
                size="small"
                icon={status === 'Approved' ? <VerifiedIcon /> : undefined}
              />
            )}
          </Stack>
          
          <Typography variant="h5" color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <AttachMoneyIcon />
            {totalBudget}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
          >
            Share
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
          >
            Export
          </Button>
          {actions}
        </Stack>
      </Box>

      {comparisonData && (
        <Stack direction="row" spacing={3}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              vs Last Year
            </Typography>
            <Typography
              variant="body1"
              color={comparisonData.change > 0 ? 'success.main' : 'error.main'}
            >
              {comparisonData.change > 0 ? '+' : ''}{comparisonData.change}%
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Per Capita
            </Typography>
            <Typography variant="body1">
              ${comparisonData.perCapita}
            </Typography>
          </Box>
        </Stack>
      )}
    </Box>
  );
};

/**
 * @component OpenGovHeaderDashboard
 * @category OpenGov Headers
 * @description Main dashboard header with user actions and notifications
 */
export const OpenGovHeaderDashboard = ({ 
  userName,
  userRole,
  userAvatar,
  notifications = 0,
  quickStats,
  onNotificationClick,
  onProfileClick
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            OpenGov Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {userName}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          <Tooltip title="Help & Documentation">
            <IconButton>
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Notifications">
            <IconButton onClick={onNotificationClick}>
              <Badge badgeContent={notifications} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Chip
            avatar={<Avatar src={userAvatar} alt={userName}>{userName?.[0]}</Avatar>}
            label={userRole}
            onClick={onProfileClick}
            variant="outlined"
          />
        </Stack>
      </Box>

      {quickStats && (
        <Stack direction="row" spacing={3} divider={<Divider orientation="vertical" flexItem />}>
          {quickStats.map((stat, index) => (
            <Box key={index}>
              <Stack direction="row" spacing={1} alignItems="center">
                {stat.icon}
                <Box>
                  <Typography variant="h6">{stat.value}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

/**
 * @component OpenGovHeaderCompliance
 * @category OpenGov Headers
 * @description Header for compliance and regulatory pages
 */
export const OpenGovHeaderCompliance = ({ 
  title,
  complianceStatus,
  deadline,
  responsibleDepartment,
  lastAudit,
  actions
}) => {
  const getStatusColor = () => {
    switch (complianceStatus) {
      case 'Compliant': return 'success';
      case 'Pending': return 'warning';
      case 'Non-Compliant': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <GavelIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h4" component="h1">
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {responsibleDepartment}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={3}>
            <Chip
              label={complianceStatus}
              color={getStatusColor()}
              size="medium"
            />
            
            {deadline && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Next Deadline
                </Typography>
                <Typography variant="body2">
                  {deadline}
                </Typography>
              </Box>
            )}

            {lastAudit && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Last Audit
                </Typography>
                <Typography variant="body2">
                  {lastAudit}
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>

        <Stack direction="row" spacing={1}>
          {actions}
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
};

/**
 * @component OpenGovHeaderPublicMeeting
 * @category OpenGov Headers
 * @description Header for public meeting pages with streaming/recording info
 */
export const OpenGovHeaderPublicMeeting = ({ 
  meetingTitle,
  meetingType,
  date,
  time,
  location,
  isLive,
  attendeeCount,
  agendaItems,
  onJoinClick,
  onAgendaClick
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        {isLive && (
          <Chip
            label="LIVE NOW"
            color="error"
            size="small"
            sx={{ 
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.7 },
                '100%': { opacity: 1 },
              }
            }}
          />
        )}
        <Chip
          label={meetingType}
          variant="outlined"
          size="small"
        />
      </Stack>

      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {meetingTitle}
          </Typography>
          
          <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
            <Typography variant="body1" color="text.secondary">
              <strong>Date:</strong> {date}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              <strong>Time:</strong> {time}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              <strong>Location:</strong> {location}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2}>
            {attendeeCount && (
              <Chip
                icon={<PeopleIcon />}
                label={`${attendeeCount} Attending`}
                size="small"
                variant="outlined"
              />
            )}
            {agendaItems && (
              <Chip
                label={`${agendaItems} Agenda Items`}
                size="small"
                variant="outlined"
              />
            )}
          </Stack>
        </Box>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            onClick={onAgendaClick}
          >
            View Agenda
          </Button>
          <Button
            variant="contained"
            color={isLive ? 'error' : 'primary'}
            onClick={onJoinClick}
          >
            {isLive ? 'Join Live' : 'Register'}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};