// Script to help migrate from Grid v1 to Grid v2
// Grid v2 changes:
// - Remove `item` prop
// - Change xs={12} to size={12}
// - Change sm={6} to size={{ sm: 6 }}
// - Change md={4} to size={{ md: 4 }}
// - For responsive: xs={12} sm={6} md={4} becomes size={{ xs: 12, sm: 6, md: 4 }}

const gridV2Migration = {
  // Single breakpoint
  'xs={12}': 'size={12}',
  'xs={6}': 'size={6}',
  'xs={4}': 'size={4}',
  'xs={3}': 'size={3}',
  
  // Multiple breakpoints pattern
  'xs={12} sm={6}': 'size={{ xs: 12, sm: 6 }}',
  'xs={12} sm={6} md={4}': 'size={{ xs: 12, sm: 6, md: 4 }}',
  'xs={12} sm={6} md={4} lg={3}': 'size={{ xs: 12, sm: 6, md: 4, lg: 3 }}',
  'xs={12} md={6}': 'size={{ xs: 12, md: 6 }}',
  'xs={12} md={8}': 'size={{ xs: 12, md: 8 }}',
  'xs={12} md={4}': 'size={{ xs: 12, md: 4 }}',
  'xs={6} sm={3}': 'size={{ xs: 6, sm: 3 }}',
  'xs={12} sm={6} lg={4}': 'size={{ xs: 12, sm: 6, lg: 4 }}',
  
  // Remove item prop
  '<Grid item': '<Grid',
};

console.log('Grid v2 Migration Guide:');
console.log('1. Remove all "item" props from Grid components');
console.log('2. Replace breakpoint props with size prop:');
console.log('   - xs={12} → size={12}');
console.log('   - xs={12} sm={6} → size={{ xs: 12, sm: 6 }}');
console.log('3. For container grids, keep spacing prop as is');