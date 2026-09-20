import React from 'react';
import { UserRole, UserProfile, Employee } from '../types';
import { LoginForm } from './LoginForm';

interface RoleSelectorProps {
  onSelectRole: (role: UserRole, customUser?: UserProfile) => void;
  employees?: Employee[];
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole, employees = [] }) => {
  return (
    <LoginForm
      onLogin={(role, customUser) => onSelectRole(role, customUser)}
      employees={employees}
    />
  );
};
