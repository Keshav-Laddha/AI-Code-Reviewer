import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { User, Mail, Shield, Settings, Save, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Container = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const ProfileSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const AvatarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: bold;
  position: relative;
  overflow: hidden;
`;

const AvatarUpload = styled.label`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid ${props => props.theme.colors.surface};
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: ${props => props.theme.colors.text};
`;

const UserRole = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
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

  &.error {
    border-color: #ef4444;
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

const ErrorMessage = styled.span`
  color: #ef4444;
  font-size: 0.75rem;
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  background: ${props => props.theme.colors.primary};
  color: white;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  align-self: flex-start;

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 0.25rem;
`;

const Profile = () => {
    const { user, setUser, token } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');
    const [avatarFile, setAvatarFile] = useState(null);

    // Main profile info form
    const {
        register: registerProfile,
        handleSubmit: handleProfileSubmit,
        formState: { errors: profileErrors },
        reset: resetProfile
    } = useForm({
        defaultValues: {
            name: user?.name || '',
            email: user?.email || ''
        }
    });

    // Preferences form
    const {
        register: registerPrefs,
        handleSubmit: handlePrefsSubmit,
        formState: { errors: prefsErrors },
        reset: resetPrefs
    } = useForm({
        defaultValues: {
            theme: user?.preferences?.theme || 'light',
            notifications: user?.preferences?.notifications ?? true
        }
    });

    // Handle avatar file select and preview
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    // Handle profile info update (name, email, avatar)
    const onProfileSubmit = async (data) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('email', data.email);
            if (avatarFile) formData.append('avatar', avatarFile);

            const response = await fetch('/api/profile/update', {
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Update failed');

            toast.success('Profile updated!');
            setUser(result.user || { ...user, ...data, avatarUrl: result.avatarUrl || avatarPreview });
            localStorage.setItem('user', JSON.stringify(result.user));
            resetProfile(data);
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle preferences update (theme, notifications)
    const onPrefsSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ preferences: data })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Update failed');

            toast.success('Preferences updated!');
            //   setUser((prev) => ({
            //     ...prev,
            //     preferences: { ...prev.preferences, ...data }
            //   }));
            //   // Persist to localStorage (if you use it)
            // localStorage.setItem('user', JSON.stringify({
            //   ...user,
            //   preferences: { ...user.preferences, ...data }
            // }));
            setUser(prev => {
                const updated = { ...prev, preferences: { ...prev.preferences, ...data } };
                localStorage.setItem('user', JSON.stringify(updated));
                return updated;
            });
            resetPrefs(data);
        } catch (error) {
            console.error('Preferences update error:', error);
            toast.error('Failed to update preferences');
        } finally {
            setIsLoading(false);
        }
    };

    const stats = [
        { value: '12', label: 'Sessions Created' },
        { value: '45', label: 'Reviews Done' },
        { value: '23', label: 'Collaborations' },
        { value: '89%', label: 'Code Quality' }
    ];

    return (
        <Container>
            <Header>
                <Title>Profile & Settings</Title>
            </Header>
            <ProfileSection>
                <SectionHeader>
                    <User size={20} />
                    <SectionTitle>Personal Information</SectionTitle>
                </SectionHeader>

                <AvatarSection>
                    <Avatar>
                        {avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt="Avatar"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            user?.name?.charAt(0)?.toUpperCase() || 'U'
                        )}
                        <AvatarUpload htmlFor="avatar-upload">
                            <Camera size={14} color="white" />
                            <HiddenFileInput
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                            />
                        </AvatarUpload>
                    </Avatar>
                    <UserInfo>
                        <UserName>{user?.name}</UserName>
                        <UserRole>{user?.role || 'User'}</UserRole>
                    </UserInfo>
                </AvatarSection>

                <Form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                    <FormRow>
                        <FormGroup>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                className={profileErrors.name ? 'error' : ''}
                                {...registerProfile('name', {
                                    required: 'Name is required',
                                    minLength: {
                                        value: 2,
                                        message: 'Name must be at least 2 characters'
                                    }
                                })}
                            />
                            {profileErrors.name && <ErrorMessage>{profileErrors.name.message}</ErrorMessage>}
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                className={profileErrors.email ? 'error' : ''}
                                {...registerProfile('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address'
                                    }
                                })}
                            />
                            {profileErrors.email && <ErrorMessage>{profileErrors.email.message}</ErrorMessage>}
                        </FormGroup>
                    </FormRow>

                    <SaveButton type="submit" disabled={isLoading}>
                        <Save size={16} />
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </SaveButton>
                </Form>
            </ProfileSection>

            <ProfileSection>
                <SectionHeader>
                    <Settings size={20} />
                    <SectionTitle>Preferences</SectionTitle>
                </SectionHeader>

                <Form onSubmit={handlePrefsSubmit(onPrefsSubmit)}>
                    <FormRow>
                        <FormGroup>
                            <Label htmlFor="theme">Theme</Label>
                            <Select
                                id="theme"
                                {...registerPrefs('theme')}
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </Select>
                        </FormGroup>

                        <FormGroup>
                            <Label>Notifications</Label>
                            <CheckboxWrapper>
                                <Checkbox
                                    id="notifications"
                                    type="checkbox"
                                    {...registerPrefs('notifications')}
                                />
                                <Label htmlFor="notifications">Enable notifications</Label>
                            </CheckboxWrapper>
                        </FormGroup>
                    </FormRow>

                    <SaveButton type="submit" disabled={isLoading}>
                        <Save size={16} />
                        {isLoading ? 'Saving...' : 'Save Preferences'}
                    </SaveButton>
                </Form>
            </ProfileSection>

            <ProfileSection>
                <SectionHeader>
                    <Shield size={20} />
                    <SectionTitle>Activity Stats</SectionTitle>
                </SectionHeader>

                <StatsGrid>
                    {stats.map((stat, index) => (
                        <StatCard key={index}>
                            <StatValue>{stat.value}</StatValue>
                            <StatLabel>{stat.label}</StatLabel>
                        </StatCard>
                    ))}
                </StatsGrid>
            </ProfileSection>
        </Container>
    );
};

export default Profile;