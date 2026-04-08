export const isAdminLikeRole = (role) => ['admin', 'faculty'].includes(role);

export const getDefaultRoute = (user) => (isAdminLikeRole(user?.role) ? '/admin' : '/predictor');

export const getRoleLabel = (role) => {
  switch (role) {
    case 'admin':
      return 'Admin';
    case 'faculty':
      return 'Faculty';
    default:
      return 'User';
  }
};
