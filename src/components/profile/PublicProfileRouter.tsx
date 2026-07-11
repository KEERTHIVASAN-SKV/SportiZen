import React from 'react';
import { useParams } from 'react-router-dom';
import ProfilePage from './ProfilePage';

interface PublicProfileRouterProps {
  role: 'player' | 'coach' | 'organization';
}

/**
 * Thin wrapper that reads the :id URL param and renders ProfilePage.
 * ProfilePage handles the data-fetching by targetUserId.
 */
const PublicProfileRouter: React.FC<PublicProfileRouterProps> = () => {
  const { id } = useParams<{ id: string }>();
  return <ProfilePage viewedUserId={id} />;
};

export default PublicProfileRouter;
