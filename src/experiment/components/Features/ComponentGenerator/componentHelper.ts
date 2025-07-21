// Helper functions for adding components to the review queue

export const addComponentToReview = (name: string, code: string) => {
  if (typeof window !== 'undefined' && window.addReviewComponent) {
    window.addReviewComponent(name, code);
  }
};

// Example usage:
// addComponentToReview('UserDashboardCard', `
// const Component = () => {
//   return (
//     <Card>
//       <CardContent>
//         <Typography variant="h6">User Dashboard</Typography>
//       </CardContent>
//     </Card>
//   );
// };
// `);

// Declare the global function type
declare global {
  interface Window {
    addReviewComponent?: (name: string, code: string) => void;
  }
}