import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ThemeToggle from './ThemeToggle';
import { Outlet } from 'react-router-dom';
import { 
  Home, 
  Code, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User,
  Bell,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  background: ${props => props.theme.colors.background};
`;

const Sidebar = styled.div`
  width: ${props => props.collapsed ? '60px' : '250px'};
  background: ${props => props.theme.colors.surface};
  border-right: 1px solid ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: relative;
`;

const SidebarHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
  display: ${props => props.collapsed ? 'none' : 'block'};
`;

const CollapseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props => props.theme.colors.background};
  }
`;

const Navigation = styled.nav`
  flex: 1;
  padding: 1rem 0;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.text};
  text-decoration: none;
  transition: all 0.2s;
  margin: 0 0.5rem;
  border-radius: 6px;
  background: ${props => props.active ? props.theme.colors.primaryLight : 'transparent'};

  &:hover {
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.primary};
  }

  svg {
    margin-right: ${props => props.collapsed ? '0' : '0.75rem'};
    min-width: 20px;
  }

  span {
    display: ${props => props.collapsed ? 'none' : 'block'};
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.header`
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
`;

const SearchBar = styled.div`
  flex: 1;
  max-width: 400px;
  margin: 0 2rem;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 0.5rem 0.5rem 2.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 20px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.textSecondary};
  width: 16px;
  height: 16px;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &:hover {
    background: ${props => props.theme.colors.background};
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;
  background: ${props => props.theme.colors.error};
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.2s;

  &:hover {
    background: ${props => props.theme.colors.background};
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.875rem;
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  background: ${props => props.connected ? '#dcfce7' : '#fee2e2'};
  color: ${props => props.connected ? '#166534' : '#991b1b'};
  font-size: 0.75rem;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.connected ? '#10b981' : '#ef4444'};
`;

const ContentArea = styled.div`
  flex: 1;
  overflow: auto;
`;

const SidebarFooter = styled.div`
  padding: 1rem;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isConnected, onlineUsers } = useSocket();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigationItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/editor', icon: Code, label: 'Code Editor' },
    { path: '/sessions', icon: Users, label: 'Sessions' },
    { path: '/profile', icon: Settings, label: 'Profile' },
  ];

  return (
    <LayoutContainer>
      <Sidebar collapsed={collapsed}>
        <SidebarHeader>
          <Logo collapsed={collapsed}>
            AI Code Review
          </Logo>
          <CollapseButton onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </CollapseButton>
        </SidebarHeader>

        <Navigation>
          {navigationItems.map((item) => (
            <NavItem
              key={item.path}
              to={item.path}
              active={location.pathname === item.path}
              collapsed={collapsed}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavItem>
          ))}
        </Navigation>

        <SidebarFooter>
          <NavItem
            to="/login"
            onClick={handleLogout}
            collapsed={collapsed}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </NavItem>
        </SidebarFooter>
      </Sidebar>

      <MainContent>
        <Header>
          <SearchBar>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Search projects, sessions..."
            />
          </SearchBar>

          <ThemeToggle />

          <HeaderActions>
            <ConnectionStatus connected={isConnected}>
              <StatusDot connected={isConnected} />
              {isConnected ? 'Connected' : 'Disconnected'}
            </ConnectionStatus>

            <IconButton>
              <Bell size={20} />
              <NotificationBadge>3</NotificationBadge>
            </IconButton>

            <UserMenu>
              <UserAvatar>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </UserAvatar>
              {!collapsed && (
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                    {user?.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>
                    {onlineUsers.length} online
                  </div>
                </div>
              )}
            </UserMenu>
          </HeaderActions>
        </Header>

        <ContentArea>
          <Outlet />
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;