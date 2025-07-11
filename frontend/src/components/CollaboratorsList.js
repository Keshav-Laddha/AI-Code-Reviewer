import React from 'react';
import styled from 'styled-components';
import { User, Crown, Circle } from 'lucide-react';

const Container = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: ${props => props.theme.colors.text};
`;

const Count = styled.span`
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
`;

const CollaboratorItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  background: ${props => props.isCurrentUser ? props.theme.colors.primaryLight : props.theme.colors.background};
  border: 1px solid ${props => props.isCurrentUser ? props.theme.colors.primary : props.theme.colors.border};
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.surface};
  }
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${props => props.color || props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.875rem;
  position: relative;
`;

const StatusIndicator = styled.div`
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.online ? '#10b981' : '#6b7280'};
  border: 2px solid ${props => props.theme.colors.surface};
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UserRole = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const UserStatus = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 0.25rem;
`;

const RoleIcon = styled.div`
  color: ${props => props.theme.colors.warning};
`;

const ActivityIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
`;

const ActivityDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    switch (props.activity) {
      case 'typing': return '#3b82f6';
      case 'reviewing': return '#f59e0b';
      case 'idle': return '#6b7280';
      default: return '#10b981';
    }
  }};
`;

const ActivityText = styled.span`
  font-size: 0.625rem;
  color: ${props => props.theme.colors.textSecondary};
  text-transform: capitalize;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme.colors.textSecondary};
`;

// Generate consistent color for user avatar
const getUserColor = (userId) => {
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getActivityStatus = (user) => {
  if (user.isTyping) return 'typing';
  if (user.isReviewing) return 'reviewing';
  if (user.lastActivity && Date.now() - new Date(user.lastActivity).getTime() < 60000) {
    return 'active';
  }
  return 'idle';
};

const CollaboratorsList = ({ collaborators, currentUser }) => {
  if (!collaborators || collaborators.length === 0) {
    return (
      <Container>
        <Header>
          <Title>Collaborators</Title>
          <Count>0</Count>
        </Header>
        <EmptyState>
          <User size={48} color="#ccc" />
          <p>No collaborators yet</p>
          <p>Share this session to collaborate</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Collaborators</Title>
        <Count>{collaborators.length}</Count>
      </Header>

      {collaborators.map((collaborator) => {
        const isCurrentUser = collaborator.id === currentUser?.id;
        const activity = getActivityStatus(collaborator);
        const isOnline = collaborator.isOnline !== false;

        return (
          <CollaboratorItem
            key={collaborator.id}
            isCurrentUser={isCurrentUser}
          >
            <Avatar color={getUserColor(collaborator.id)}>
              {collaborator.name?.charAt(0)?.toUpperCase() || 'U'}
              <StatusIndicator online={isOnline} />
            </Avatar>

            <UserInfo>
              <UserName>
                {collaborator.name || 'Unknown User'}
                {collaborator.role === 'owner' && (
                  <RoleIcon>
                    <Crown size={14} />
                  </RoleIcon>
                )}
                {isCurrentUser && (
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: '#666',
                    fontWeight: 'normal'
                  }}>
                    (You)
                  </span>
                )}
              </UserName>
              <UserRole>
                {collaborator.role === 'owner' ? 'Session Owner' : 'Collaborator'}
              </UserRole>
              {collaborator.isTyping && (
                <UserStatus>Typing...</UserStatus>
              )}
              {collaborator.isReviewing && (
                <UserStatus>Reviewing code...</UserStatus>
              )}
            </UserInfo>

            <ActivityIndicator>
              <ActivityDot activity={activity} />
              <ActivityText>{activity}</ActivityText>
            </ActivityIndicator>
          </CollaboratorItem>
        );
      })}
    </Container>
  );
};

export default CollaboratorsList;