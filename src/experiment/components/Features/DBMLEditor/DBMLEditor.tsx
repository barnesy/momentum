import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Stack,
  Alert,
  Tabs,
  Tab,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  ListItemSecondaryAction,
  Menu,
  Drawer,
} from '@mui/material';
import {
  Schema as SchemaIcon,
  Save as SaveIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Code as CodeIcon,
  TableChart as TableIcon,
  AccountTree as DiagramIcon,
  Book as DocsIcon,
  Terminal as TerminalIcon,
  CloudUpload as PublishIcon,
  Link as LinkIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  FolderOpen as FolderIcon,
  Description as FileIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import { Parser, exporter } from '@dbml/core';
import mermaid from 'mermaid';
import { dbmlToMermaid } from '../../../utils/dbmlToMermaid';
import { createDbdiagramUrl, createDbdiagramUrlBase64 } from '../../../utils/dbdiagramUrl';

// Import schemas metadata
import schemasIndex from '../../../../../schema/schemas.json';

// Hardcoded schema content (temporary until we have a proper file server)
const schemaContent: Record<string, string> = {
  opengov: `// ================= USERS & ORG STRUCTURE =================
Table users {
  id int [pk]
  name varchar
  email varchar
  role varchar
  phone varchar
  department_id int
}

Table departments {
  id int [pk]
  name varchar
}

// ================= LOCATIONS =================
Table locations {
  id int [pk]
  address varchar
  city varchar
  state varchar
  zip_code varchar
  parcel_number varchar
  geometry geometry
}

// ================= SHARED ATTACHMENTS =================
Table attachments {
  id int [pk]
  file_name varchar
  file_url varchar
  uploaded_by int
  record_type varchar // polymorphic: 'record', 'contract', 'asset', 'budget', etc.
  record_id int
  created_at datetime
}

// ================= PERMITTING & LICENSING (PLC) =================
Table records {
  id int [pk]
  type varchar
  status varchar
  applicant_id int
  location_id int
  project_name varchar
  created_at datetime
  updated_at datetime
}

Table workflow_steps {
  id int [pk]
  record_id int
  step_type varchar
  status varchar
  assigned_to int
  started_at datetime
  completed_at datetime
}

Table inspections_plc {
  id int [pk]
  record_id int
  inspector_id int
  inspection_type varchar
  scheduled_date date
  result varchar
  notes text
}

// ================= PROCUREMENT =================
Table procurement_projects {
  id int [pk]
  title varchar
  status varchar
  project_contact_id int
  procurement_contact_id int
  department_id int
  location_id int
  created_at datetime
  updated_at datetime
}

Table solicitations {
  id int [pk]
  project_id int
  release_date date
  due_date date
  is_private boolean
  category_codes varchar
  timeline text
}

Table proposals {
  id int [pk]
  solicitation_id int
  vendor_id int
  submitted_at datetime
  status varchar
  total_price decimal
}

Table vendors {
  id int [pk]
  name varchar
  ein varchar
  uei varchar
  duns varchar
  public_profile_url varchar
  subscribed boolean
}

Table contracts {
  id int [pk]
  project_id int
  vendor_id int
  title varchar
  start_date date
  end_date date
  total_value decimal
  cooperative boolean
  piggybackable boolean
  status varchar
}

// ================= ENTERPRISE ASSET MANAGEMENT (EAM) =================
Table assets {
  id int [pk]
  name varchar
  type varchar
  status varchar
  parent_id int
  location_id int
}

Table eam_tasks {
  id int [pk]
  description varchar
  status varchar
  asset_id int
  assigned_to int
}

Table eam_inspections {
  id int [pk]
  asset_id int
  date date
  type varchar
  result varchar
}

Table resources {
  id int [pk]
  name varchar
  type varchar
  cost decimal
}

Table task_resources {
  id int [pk]
  task_id int
  resource_id int
  quantity decimal
}

Table eam_requests {
  id int [pk]
  description varchar
  status varchar
  asset_id int
  task_id int
  created_at datetime
}

// ================= UTILITY BILLING =================
Table utility_accounts {
  id int [pk]
  account_number varchar
  customer_id int
  service_address_id int
  status varchar
  created_at datetime
  updated_at datetime
}

Table utility_customers {
  id int [pk]
  name varchar
  email varchar
  phone varchar
}

Table utility_bills {
  id int [pk]
  account_id int
  billing_period_start date
  billing_period_end date
  meter_reading decimal
  bill_amount decimal
  payment_status varchar
  created_at datetime
}

Table utility_payments {
  id int [pk]
  bill_id int
  amount decimal
  payment_date datetime
  method varchar
  transaction_reference varchar
}

Table utility_services {
  id int [pk]
  name varchar
  rate decimal
  unit varchar
}

Table utility_usage {
  id int [pk]
  account_id int
  service_id int
  usage_amount decimal
  usage_date date
}

// ================= BUDGETING & PLANNING =================
Table budgets {
  id int [pk]
  fiscal_year int
  status varchar
  created_by int
  created_at datetime
  approved_at datetime
}

Table budget_entries {
  id int [pk]
  budget_id int
  department_id int
  fund varchar
  account_code varchar
  project_code varchar
  amount decimal
  entry_type varchar // 'operating', 'capital', 'workforce'
}

Table budget_proposals {
  id int [pk]
  title varchar
  description text
  status varchar
  submitted_by int
  submitted_at datetime
  department_id int
  linked_project_id int
}

Table budget_forecasts {
  id int [pk]
  budget_id int
  month int
  year int
  forecast_amount decimal
  actual_amount decimal
  entry_id int
}

Table budget_workforce {
  id int [pk]
  budget_id int
  position_title varchar
  department_id int
  fte decimal
  salary decimal
  benefits decimal
}

// ================= TAX & REVENUE (ERM) =================
Table tax_customers {
  id int [pk]
  name varchar
  email varchar
  phone varchar
  mailing_address varchar
}

Table tax_accounts {
  id int [pk]
  account_number varchar
  customer_id int
  type varchar // 'property', 'business', 'sales', etc.
  status varchar
  created_at datetime
  updated_at datetime
  location_id int
}

Table tax_bills {
  id int [pk]
  account_id int
  bill_number varchar
  tax_year int
  due_date date
  total_amount decimal
  balance_due decimal
  status varchar
  created_at datetime
}

Table tax_payments {
  id int [pk]
  bill_id int
  amount decimal
  payment_date datetime
  method varchar
  reference_number varchar
  payer_id int
}

Table tax_assessments {
  id int [pk]
  account_id int
  assessed_value decimal
  exemption_amount decimal
  taxable_value decimal
  millage_rate decimal
  calculated_tax decimal
  tax_year int
  created_at datetime
}

Table tax_delinquencies {
  id int [pk]
  bill_id int
  delinquent_date date
  interest_accrued decimal
  penalty_amount decimal
  resolution_status varchar
  resolved_at datetime
}

// ================= RELATIONSHIPS =================
// Users & Orgs
Ref: users.department_id > departments.id
Ref: attachments.uploaded_by > users.id

// Locations
Ref: records.location_id > locations.id
Ref: procurement_projects.location_id > locations.id
Ref: assets.location_id > locations.id
Ref: utility_accounts.service_address_id > locations.id
Ref: tax_accounts.location_id > locations.id

// PLC
Ref: records.applicant_id > users.id
Ref: workflow_steps.record_id > records.id
Ref: workflow_steps.assigned_to > users.id
Ref: inspections_plc.record_id > records.id
Ref: inspections_plc.inspector_id > users.id

// Procurement
Ref: procurement_projects.project_contact_id > users.id
Ref: procurement_projects.procurement_contact_id > users.id
Ref: procurement_projects.department_id > departments.id
Ref: solicitations.project_id > procurement_projects.id
Ref: proposals.solicitation_id > solicitations.id
Ref: proposals.vendor_id > vendors.id
Ref: contracts.project_id > procurement_projects.id
Ref: contracts.vendor_id > vendors.id

// EAM
Ref: assets.parent_id > assets.id
Ref: eam_tasks.asset_id > assets.id
Ref: eam_tasks.assigned_to > users.id
Ref: eam_inspections.asset_id > assets.id
Ref: task_resources.task_id > eam_tasks.id
Ref: task_resources.resource_id > resources.id
Ref: eam_requests.asset_id > assets.id
Ref: eam_requests.task_id > eam_tasks.id

// Utility Billing
Ref: utility_accounts.customer_id > utility_customers.id
Ref: utility_bills.account_id > utility_accounts.id
Ref: utility_payments.bill_id > utility_bills.id
Ref: utility_usage.account_id > utility_accounts.id
Ref: utility_usage.service_id > utility_services.id

// Budgeting
Ref: budgets.created_by > users.id
Ref: budget_entries.budget_id > budgets.id
Ref: budget_entries.department_id > departments.id
Ref: budget_forecasts.budget_id > budgets.id
Ref: budget_forecasts.entry_id > budget_entries.id
Ref: budget_proposals.submitted_by > users.id
Ref: budget_proposals.department_id > departments.id
Ref: budget_proposals.linked_project_id > procurement_projects.id
Ref: budget_workforce.budget_id > budgets.id
Ref: budget_workforce.department_id > departments.id

// Tax & Revenue
Ref: tax_accounts.customer_id > tax_customers.id
Ref: tax_bills.account_id > tax_accounts.id
Ref: tax_payments.bill_id > tax_bills.id
Ref: tax_payments.payer_id > tax_customers.id
Ref: tax_assessments.account_id > tax_accounts.id
Ref: tax_delinquencies.bill_id > tax_bills.id`,
  auth: `// Authentication & Authorization Schema
// This schema handles user authentication and permissions

Project auth_system {
  database_type: 'PostgreSQL'
  Note: 'Authentication and authorization schema'
}

Table auth_users {
  id int [pk, increment]
  email varchar [unique, not null]
  password_hash varchar [not null]
  email_verified boolean [default: false]
  created_at timestamp [default: 'now()']
  updated_at timestamp
  last_login timestamp
  
  Indexes {
    email [unique, name: 'idx_auth_users_email']
  }
}

Table auth_sessions {
  id varchar [pk]
  user_id int [not null]
  expires_at timestamp [not null]
  created_at timestamp [default: 'now()']
  
  Indexes {
    user_id [name: 'idx_sessions_user']
    expires_at [name: 'idx_sessions_expires']
  }
}

Table auth_roles {
  id int [pk, increment]
  name varchar [unique, not null]
  description text
  created_at timestamp [default: 'now()']
}

Table auth_permissions {
  id int [pk, increment]
  resource varchar [not null]
  action varchar [not null]
  description text
  
  Indexes {
    (resource, action) [unique, name: 'idx_permissions_resource_action']
  }
}

Table user_roles {
  user_id int [not null]
  role_id int [not null]
  assigned_at timestamp [default: 'now()']
  assigned_by int
  
  Indexes {
    (user_id, role_id) [pk]
  }
}

Table role_permissions {
  role_id int [not null]
  permission_id int [not null]
  granted_at timestamp [default: 'now()']
  
  Indexes {
    (role_id, permission_id) [pk]
  }
}

// Enums
Enum auth_action {
  create
  read
  update
  delete
  execute
}

// Relationships
Ref: auth_sessions.user_id > auth_users.id [delete: cascade]
Ref: user_roles.user_id > auth_users.id [delete: cascade]
Ref: user_roles.role_id > auth_roles.id [delete: cascade]
Ref: user_roles.assigned_by > auth_users.id
Ref: role_permissions.role_id > auth_roles.id [delete: cascade]
Ref: role_permissions.permission_id > auth_permissions.id [delete: cascade]`,
  analytics: `// Analytics & Metrics Schema
// This schema tracks user behavior and system performance

Project analytics {
  database_type: 'PostgreSQL'
  Note: 'Analytics and metrics tracking schema'
}

Table page_views {
  id bigint [pk, increment]
  session_id varchar [not null]
  user_id int
  page_url varchar [not null]
  referrer_url varchar
  user_agent varchar
  ip_address inet
  country_code varchar(2)
  viewed_at timestamp [default: 'now()']
  duration_seconds int
  
  Indexes {
    session_id [name: 'idx_page_views_session']
    user_id [name: 'idx_page_views_user']
    viewed_at [name: 'idx_page_views_time']
    (page_url, viewed_at) [name: 'idx_page_views_url_time']
  }
}

Table events {
  id bigint [pk, increment]
  event_name varchar [not null]
  event_category varchar [not null]
  user_id int
  session_id varchar
  properties jsonb
  created_at timestamp [default: 'now()']
  
  Indexes {
    (event_name, created_at) [name: 'idx_events_name_time']
    user_id [name: 'idx_events_user']
    created_at [name: 'idx_events_time']
  }
}

Table metrics {
  id bigint [pk, increment]
  metric_name varchar [not null]
  metric_value decimal [not null]
  metric_unit varchar
  tags jsonb
  recorded_at timestamp [default: 'now()']
  
  Indexes {
    (metric_name, recorded_at) [name: 'idx_metrics_name_time']
    recorded_at [name: 'idx_metrics_time']
  }
}

Table user_cohorts {
  id int [pk, increment]
  cohort_name varchar [unique, not null]
  cohort_date date [not null]
  user_count int [default: 0]
  properties jsonb
  created_at timestamp [default: 'now()']
  
  Indexes {
    cohort_date [name: 'idx_cohorts_date']
  }
}

Table user_cohort_members {
  cohort_id int [not null]
  user_id int [not null]
  joined_at timestamp [default: 'now()']
  
  Indexes {
    (cohort_id, user_id) [pk]
    user_id [name: 'idx_cohort_members_user']
  }
}

// Enums
Enum event_category {
  user_action
  system_event
  error
  performance
  security
}

Enum metric_unit {
  count
  milliseconds
  seconds
  bytes
  percentage
  ratio
}

// Relationships
Ref: user_cohort_members.cohort_id > user_cohorts.id [delete: cascade]
// Note: user_id references would connect to users table in main schema`,
  momentum: `// Momentum Project Database Schema
// This schema represents the data structure for the Momentum browser development integration

Project momentum {
  database_type: 'PostgreSQL'
  Note: 'Main database schema for Momentum project'
}

Table components {
  id int [pk, increment]
  name varchar [not null, unique]
  category varchar [not null]
  description text
  status component_status [not null, default: 'pending']
  code text [not null]
  props_schema json
  created_at timestamp [default: 'now()']
  updated_at timestamp
  created_by int
  
  Indexes {
    (category, status) [name: 'idx_component_category_status']
    created_at [name: 'idx_component_created']
  }
  
  Note: 'Stores React component patterns and templates'
}

Table component_reviews {
  id int [pk, increment]
  component_id int [not null]
  reviewer_id int [not null]
  status review_status [not null]
  feedback text
  reviewed_at timestamp [default: 'now()']
  
  Indexes {
    component_id [name: 'idx_review_component']
    (reviewer_id, status) [name: 'idx_review_user_status']
  }
}

Table themes {
  id int [pk, increment]
  name varchar [not null, unique]
  description text
  config json [not null]
  is_active boolean [default: false]
  created_at timestamp [default: 'now()']
  updated_at timestamp
  created_by int
  
  Note: 'Stores theme configurations for the application'
}

Table github_contexts {
  id int [pk, increment]
  repo_name varchar [not null]
  event_type varchar [not null]
  context_data json [not null]
  priority context_priority [default: 'medium']
  expires_at timestamp
  created_at timestamp [default: 'now()']
  
  Indexes {
    (repo_name, event_type) [name: 'idx_context_repo_event']
    expires_at [name: 'idx_context_expires']
  }
}

Table ai_interactions {
  id int [pk, increment]
  context_id int
  prompt text [not null]
  response text
  model varchar [not null]
  tokens_used int
  created_at timestamp [default: 'now()']
  
  Indexes {
    context_id [name: 'idx_ai_context']
    created_at [name: 'idx_ai_created']
  }
}

Table dbml_schemas {
  id int [pk, increment]
  name varchar [not null, unique]
  description text
  category varchar [not null]
  content text [not null]
  version int [default: 1]
  is_active boolean [default: true]
  created_at timestamp [default: 'now()']
  updated_at timestamp
  created_by int
  
  Indexes {
    category [name: 'idx_schema_category']
    (name, version) [name: 'idx_schema_name_version']
  }
  
  Note: 'Stores DBML database schemas for various parts of the application'
}

// Enums
Enum component_status {
  pending
  approved
  rejected
  archived
}

Enum review_status {
  pending
  approved
  rejected
  needs_changes
}

Enum context_priority {
  low
  medium
  high
  critical
}

// Relationships
Ref: component_reviews.component_id > components.id [delete: cascade]
Ref: ai_interactions.context_id > github_contexts.id [delete: set null]
Ref: components.created_by > themes.created_by
Ref: themes.created_by > dbml_schemas.created_by`,
  auth: `// Authentication & Authorization Schema
// This schema handles user authentication and permissions

Project auth_system {
  database_type: 'PostgreSQL'
  Note: 'Authentication and authorization schema'
}

Table auth_users {
  id int [pk, increment]
  email varchar [unique, not null]
  password_hash varchar [not null]
  email_verified boolean [default: false]
  created_at timestamp [default: 'now()']
  updated_at timestamp
  last_login timestamp
  
  Indexes {
    email [unique, name: 'idx_auth_users_email']
  }
}

Table auth_sessions {
  id varchar [pk]
  user_id int [not null]
  expires_at timestamp [not null]
  created_at timestamp [default: 'now()']
  
  Indexes {
    user_id [name: 'idx_sessions_user']
    expires_at [name: 'idx_sessions_expires']
  }
}

Table auth_roles {
  id int [pk, increment]
  name varchar [unique, not null]
  description text
  created_at timestamp [default: 'now()']
}

Table auth_permissions {
  id int [pk, increment]
  resource varchar [not null]
  action varchar [not null]
  description text
  
  Indexes {
    (resource, action) [unique, name: 'idx_permissions_resource_action']
  }
}

Table user_roles {
  user_id int [not null]
  role_id int [not null]
  assigned_at timestamp [default: 'now()']
  assigned_by int
  
  Indexes {
    (user_id, role_id) [pk]
  }
}

Table role_permissions {
  role_id int [not null]
  permission_id int [not null]
  granted_at timestamp [default: 'now()']
  
  Indexes {
    (role_id, permission_id) [pk]
  }
}

// Enums
Enum auth_action {
  create
  read
  update
  delete
  execute
}

// Relationships
Ref: auth_sessions.user_id > auth_users.id [delete: cascade]
Ref: user_roles.user_id > auth_users.id [delete: cascade]
Ref: user_roles.role_id > auth_roles.id [delete: cascade]
Ref: user_roles.assigned_by > auth_users.id
Ref: role_permissions.role_id > auth_roles.id [delete: cascade]
Ref: role_permissions.permission_id > auth_permissions.id [delete: cascade]`,
  analytics: `// Analytics & Metrics Schema
// This schema tracks user behavior and system performance

Project analytics {
  database_type: 'PostgreSQL'
  Note: 'Analytics and metrics tracking schema'
}

Table page_views {
  id bigint [pk, increment]
  session_id varchar [not null]
  user_id int
  page_url varchar [not null]
  referrer_url varchar
  user_agent varchar
  ip_address inet
  country_code varchar(2)
  viewed_at timestamp [default: 'now()']
  duration_seconds int
  
  Indexes {
    session_id [name: 'idx_page_views_session']
    user_id [name: 'idx_page_views_user']
    viewed_at [name: 'idx_page_views_time']
    (page_url, viewed_at) [name: 'idx_page_views_url_time']
  }
}

Table events {
  id bigint [pk, increment]
  event_name varchar [not null]
  event_category varchar [not null]
  user_id int
  session_id varchar
  properties jsonb
  created_at timestamp [default: 'now()']
  
  Indexes {
    (event_name, created_at) [name: 'idx_events_name_time']
    user_id [name: 'idx_events_user']
    created_at [name: 'idx_events_time']
  }
}

Table metrics {
  id bigint [pk, increment]
  metric_name varchar [not null]
  metric_value decimal [not null]
  metric_unit varchar
  tags jsonb
  recorded_at timestamp [default: 'now()']
  
  Indexes {
    (metric_name, recorded_at) [name: 'idx_metrics_name_time']
    recorded_at [name: 'idx_metrics_time']
  }
}

Table user_cohorts {
  id int [pk, increment]
  cohort_name varchar [unique, not null]
  cohort_date date [not null]
  user_count int [default: 0]
  properties jsonb
  created_at timestamp [default: 'now()']
  
  Indexes {
    cohort_date [name: 'idx_cohorts_date']
  }
}

Table user_cohort_members {
  cohort_id int [not null]
  user_id int [not null]
  joined_at timestamp [default: 'now()']
  
  Indexes {
    (cohort_id, user_id) [pk]
    user_id [name: 'idx_cohort_members_user']
  }
}

// Enums
Enum event_category {
  user_action
  system_event
  error
  performance
  security
}

Enum metric_unit {
  count
  milliseconds
  seconds
  bytes
  percentage
  ratio
}

// Relationships
Ref: user_cohort_members.cohort_id > user_cohorts.id [delete: cascade]
// Note: user_id references would connect to users table in main schema`,
  momentum: `// Momentum Project Database Schema
// This schema represents the data structure for the Momentum browser development integration

Project momentum {
  database_type: 'PostgreSQL'
  Note: 'Main database schema for Momentum project'
}

Table components {
  id int [pk, increment]
  name varchar [not null, unique]
  category varchar [not null]
  description text
  status component_status [not null, default: 'pending']
  code text [not null]
  props_schema json
  created_at timestamp [default: 'now()']
  updated_at timestamp
  created_by int
  
  Indexes {
    (category, status) [name: 'idx_component_category_status']
    created_at [name: 'idx_component_created']
  }
  
  Note: 'Stores React component patterns and templates'
}

Table component_reviews {
  id int [pk, increment]
  component_id int [not null]
  reviewer_id int [not null]
  status review_status [not null]
  feedback text
  reviewed_at timestamp [default: 'now()']
  
  Indexes {
    component_id [name: 'idx_review_component']
    (reviewer_id, status) [name: 'idx_review_user_status']
  }
}

Table themes {
  id int [pk, increment]
  name varchar [not null, unique]
  description text
  config json [not null]
  is_active boolean [default: false]
  created_at timestamp [default: 'now()']
  updated_at timestamp
  created_by int
  
  Note: 'Stores theme configurations for the application'
}

Table github_contexts {
  id int [pk, increment]
  repo_name varchar [not null]
  event_type varchar [not null]
  context_data json [not null]
  priority context_priority [default: 'medium']
  expires_at timestamp
  created_at timestamp [default: 'now()']
  
  Indexes {
    (repo_name, event_type) [name: 'idx_context_repo_event']
    expires_at [name: 'idx_context_expires']
  }
}

Table ai_interactions {
  id int [pk, increment]
  context_id int
  prompt text [not null]
  response text
  model varchar [not null]
  tokens_used int
  created_at timestamp [default: 'now()']
  
  Indexes {
    context_id [name: 'idx_ai_context']
    created_at [name: 'idx_ai_created']
  }
}

Table dbml_schemas {
  id int [pk, increment]
  name varchar [not null, unique]
  description text
  category varchar [not null]
  content text [not null]
  version int [default: 1]
  is_active boolean [default: true]
  created_at timestamp [default: 'now()']
  updated_at timestamp
  created_by int
  
  Indexes {
    category [name: 'idx_schema_category']
    (name, version) [name: 'idx_schema_name_version']
  }
  
  Note: 'Stores DBML schema definitions'
}

// Enums
Enum component_status {
  pending
  approved
  rejected
}

Enum review_status {
  pending
  approved
  rejected
  needs_changes
}

Enum context_priority {
  low
  medium
  high
  critical
}

// Relationships
Ref: components.created_by > users.id
Ref: component_reviews.component_id > components.id [delete: cascade]
Ref: component_reviews.reviewer_id > users.id
Ref: themes.created_by > users.id
Ref: github_contexts.context_id > components.id
Ref: ai_interactions.context_id > github_contexts.id
Ref: dbml_schemas.created_by > users.id`
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface SchemaInfo {
  id: string;
  name: string;
  description: string;
  filename: string;
  category: string;
  lastModified: string;
}

interface ParsedSchema {
  tables: any[];
  refs: any[];
  enums: any[];
  project?: any;
  errors?: any[];
}

const categoryIcons: Record<string, React.ReactElement> = {
  core: <StorageIcon />,
  security: <SecurityIcon />,
  monitoring: <AnalyticsIcon />,
};

export const DBMLEditor: React.FC = () => {
  const [dbml, setDBml] = useState('');
  const [currentSchemaId, setCurrentSchemaId] = useState<string>('momentum');
  const [schemas, setSchemas] = useState<SchemaInfo[]>(schemasIndex.schemas);
  const [schemaSidebarOpen, setSchemaSidebarOpen] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [parsedSchema, setParsedSchema] = useState<ParsedSchema | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'postgres' | 'mysql' | 'mssql'>('postgres');
  const [exportedSQL, setExportedSQL] = useState<string>('');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showDbdocsDialog, setShowDbdocsDialog] = useState(false);
  const [showNewSchemaDialog, setShowNewSchemaDialog] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [syntaxReferenceOpen, setSyntaxReferenceOpen] = useState(false);
  const [projectName, setProjectName] = useState('momentum-db');
  const [diagramSVG, setDiagramSVG] = useState<string | null>(null);
  const [diagramError, setDiagramError] = useState<string | null>(null);
  const [mermaidId] = useState(`mermaid-${Date.now()}`);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [schemaMenuAnchor, setSchemaMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedSchemaForMenu, setSelectedSchemaForMenu] = useState<string | null>(null);

  // New schema form state
  const [newSchemaName, setNewSchemaName] = useState('');
  const [newSchemaDescription, setNewSchemaDescription] = useState('');
  const [newSchemaCategory, setNewSchemaCategory] = useState('core');

  // Load schema from file
  const loadSchema = useCallback((schemaId: string) => {
    try {
      const schemaInfo = schemas.find(s => s.id === schemaId);
      if (!schemaInfo) return;

      // Use hardcoded content for now (TODO: implement proper file server)
      const content = schemaContent[schemaId];
      if (!content) {
        throw new Error('Schema content not found');
      }
      
      setDBml(content);
      setCurrentSchemaId(schemaId);
      setUnsavedChanges(false);
      setSnackbarMessage(`Loaded ${schemaInfo.name} schema`);
    } catch (error) {
      setSnackbarMessage('Failed to load schema file');
      console.error('Error loading schema:', error);
    }
  }, [schemas]);

  // Parse DBML schema
  const parseDBML = useCallback((schema: string) => {
    try {
      const parsed = Parser.parse(schema, 'dbml');
      // Extract the first schema (DBML parser returns schemas array)
      const processedSchema = {
        tables: parsed.schemas?.[0]?.tables || [],
        refs: parsed.schemas?.[0]?.refs || [],
        enums: parsed.schemas?.[0]?.enums || [],
        project: null // Simplified to avoid type issues
      };
      setParsedSchema(processedSchema);
      setParseError(null);
      return processedSchema;
    } catch (error: any) {
      setParseError(error.message || 'Failed to parse DBML schema');
      setParsedSchema(null);
      return null;
    }
  }, []);

  // Auto-parse on change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      parseDBML(dbml);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [dbml, parseDBML]);

  // Initialize Mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      themeVariables: {
        primaryColor: '#1976d2',
        primaryTextColor: '#fff',
        primaryBorderColor: '#0d47a1',
        lineColor: '#333',
        secondaryColor: '#f50057',
        tertiaryColor: '#fff'
      },
      er: {
        diagramPadding: 20,
        layoutDirection: 'TB',
        minEntityWidth: 100,
        minEntityHeight: 75,
        entityPadding: 15,
        stroke: 'gray',
        fill: '#f9f9f9'
      }
    });
  }, []);

  // Generate diagram when DBML changes
  const generateDiagram = useCallback(async () => {
    if (!dbml) {
      setDiagramSVG(null);
      return;
    }

    try {
      // Convert DBML to Mermaid syntax
      const mermaidSyntax = dbmlToMermaid(dbml);
      
      // Render the diagram
      const { svg } = await mermaid.render(mermaidId, mermaidSyntax);
      setDiagramSVG(svg);
      setDiagramError(null);
    } catch (error: any) {
      setDiagramError(error.message || 'Failed to generate diagram');
      setDiagramSVG(null);
    }
  }, [dbml, mermaidId]);

  // Auto-generate diagram on change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateDiagram();
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [dbml, generateDiagram]);

  // Export to SQL
  const exportToSQL = useCallback(() => {
    if (!dbml) return;

    try {
      // Export DBML to SQL
      const sql = exporter.export(dbml, exportFormat);
      setExportedSQL(sql);
      setShowExportDialog(true);
    } catch (error: any) {
      setSnackbarMessage(`Export error: ${error.message}`);
    }
  }, [dbml, exportFormat]);

  // Save schema to localStorage (as a backup)
  const saveSchema = () => {
    const schemaInfo = schemas.find(s => s.id === currentSchemaId);
    if (!schemaInfo) return;

    localStorage.setItem(`momentum-dbml-${currentSchemaId}`, dbml);
    setSnackbarMessage('Schema saved to browser storage');
    setUnsavedChanges(false);
  };

  // Download current schema
  const downloadSchema = () => {
    const schemaInfo = schemas.find(s => s.id === currentSchemaId);
    const filename = schemaInfo ? schemaInfo.filename : 'schema.dbml';
    
    const blob = new Blob([dbml], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import schema from file
  const importSchema = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setDBml(content);
        setUnsavedChanges(true);
        setSnackbarMessage('Schema imported successfully');
      };
      reader.readAsText(file);
    }
  };

  // Create new schema
  const createNewSchema = () => {
    if (!newSchemaName.trim()) return;

    const newId = newSchemaName.toLowerCase().replace(/\s+/g, '-');
    const newSchema: SchemaInfo = {
      id: newId,
      name: newSchemaName,
      description: newSchemaDescription,
      filename: `${newId}.dbml`,
      category: newSchemaCategory,
      lastModified: new Date().toISOString().split('T')[0]
    };

    setSchemas([...schemas, newSchema]);
    setCurrentSchemaId(newId);
    setDBml(`// ${newSchemaName} Schema
// ${newSchemaDescription}

Project ${newId} {
  database_type: 'PostgreSQL'
  Note: '${newSchemaDescription}'
}

// Add your tables here
`);
    setShowNewSchemaDialog(false);
    setNewSchemaName('');
    setNewSchemaDescription('');
    setUnsavedChanges(true);
    setSnackbarMessage('New schema created');
  };

  // Delete schema
  const deleteSchema = (schemaId: string) => {
    setSchemas(schemas.filter(s => s.id !== schemaId));
    localStorage.removeItem(`momentum-dbml-${schemaId}`);
    if (currentSchemaId === schemaId) {
      setCurrentSchemaId('momentum');
    }
    setSchemaMenuAnchor(null);
    setSnackbarMessage('Schema deleted');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSnackbarMessage('Copied to clipboard');
  };

  // Load initial schema on mount
  useEffect(() => {
    loadSchema(currentSchemaId);
  }, []);

  // Track changes
  useEffect(() => {
    setUnsavedChanges(true);
  }, [dbml]);

  const drawerWidth = 280;

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Schema Sidebar */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={schemaSidebarOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            position: 'relative',
            height: '100%',
            borderRight: 1,
            borderColor: 'divider'
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Schemas</Typography>
            <IconButton size="small" onClick={() => setShowNewSchemaDialog(true)}>
              <AddIcon />
            </IconButton>
          </Box>
        </Box>
        
        <List sx={{ pt: 0 }}>
          {Object.entries(schemasIndex.categories).map(([categoryId, category]) => (
            <Box key={categoryId}>
              <ListItem>
                <ListItemIcon>
                  {categoryIcons[categoryId]}
                </ListItemIcon>
                <ListItemText 
                  primary={category.name}
                  primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                />
              </ListItem>
              {schemas
                .filter(schema => schema.category === categoryId)
                .map((schema) => (
                  <ListItemButton
                    key={schema.id}
                    selected={currentSchemaId === schema.id}
                    onClick={() => loadSchema(schema.id)}
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon>
                      <FileIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={schema.name}
                      secondary={schema.description}
                      secondaryTypographyProps={{ 
                        sx: { 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }
                      }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => {
                          setSchemaMenuAnchor(e.currentTarget);
                          setSelectedSchemaForMenu(schema.id);
                        }}
                      >
                        <MoreIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItemButton>
                ))}
            </Box>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <IconButton onClick={() => setSchemaSidebarOpen(!schemaSidebarOpen)}>
                  <FolderIcon />
                </IconButton>
                <SchemaIcon color="primary" />
                <Typography variant="h5">
                  DBML Schema Editor
                </Typography>
                {unsavedChanges && (
                  <Chip
                    icon={<InfoIcon />}
                    label="Unsaved Changes"
                    color="warning"
                    size="small"
                  />
                )}
                {parseError ? (
                  <Chip
                    icon={<ErrorIcon />}
                    label="Invalid Schema"
                    color="error"
                    size="small"
                  />
                ) : parsedSchema ? (
                  <Chip
                    icon={<CheckIcon />}
                    label="Valid Schema"
                    color="success"
                    size="small"
                  />
                ) : null}
              </Box>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Upload DBML file">
                  <IconButton component="label">
                    <UploadIcon />
                    <input
                      type="file"
                      hidden
                      accept=".dbml,.txt"
                      onChange={importSchema}
                    />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download DBML">
                  <IconButton onClick={downloadSchema}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<SaveIcon />}
                  onClick={saveSchema}
                  disabled={!unsavedChanges}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DocsIcon />}
                  onClick={() => setShowDbdocsDialog(true)}
                  disabled={!parsedSchema}
                >
                  dbdocs.io
                </Button>
                <Button
                  variant="contained"
                  startIcon={<CodeIcon />}
                  onClick={exportToSQL}
                  disabled={!parsedSchema}
                >
                  Export SQL
                </Button>
              </Stack>
            </Box>

            <Typography variant="body2" color="text.secondary" paragraph>
              Editing: <strong>{schemas.find(s => s.id === currentSchemaId)?.name || 'Unknown'}</strong> - 
              {schemas.find(s => s.id === currentSchemaId)?.description}
            </Typography>

            <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)}>
              <Tab label="Schema Editor" icon={<CodeIcon />} iconPosition="start" />
              <Tab label="Schema Overview" icon={<TableIcon />} iconPosition="start" />
              <Tab label="Visual Diagram" icon={<DiagramIcon />} iconPosition="start" />
              <Tab label="Documentation" icon={<DocsIcon />} iconPosition="start" />
            </Tabs>

            <Divider />

            {/* Schema Editor */}
            <TabPanel value={tabValue} index={0}>
              <Stack spacing={2}>
                <Box display="flex" justifyContent="flex-end">
                  <Button
                    size="small"
                    startIcon={<InfoIcon />}
                    onClick={() => setSyntaxReferenceOpen(true)}
                  >
                    DBML Syntax Reference
                  </Button>
                </Box>
                
                <Paper variant="outlined" sx={{ height: 600, overflow: 'hidden' }}>
                  <Editor
                    height="100%"
                    defaultLanguage="sql"
                    value={dbml}
                    onChange={(value) => setDBml(value || '')}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      wordWrap: 'on',
                      automaticLayout: true,
                      formatOnPaste: true,
                      formatOnType: true,
                    }}
                  />
                </Paper>

                {parseError && (
                  <Alert severity="error" icon={<ErrorIcon />}>
                    <strong>Parse Error:</strong> {parseError}
                  </Alert>
                )}
              </Stack>
            </TabPanel>

            {/* Schema Overview */}
            <TabPanel value={tabValue} index={1}>
              {parsedSchema ? (
                <Grid container spacing={3}>
                  {/* Tables */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h6" gutterBottom>
                      Tables ({parsedSchema.tables.length})
                    </Typography>
                    <Stack spacing={2}>
                      {parsedSchema.tables.map((table) => (
                        <Paper key={table.name} sx={{ p: 2 }}>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <TableIcon fontSize="small" color="primary" />
                            <Typography variant="subtitle1" fontWeight="bold">
                              {table.name}
                            </Typography>
                          </Box>
                          {table.note && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {table.note}
                            </Typography>
                          )}
                          <Box sx={{ pl: 2 }}>
                            {table.fields.map((field: any) => (
                              <Typography key={field.name} variant="body2" component="div" sx={{ py: 0.5 }}>
                                <strong>{field.name}</strong>: {field.type.type_name}
                                {field.pk && <Chip label="PK" size="small" sx={{ ml: 1 }} />}
                                {field.not_null && <Chip label="NOT NULL" size="small" sx={{ ml: 1 }} />}
                                {field.unique && <Chip label="UNIQUE" size="small" sx={{ ml: 1 }} />}
                              </Typography>
                            ))}
                          </Box>
                        </Paper>
                      ))}
                    </Stack>
                  </Grid>

                  {/* Enums and Relationships */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    {/* Enums */}
                    {parsedSchema.enums.length > 0 && (
                      <>
                        <Typography variant="h6" gutterBottom>
                          Enums ({parsedSchema.enums.length})
                        </Typography>
                        <Stack spacing={2} sx={{ mb: 3 }}>
                          {parsedSchema.enums.map((enumType) => (
                            <Paper key={enumType.name} sx={{ p: 2 }}>
                              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                {enumType.name}
                              </Typography>
                              <Box display="flex" gap={1} flexWrap="wrap">
                                {enumType.values.map((value: any) => (
                                  <Chip
                                    key={value.name}
                                    label={value.name}
                                    size="small"
                                    variant="outlined"
                                  />
                                ))}
                              </Box>
                            </Paper>
                          ))}
                        </Stack>
                      </>
                    )}

                    {/* Relationships */}
                    {parsedSchema.refs.length > 0 && (
                      <>
                        <Typography variant="h6" gutterBottom>
                          Relationships ({parsedSchema.refs.length})
                        </Typography>
                        <Stack spacing={1}>
                          {parsedSchema.refs.map((ref: any, index: number) => (
                            <Paper key={index} sx={{ p: 1.5 }}>
                              <Typography variant="body2" component="div">
                                <strong>{ref.endpoints[0].tableName}.{ref.endpoints[0].fieldNames[0]}</strong>
                                {' → '}
                                <strong>{ref.endpoints[1].tableName}.{ref.endpoints[1].fieldNames[0]}</strong>
                                {ref.onDelete && (
                                  <Chip
                                    label={`ON DELETE ${ref.onDelete}`}
                                    size="small"
                                    sx={{ ml: 1 }}
                                  />
                                )}
                              </Typography>
                            </Paper>
                          ))}
                        </Stack>
                      </>
                    )}
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info">
                  Enter valid DBML in the editor to see schema overview
                </Alert>
              )}
            </TabPanel>

            {/* Visual Diagram */}
            <TabPanel value={tabValue} index={2}>
              {diagramError ? (
                <Alert severity="error" icon={<ErrorIcon />}>
                  <strong>Diagram Generation Error:</strong> {diagramError}
                </Alert>
              ) : diagramSVG ? (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Database Schema Diagram</Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CodeIcon />}
                        onClick={() => {
                          try {
                            const mermaidSyntax = dbmlToMermaid(dbml);
                            copyToClipboard(mermaidSyntax);
                            setSnackbarMessage('Mermaid syntax copied to clipboard');
                          } catch (error: any) {
                            setSnackbarMessage('Failed to generate Mermaid syntax');
                          }
                        }}
                      >
                        Copy Mermaid
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={() => {
                          const blob = new Blob([diagramSVG], { type: 'image/svg+xml' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'database-diagram.svg';
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                      >
                        Download SVG
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<LinkIcon />}
                        onClick={() => {
                          try {
                            // Try the primary URL format
                            const dbdiagramURL = createDbdiagramUrl(dbml);
                            
                            // Copy schema to clipboard as backup
                            copyToClipboard(dbml);
                            setSnackbarMessage('Schema copied to clipboard. Paste it in dbdiagram.io if not auto-filled.');
                            
                            // Open in new tab
                            window.open(dbdiagramURL, '_blank');
                          } catch (error) {
                            // Fallback: just open dbdiagram.io
                            window.open('https://dbdiagram.io/d', '_blank');
                            copyToClipboard(dbml);
                            setSnackbarMessage('Schema copied to clipboard. Paste it in dbdiagram.io.');
                          }
                        }}
                      >
                        Open in dbdiagram.io
                      </Button>
                    </Stack>
                  </Box>
                  
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      overflow: 'auto',
                      maxHeight: '70vh',
                      backgroundColor: 'background.default',
                      '& svg': {
                        maxWidth: '100%',
                        height: 'auto'
                      }
                    }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: diagramSVG }} />
                  </Paper>
                </Box>
              ) : (
                <Alert severity="info" icon={<InfoIcon />}>
                  <Typography variant="body2">
                    Enter valid DBML in the editor to generate a visual diagram
                  </Typography>
                </Alert>
              )}

              {parsedSchema && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Schema Statistics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {parsedSchema.tables.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tables
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {parsedSchema.tables.reduce((acc, table) => acc + table.fields.length, 0)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Fields
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {parsedSchema.refs.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Relationships
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {parsedSchema.enums.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Enums
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </TabPanel>

            {/* Documentation Tab */}
            <TabPanel value={tabValue} index={3}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <DocsIcon color="primary" />
                      <Typography variant="h6">
                        Generate Documentation with dbdocs.io
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" paragraph>
                      dbdocs.io creates beautiful, shareable database documentation from your DBML schema.
                    </Typography>

                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <CheckIcon color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Auto-generated documentation"
                          secondary="Clean interface to visualize your database"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckIcon color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Shareable links"
                          secondary="Share with team members and stakeholders"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckIcon color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Version control"
                          secondary="Track database schema changes over time"
                        />
                      </ListItem>
                    </List>

                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<PublishIcon />}
                      onClick={() => setShowDbdocsDialog(true)}
                      sx={{ mt: 2 }}
                    >
                      Publish to dbdocs.io
                    </Button>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <TerminalIcon color="primary" />
                      <Typography variant="h6">
                        CLI Setup Guide
                      </Typography>
                    </Box>

                    <Typography variant="body2" paragraph>
                      Install and use dbdocs CLI for automated documentation:
                    </Typography>

                    <Typography variant="subtitle2" gutterBottom>
                      1. Install dbdocs CLI:
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 1, mb: 2, bgcolor: 'grey.900' }}>
                      <code style={{ color: '#fff' }}>npm install -g dbdocs</code>
                    </Paper>

                    <Typography variant="subtitle2" gutterBottom>
                      2. Login to dbdocs:
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 1, mb: 2, bgcolor: 'grey.900' }}>
                      <code style={{ color: '#fff' }}>dbdocs login</code>
                    </Paper>

                    <Typography variant="subtitle2" gutterBottom>
                      3. Build documentation:
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 1, mb: 2, bgcolor: 'grey.900' }}>
                      <code style={{ color: '#fff' }}>dbdocs build schema/{schemas.find(s => s.id === currentSchemaId)?.filename || 'schema.dbml'}</code>
                    </Paper>

                    <Typography variant="subtitle2" gutterBottom>
                      4. CI/CD Integration:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Add to your Git hooks or CI pipeline to auto-update docs on schema changes.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>
          </CardContent>
        </Card>
      </Box>

      {/* Schema Menu */}
      <Menu
        anchorEl={schemaMenuAnchor}
        open={Boolean(schemaMenuAnchor)}
        onClose={() => setSchemaMenuAnchor(null)}
      >
        <MenuItem onClick={() => {
          if (selectedSchemaForMenu) {
            deleteSchema(selectedSchemaForMenu);
          }
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Schema</ListItemText>
        </MenuItem>
      </Menu>

      {/* New Schema Dialog */}
      <Dialog
        open={showNewSchemaDialog}
        onClose={() => setShowNewSchemaDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Schema</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Schema Name"
              value={newSchemaName}
              onChange={(e) => setNewSchemaName(e.target.value)}
              fullWidth
              required
              helperText="E.g., User Management, Analytics"
            />
            <TextField
              label="Description"
              value={newSchemaDescription}
              onChange={(e) => setNewSchemaDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
              helperText="Brief description of what this schema contains"
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newSchemaCategory}
                onChange={(e) => setNewSchemaCategory(e.target.value)}
                label="Category"
              >
                {Object.entries(schemasIndex.categories).map(([id, category]) => (
                  <MenuItem key={id} value={id}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {categoryIcons[id]}
                      {category.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewSchemaDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={createNewSchema}
            disabled={!newSchemaName.trim()}
          >
            Create Schema
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export SQL Dialog */}
      <Dialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Export to SQL</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel>Database Type</InputLabel>
            <Select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
              label="Database Type"
            >
              <MenuItem value="postgres">PostgreSQL</MenuItem>
              <MenuItem value="mysql">MySQL</MenuItem>
              <MenuItem value="mssql">SQL Server</MenuItem>
            </Select>
          </FormControl>
          
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.900' }}>
            <pre style={{ 
              margin: 0, 
              color: '#fff', 
              fontSize: '0.875rem',
              overflow: 'auto',
              maxHeight: '400px'
            }}>
              {exportedSQL}
            </pre>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<CopyIcon />}
            onClick={() => copyToClipboard(exportedSQL)}
          >
            Copy SQL
          </Button>
        </DialogActions>
      </Dialog>

      {/* dbdocs.io Dialog */}
      <Dialog
        open={showDbdocsDialog}
        onClose={() => setShowDbdocsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <DocsIcon color="primary" />
            Publish to dbdocs.io
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <Alert severity="info" icon={<InfoIcon />}>
              To publish your documentation, you'll need to use the dbdocs CLI.
            </Alert>

            <TextField
              label="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              fullWidth
              helperText="This will be your dbdocs URL: dbdocs.io/username/project-name"
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Quick Steps:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2" component="div">
                  1. Save your DBML file locally<br />
                  2. Run: <code style={{ backgroundColor: '#e8e8e8', padding: '2px 4px' }}>
                    dbdocs build schema/{schemas.find(s => s.id === currentSchemaId)?.filename} --project {projectName}
                  </code><br />
                  3. Your docs will be available at the provided URL
                </Typography>
              </Paper>
            </Box>

            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => {
                  downloadSchema();
                  setSnackbarMessage('Schema downloaded');
                }}
                fullWidth
              >
                Download DBML
              </Button>
              <Button
                variant="outlined"
                startIcon={<LinkIcon />}
                href="https://dbdocs.io"
                target="_blank"
                fullWidth
              >
                Visit dbdocs.io
              </Button>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDbdocsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* DBML Syntax Reference Dialog */}
      <Dialog
        open={syntaxReferenceOpen}
        onClose={() => setSyntaxReferenceOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>DBML Syntax Reference</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Basic Table Definition
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.100' }}>
            <pre style={{ margin: 0, fontSize: '0.875rem' }}>{`Table table_name {
  id int [pk, increment] // primary key
  name varchar [not null, unique]
  created_at timestamp [default: 'now()']
  
  Note: 'Table description'
}`}</pre>
          </Paper>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Field Types & Constraints
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.100' }}>
            <pre style={{ margin: 0, fontSize: '0.875rem' }}>{`// Common types: int, varchar, text, boolean, timestamp, json, decimal
// Constraints: pk, unique, not null, default: 'value'

email varchar [unique, not null]
status varchar [default: 'active']
price decimal(10,2) [not null]`}</pre>
          </Paper>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Relationships
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.100' }}>
            <pre style={{ margin: 0, fontSize: '0.875rem' }}>{`// Many-to-one
Ref: posts.user_id > users.id

// One-to-one
Ref: users.profile_id - profiles.id

// Many-to-many (use junction table)
Ref: user_roles.user_id > users.id
Ref: user_roles.role_id > roles.id

// With cascade
Ref: orders.user_id > users.id [delete: cascade]`}</pre>
          </Paper>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Enums & Indexes
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.100' }}>
            <pre style={{ margin: 0, fontSize: '0.875rem' }}>{`Enum status {
  active
  inactive
  pending
}

Table users {
  id int [pk]
  email varchar
  status status [not null]
  
  Indexes {
    email [unique]
    (status, created_at) [name: 'idx_status_time']
  }
}`}</pre>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSyntaxReferenceOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={3000}
        onClose={() => setSnackbarMessage('')}
        message={snackbarMessage}
      />
    </Box>
  );
};