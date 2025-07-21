import React from 'react';
import {
  Box,
  TextField,
  Button,
  Stack,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Switch,
  InputAdornment,
  IconButton,
  Chip,
  Autocomplete,
  FormHelperText,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Clear as ClearIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';

/**
 * @component FormFieldGroup
 * @category Forms
 * @description Group of form fields with consistent spacing
 */
export const FormFieldGroup = ({ fields, values, onChange, errors = {} }) => {
  return (
    <Stack spacing={3}>
      {fields.map((field) => {
        if (field.type === 'select') {
          return (
            <FormControl key={field.name} fullWidth error={!!errors[field.name]}>
              <InputLabel>{field.label}</InputLabel>
              <Select
                name={field.name}
                value={values[field.name] || ''}
                onChange={onChange}
                label={field.label}
              >
                {field.options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {(field.helperText || errors[field.name]) && (
                <FormHelperText>{errors[field.name] || field.helperText}</FormHelperText>
              )}
            </FormControl>
          );
        }
        
        return (
          <TextField
            key={field.name}
            name={field.name}
            label={field.label}
            type={field.type || 'text'}
            value={values[field.name] || ''}
            onChange={onChange}
            required={field.required}
            error={!!errors[field.name]}
            helperText={errors[field.name] || field.helperText}
            fullWidth
            variant="outlined"
            multiline={field.multiline}
            rows={field.rows}
          />
        );
      })}
    </Stack>
  );
};

/**
 * @component SearchBarWithFilters
 * @category Forms
 * @description Search input with filter chips
 */
export const SearchBarWithFilters = ({ 
  placeholder = "Search...", 
  value,
  onChange,
  filters = [], 
  onFilterChange,
  onClear
}) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          variant="outlined"
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: value && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={onClear}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {filters.length > 0 && (
          <Stack direction="row" spacing={1} alignItems="center">
            <FilterListIcon fontSize="small" color="action" />
            {filters.map((filter) => (
              <Chip
                key={filter.value}
                label={filter.label}
                onClick={() => onFilterChange(filter)}
                color={filter.active ? 'primary' : 'default'}
                variant={filter.active ? 'filled' : 'outlined'}
                size="small"
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};

/**
 * @component LoginForm
 * @category Forms
 * @description Standard login form with email and password
 */
export const LoginForm = ({ onSubmit, loading = false }) => {
  const [values, setValues] = React.useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = React.useState(false);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <TextField
          name="email"
          label="Email"
          type="email"
          value={values.email}
          onChange={handleChange}
          required
          fullWidth
          autoComplete="email"
          autoFocus
        />
        <TextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={values.password}
          onChange={handleChange}
          required
          fullWidth
          autoComplete="current-password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </Stack>
    </Box>
  );
};

/**
 * @component FormSection
 * @category Forms
 * @description Section wrapper for forms with title and description
 */
export const FormSection = ({ title, description, children }) => {
  return (
    <Box sx={{ mb: 4 }}>
      {(title || description) && (
        <Box sx={{ mb: 3 }}>
          {title && (
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
          )}
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
      )}
      {children}
    </Box>
  );
};

/**
 * @component SettingsForm
 * @category Forms
 * @description Form for various settings with switches and selects
 */
export const SettingsForm = ({ settings, onChange }) => {
  return (
    <Stack spacing={3}>
      {settings.map((setting) => {
        if (setting.type === 'switch') {
          return (
            <Box key={setting.name} display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body1">{setting.label}</Typography>
                {setting.description && (
                  <Typography variant="caption" color="text.secondary">
                    {setting.description}
                  </Typography>
                )}
              </Box>
              <Switch
                checked={setting.value}
                onChange={(e) => onChange(setting.name, e.target.checked)}
              />
            </Box>
          );
        }
        
        if (setting.type === 'select') {
          return (
            <FormControl key={setting.name} fullWidth>
              <InputLabel>{setting.label}</InputLabel>
              <Select
                value={setting.value}
                onChange={(e) => onChange(setting.name, e.target.value)}
                label={setting.label}
              >
                {setting.options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {setting.description && (
                <FormHelperText>{setting.description}</FormHelperText>
              )}
            </FormControl>
          );
        }
        
        return null;
      })}
    </Stack>
  );
};

/**
 * @component FilterPanel
 * @category Forms
 * @description Collapsible filter panel with various input types
 */
export const FilterPanel = ({ filters = [], values, onChange, onApply, onReset }) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>
      <Stack spacing={3}>
        {filters.map((filter) => {
          if (filter.type === 'checkbox-group') {
            return (
              <Box key={filter.name}>
                <Typography variant="subtitle2" gutterBottom>
                  {filter.label}
                </Typography>
                {filter.options?.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    control={
                      <Checkbox
                        checked={values[filter.name]?.includes(option.value) || false}
                        onChange={(e) => {
                          const current = values[filter.name] || [];
                          const updated = e.target.checked
                            ? [...current, option.value]
                            : current.filter(v => v !== option.value);
                          onChange(filter.name, updated);
                        }}
                      />
                    }
                    label={option.label}
                  />
                ))}
              </Box>
            );
          }
          
          if (filter.type === 'radio') {
            return (
              <FormControl key={filter.name}>
                <Typography variant="subtitle2" gutterBottom>
                  {filter.label}
                </Typography>
                <RadioGroup
                  value={values[filter.name] || ''}
                  onChange={(e) => onChange(filter.name, e.target.value)}
                >
                  {filter.options?.map((option) => (
                    <FormControlLabel
                      key={option.value}
                      value={option.value}
                      control={<Radio />}
                      label={option.label}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            );
          }
          
          return null;
        })}
      </Stack>
      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button variant="contained" onClick={onApply}>
          Apply Filters
        </Button>
        <Button variant="outlined" onClick={onReset}>
          Reset
        </Button>
      </Stack>
    </Paper>
  );
};

/**
 * @component AutocompleteSearch
 * @category Forms
 * @description Autocomplete search with async loading
 */
export const AutocompleteSearch = ({ 
  options, 
  value, 
  onChange, 
  loading = false,
  placeholder = "Search...",
  multiple = false 
}) => {
  return (
    <Autocomplete
      options={options}
      value={value}
      onChange={(event, newValue) => onChange(newValue)}
      loading={loading}
      multiple={multiple}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
                {params.InputProps.startAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};