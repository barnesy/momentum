// Test for dynamic component rendering

const testCode = `export const TestCard = ({ title, description, status = 'active' }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
        <Chip 
          label={status} 
          size="small" 
          color={getStatusColor()}
        />
      </CardContent>
    </Card>
  );
};`;

console.log('Test component code:', testCode);