import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { 
  Code, 
  Users, 
  Activity, 
  Plus, 
  TrendingUp, 
  Clock, 
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collaborationService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.color || props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const QuickActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: ${props => props.primary ? props.theme.colors.primary : props.theme.colors.surface};
  color: ${props => props.primary ? 'white' : props.theme.colors.text};
  border: 1px solid ${props => props.primary ? props.theme.colors.primary : props.theme.colors.border};
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.primary ? props.theme.colors.primaryHover : props.theme.colors.background};
    transform: translateY(-1px);
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 1.5rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  color: ${props => props.theme.colors.text};
`;

const SectionAction = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  font-size: 0.875rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const SessionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.surface};
    transform: translateX(4px);
  }
`;

const SessionIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${props => props.color || props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const SessionContent = styled.div`
  flex: 1;
`;

const SessionName = styled.div`
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.25rem;
`;

const SessionMeta = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${props => props.theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const ActivityIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.color || props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityText = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text};
`;

const ActivityTime = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: sessions, isLoading: sessionsLoading } = useQuery(
    'sessions',
    collaborationService.getSessions,
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const stats = [
    {
      icon: <Code size={24} />,
      value: sessions?.sessions?.length || 0,
      label: 'Total Sessions',
      color: '#3b82f6'
    },
    {
      icon: <Users size={24} />,
      value: '12',
      label: 'Collaborators',
      color: '#10b981'
    },
    {
      icon: <Activity size={24} />,
      value: '24',
      label: 'Reviews Done',
      color: '#f59e0b'
    },
    {
      icon: <TrendingUp size={24} />,
      value: '89%',
      label: 'Code Quality',
      color: '#8b5cf6'
    }
  ];

  const recentActivity = [
    {
      icon: <CheckCircle size={16} />,
      text: 'Code review completed for React Component',
      time: '2 minutes ago',
      color: '#10b981'
    },
    {
      icon: <Users size={16} />,
      text: 'John Doe joined session "Backend API"',
      time: '5 minutes ago',
      color: '#3b82f6'
    },
    {
      icon: <AlertCircle size={16} />,
      text: 'Security issue detected in authentication.js',
      time: '10 minutes ago',
      color: '#ef4444'
    },
    {
      icon: <FileText size={16} />,
      text: 'New session created: "Frontend Components"',
      time: '15 minutes ago',
      color: '#f59e0b'
    }
  ];

  const handleCreateSession = () => {
    navigate('/sessions');
  };

  const handleStartCoding = () => {
    navigate('/editor');
  };

  const handleViewSessions = () => {
    navigate('/sessions');
  };

  if (sessionsLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Container>
      <Header>
        <Title>Welcome back, {user?.name}!</Title>
        <Subtitle>Here's what's happening with your code reviews today.</Subtitle>
      </Header>

      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard key={index}>
            <StatIcon color={stat.color}>
              {stat.icon}
            </StatIcon>
            <StatContent>
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
            </StatContent>
          </StatCard>
        ))}
      </StatsGrid>

      <QuickActions>
        <ActionButton primary onClick={handleCreateSession}>
          <Plus size={16} />
          Create Session
        </ActionButton>
        <ActionButton onClick={handleStartCoding}>
          <Code size={16} />
          Start Coding
        </ActionButton>
        <ActionButton onClick={handleViewSessions}>
          <Users size={16} />
          View Sessions
        </ActionButton>
      </QuickActions>

      <ContentGrid>
        <Section>
          <SectionHeader>
            <SectionTitle>Recent Sessions</SectionTitle>
            <SectionAction onClick={handleViewSessions}>
              View All
            </SectionAction>
          </SectionHeader>
          
          {sessions?.sessions?.length === 0 ? (
            <EmptyState>
              <Code size={48} color="#ccc" />
              <p>No sessions yet</p>
              <p>Create your first session to get started</p>
            </EmptyState>
          ) : (
            sessions?.sessions?.slice(0, 5).map((session) => (
              <SessionItem 
                key={session._id}
                onClick={() => navigate(`/editor?session=${session._id}`)}
              >
                <SessionIcon color="#3b82f6">
                  <Code size={16} />
                </SessionIcon>
                <SessionContent>
                  <SessionName>{session.name}</SessionName>
                  <SessionMeta>
                    {session.language} • {session.participants?.length || 0} participants
                  </SessionMeta>
                </SessionContent>
              </SessionItem>
            ))
          )}
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>Recent Activity</SectionTitle>
          </SectionHeader>
          
          {recentActivity.map((activity, index) => (
            <ActivityItem key={index}>
              <ActivityIcon color={activity.color}>
                {activity.icon}
              </ActivityIcon>
              <ActivityContent>
                <ActivityText>{activity.text}</ActivityText>
                <ActivityTime>{activity.time}</ActivityTime>
              </ActivityContent>
            </ActivityItem>
          ))}
        </Section>
      </ContentGrid>
    </Container>
  );
};

export default Dashboard;