import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Password reset is now handled inline in the auth modal (forgot password flow).
// This page redirects users back to the homepage.
export default function ResetPassword() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  return null;
}
