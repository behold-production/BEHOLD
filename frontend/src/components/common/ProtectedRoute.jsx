import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UnauthorizedFallback from '../../features/admin/UnauthorizedFallback';

/**
 * A wrapper component to protect routes based on authentication and roles.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children The component to render if authorized
 * @param {Array<string>} props.allowedRoles Array of roles that are allowed (e.g. ['ADMIN', 'SUPER_ADMIN'])
 * @param {string} props.fallbackPath Where to redirect if not authenticated (default: '/booking')
 */
export default function ProtectedRoute({ children, allowedRoles, fallbackPath = '/booking' }) {
  const { user, isLoading } = useAuth();

  // Show nothing or a loader while auth state is resolving
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#00e5ff] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to={fallbackPath} replace />;
  }

  // If specific roles are required, check against the user's role
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role?.toUpperCase();
    const isAllowed = allowedRoles.map(r => r.toUpperCase()).includes(userRole);
    
    if (!isAllowed) {
      return <UnauthorizedFallback roleRequired={allowedRoles.join(' / ')} />;
    }
  }

  // Authorized
  return children;
}
