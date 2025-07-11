import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import {
  Plus,
  Search,
  Filter,
  Code,
  Users,
  Calendar,
  Settings,
  Trash2,
  Edit,
  Play,
  Globe,
  Lock,
  Share2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collaborationService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: ${props => props.theme.colors.primary};
  color: white;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-1px);
  }
`;

const JoinSessionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 2px solid ${props => props.theme.colors.primary};
  border-radius: 8px;
  background: transparent;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.primary};
    color: white;
    transform: translateY(-1px);
  }
`;

const Filters = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  flex: 1;
  min-width: 300px;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }

  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
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

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.background};
  }
`;

const SessionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
`;

const SessionCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const SessionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const SessionTitle = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  color: ${props => props.theme.colors.text};
  flex: 1;
`;

const SessionActions = styled.div`
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;

  ${SessionCard}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
  }
`;

const SessionMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const LanguageTag = styled.span`
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const SessionDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  line-height: 1.5;
`;

const SessionFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const JoinButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: ${props => props.theme.colors.primary};
  color: white;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
  }
`;

const PrivacyIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  color: ${props => props.theme.colors.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${props => props.theme.colors.textSecondary};
  padding: 0;
  
  &:hover {
    color: ${props => props.theme.colors.text};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;

  ${props => props.primary ? `
    background: ${props.theme.colors.primary};
    color: white;
    &:hover {
      background: ${props.theme.colors.primaryHover};
    }
  ` : `
    background: ${props.theme.colors.surface};
    color: ${props.theme.colors.text};
    border: 1px solid ${props.theme.colors.border};
    &:hover {
      background: ${props.theme.colors.background};
    }
  `}
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const Sessions = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    language: 'javascript',
    isPublic: false
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: sessions, isLoading } = useQuery(
    'sessions',
    collaborationService.getSessions
  );

  const createSessionMutation = useMutation(
    collaborationService.createSession,
    {
      onSuccess: (newSession) => {
        queryClient.invalidateQueries('sessions');
        setShowCreateModal(false);
        setFormData({ name: '', description: '', language: 'javascript', isPublic: false });
        toast.success('Session created successfully!');
        navigate(`/editor?session=${newSession._id}`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to create session');
      }
    }
  );

  const handleCreateSession = (e) => {
    e.preventDefault();
    createSessionMutation.mutate(formData);
  };

  const handleJoinSession = async (sessionId) => {
    try {
      // First, try to join the session (this will add the user to participants)
      await collaborationService.joinSession(sessionId);
      toast.success('Joined session successfully!');
      navigate(`/editor?session=${sessionId}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to join session');
    }
  };

  const handleJoinById = async (e) => {
    e.preventDefault();
    if (!sessionId.trim()) {
      toast.error('Please enter a session ID');
      return;
    }
    
    try {
      await collaborationService.joinSession(sessionId.trim());
      toast.success('Joined session successfully!');
      setShowJoinModal(false);
      setSessionId('');
      navigate(`/editor?session=${sessionId.trim()}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to join session');
    }
  };

  const handleShareSession = async (session) => {
    try {
      // Copy session ID to clipboard
      await navigator.clipboard.writeText(session._id);
      toast.success('Session ID copied to clipboard!');
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = session._id;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Session ID copied to clipboard!');
    }
  };

  const filteredSessions = sessions?.sessions?.filter(session =>
    session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Container>
      <Header>
        <Title>Sessions</Title>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <JoinSessionButton onClick={() => setShowJoinModal(true)}>
            <Play size={16} />
            Join Session
          </JoinSessionButton>
          <CreateButton onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            Create Session
          </CreateButton>
        </div>
      </Header>

      <Filters>
        <SearchContainer>
          <SearchIcon />
          <SearchInput
            type="text"
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
        <FilterButton>
          <Filter size={16} />
          Filter
        </FilterButton>
      </Filters>

      <SessionsGrid>
        {filteredSessions.length === 0 ? (
          <EmptyState>
            <Code size={64} color="#ccc" />
            <h3>No sessions found</h3>
            <p>Create your first session to start collaborating</p>
          </EmptyState>
        ) : (
          filteredSessions.map((session) => (
            <SessionCard
              key={session._id}
              onClick={() => handleJoinSession(session._id)}
            >
              <SessionHeader>
                <SessionTitle>{session.name}</SessionTitle>
                <SessionActions>
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareSession(session);
                    }}
                    title="Share Session ID"
                  >
                    <Share2 size={16} />
                  </ActionButton>
                  <ActionButton>
                    <Edit size={16} />
                  </ActionButton>
                  <ActionButton>
                    <Settings size={16} />
                  </ActionButton>
                  <ActionButton>
                    <Trash2 size={16} />
                  </ActionButton>
                </SessionActions>
              </SessionHeader>

              <SessionMeta>
                <MetaItem>
                  <Users size={14} />
                  {session.participants?.length || 0} participants
                </MetaItem>
                <MetaItem>
                  <Calendar size={14} />
                  {new Date(session.createdAt).toLocaleDateString()}
                </MetaItem>
                <LanguageTag>{session.language}</LanguageTag>
              </SessionMeta>

              <SessionDescription>
                {session.description || 'No description provided'}
              </SessionDescription>

              <SessionFooter>
                <PrivacyIndicator>
                  {session.isPublic ? <Globe size={12} /> : <Lock size={12} />}
                  {session.isPublic ? 'Public' : 'Private'}
                </PrivacyIndicator>
                <JoinButton onClick={(e) => {
                  e.stopPropagation();
                  handleJoinSession(session._id);
                }}>
                  <Play size={14} />
                  Join
                </JoinButton>
              </SessionFooter>
            </SessionCard>
          ))
        )}
      </SessionsGrid>

      {showCreateModal && (
        <Modal onClick={() => setShowCreateModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Create New Session</ModalTitle>
              <CloseButton onClick={() => setShowCreateModal(false)}>
                ×
              </CloseButton>
            </ModalHeader>

            <Form onSubmit={handleCreateSession}>
              <FormGroup>
                <Label htmlFor="name">Session Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter session name"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="description">Description</Label>
                <TextArea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your session..."
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="language">Language</Label>
                <Select
                  id="language"
                  value={formData.language}
                  onChange={(e) => setFormData({...formData, language: e.target.value})}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <CheckboxWrapper>
                  <Checkbox
                    id="isPublic"
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                  />
                  <Label htmlFor="isPublic">Make session public</Label>
                </CheckboxWrapper>
              </FormGroup>

              <ModalActions>
                <Button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" primary disabled={createSessionMutation.isLoading}>
                  {createSessionMutation.isLoading ? 'Creating...' : 'Create Session'}
                </Button>
              </ModalActions>
            </Form>
          </ModalContent>
        </Modal>
      )}

      {showJoinModal && (
        <Modal onClick={() => setShowJoinModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Join Session</ModalTitle>
              <CloseButton onClick={() => setShowJoinModal(false)}>
                ×
              </CloseButton>
            </ModalHeader>

            <Form onSubmit={handleJoinById}>
              <FormGroup>
                <Label htmlFor="sessionId">Session ID</Label>
                <Input
                  id="sessionId"
                  type="text"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  placeholder="Enter session ID (e.g., 507d89a4f2b5c0a1b2c3d4e5)"
                  required
                />
                <p style={{ 
                  fontSize: '0.75rem', 
                  color: '#6b7280', 
                  margin: '0.5rem 0 0 0' 
                }}>
                  Ask the session owner to share the session ID with you.
                </p>
              </FormGroup>

              <ModalActions>
                <Button type="button" onClick={() => setShowJoinModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" primary>
                  Join Session
                </Button>
              </ModalActions>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Sessions;
