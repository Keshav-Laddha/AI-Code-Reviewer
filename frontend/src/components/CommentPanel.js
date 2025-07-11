import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Send, MessageSquare, Reply, Trash2, Edit3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: ${props => props.theme.colors.text};
`;

const CommentCount = styled.span`
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
`;

const CommentsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
`;

const CommentItem = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  position: relative;
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Avatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.color || props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.75rem;
`;

const AuthorName = styled.span`
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
`;

const CommentTime = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const LineReference = styled.div`
  background: ${props => props.theme.colors.background};
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.5rem;
  font-family: monospace;
`;

const CommentContent = styled.div`
  color: ${props => props.theme.colors.text};
  line-height: 1.5;
  margin-bottom: 0.5rem;
`;

const CommentActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
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
  gap: 0.25rem;
  font-size: 0.75rem;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
  }
`;

const CommentForm = styled.div`
  padding: 1rem;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const FormTitle = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text};
`;

const LineSelector = styled.select`
  padding: 0.25rem 0.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: 0.75rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }

  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const CommentPanel = ({ comments, onAddComment, code }) => {
  const [newComment, setNewComment] = useState('');
  const [selectedLine, setSelectedLine] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const textAreaRef = useRef(null);

  const codeLines = code.split('\n');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment(selectedLine, newComment.trim());
      setNewComment('');
      setSelectedLine(1);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUserColor = (userId) => {
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
      '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
    ];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const sortedComments = [...comments].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <Container>
      <Header>
        <Title>Comments</Title>
        <CommentCount>{comments.length}</CommentCount>
      </Header>

      <CommentsContainer>
        {sortedComments.length === 0 ? (
          <EmptyState>
            <MessageSquare size={48} color="#ccc" />
            <p>No comments yet</p>
            <p>Add a comment to start the discussion</p>
          </EmptyState>
        ) : (
          sortedComments.map((comment) => (
            <CommentItem key={comment.id}>
              <CommentHeader>
                <AuthorInfo>
                  <Avatar color={getUserColor(comment.author.id)}>
                    {comment.author.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                  <AuthorName>{comment.author.name}</AuthorName>
                </AuthorInfo>
                <CommentTime>
                  {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                </CommentTime>
              </CommentHeader>

              {comment.line && (
                <LineReference>
                  Line {comment.line}: {codeLines[comment.line - 1]?.substring(0, 50)}
                  {codeLines[comment.line - 1]?.length > 50 && '...'}
                </LineReference>
              )}

              <CommentContent>{comment.text}</CommentContent>

              <CommentActions>
                <ActionButton>
                  <Reply size={12} />
                  Reply
                </ActionButton>
                {comment.author.id === user?.id && (
                  <>
                    <ActionButton>
                      <Edit3 size={12} />
                      Edit
                    </ActionButton>
                    <ActionButton>
                      <Trash2 size={12} />
                      Delete
                    </ActionButton>
                  </>
                )}
              </CommentActions>
            </CommentItem>
          ))
        )}
      </CommentsContainer>

      <CommentForm>
        <form onSubmit={handleSubmit}>
          <FormHeader>
            <FormTitle>Add Comment</FormTitle>
            <LineSelector
              value={selectedLine}
              onChange={(e) => setSelectedLine(parseInt(e.target.value))}
            >
              {codeLines.map((line, index) => (
                <option key={index + 1} value={index + 1}>
                  Line {index + 1}
                </option>
              ))}
            </LineSelector>
          </FormHeader>

          <TextArea
            ref={textAreaRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment..."
            disabled={isSubmitting}
          />

          <FormActions>
            <Button
              type="button"
              onClick={() => {
                setNewComment('');
                setSelectedLine(1);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              primary
              disabled={!newComment.trim() || isSubmitting}
            >
              <Send size={14} />
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </FormActions>
        </form>
      </CommentForm>
    </Container>
  );
};

export default CommentPanel;