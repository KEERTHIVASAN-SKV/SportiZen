import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PlayerDashboard from './PlayerDashboard';
import CoachDashboard from './CoachDashboard';
import OrgDashboard from './OrgDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'player':
      return <PlayerDashboard />;
    case 'coach':
      return <CoachDashboard />;
    case 'organization':
      return <OrgDashboard />;
    default:
      return <PlayerDashboard />;
  }
};

export default Dashboard;