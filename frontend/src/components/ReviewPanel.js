import React from 'react';
import styled from 'styled-components';
import { AlertCircle, CheckCircle, Info, Lightbulb } from 'lucide-react';

const PanelContainer = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: ${props => props.theme.colors.textSecondary};
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid ${props => props.theme.colors.border};
  border-top: 3px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ReviewSummary = styled.div`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const ScoreContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const Score = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => {
    if (props.score >= 8) return '#10b981';
    if (props.score >= 6) return '#f59e0b';
    return '#ef4444';
  }};
`;

const IssuesList = styled.div`
  margin-top: 1rem;
`;

const IssueItem = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-left: 4px solid ${props => {
    switch (props.severity) {
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#3b82f6';
    }
  }};
`;

const IssueHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const IssueType = styled.span`
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  text-transform: uppercase;
`;

const LineNumber = styled.span`
  background: ${props => props.theme.colors.border};
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-family: monospace;
`;

const IssueMessage = styled.div`
  margin-bottom: 0.5rem;
  color: ${props => props.theme.colors.text};
`;

const IssueSuggestion = styled.div`
  padding: 0.5rem;
  background: ${props => props.theme.colors.background};
  border-radius: 4px;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const SectionTitle = styled.h3`
  margin: 1rem 0 0.5rem 0;
  color: ${props => props.theme.colors.text};
  font-size: 1.1rem;
`;

const RecommendationList = styled.ul`
  list-style: none;
  padding: 0;
`;

const RecommendationItem = styled.li`
  padding: 0.5rem;
  background: ${props => props.theme.colors.surface};
  border-radius: 4px;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const ReviewPanel = ({ review, isLoading, onAddComment }) => {
  // Debug: log the review object for every render
  console.log('REVIEW PANEL DATA:', review);

  if (isLoading) {
    return (
      <PanelContainer>
        <LoadingState>
          <Spinner />
          <div>Analyzing your code...</div>
        </LoadingState>
      </PanelContainer>
    );
  }

  if (!review) {
    return (
      <PanelContainer>
        <EmptyState>
          <Info size={48} color="#ccc" />
          <h3>No review yet</h3>
          <p>Click "Run AI Review" to get started</p>
        </EmptyState>
      </PanelContainer>
    );
  }

  // Defensive fallback: if review is not the expected shape, show debug info
  if (
    typeof review !== 'object' ||
    review === null ||
    !('overall_score' in review)
  ) {
    return (
      <PanelContainer>
        <EmptyState>
          <Info size={48} color="#ccc" />
          <h3>AI returned unexpected result</h3>
          <pre style={{
            textAlign: 'left',
            color: 'red',
            background: '#f9f9f9',
            padding: 8,
            borderRadius: 4,
            fontSize: 12,
            maxHeight: 300,
            overflow: 'auto'
          }}>
            {JSON.stringify(review, null, 2)}
          </pre>
          <p>This is a bug: please check backend response format.</p>
        </EmptyState>
      </PanelContainer>
    );
  }

  // Defensive: ensure arrays and strings
  const summary = typeof review.summary === 'string' ? review.summary : '';
  const overallScore = typeof review.overall_score === 'number' ? review.overall_score : 7;
  const issues = Array.isArray(review.issues) ? review.issues : [];
  const recommendations = Array.isArray(review.recommendations) ? review.recommendations : [];
  const compliments = Array.isArray(review.compliments) ? review.compliments : [];

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error':
        return <AlertCircle size={16} color="#ef4444" />;
      case 'warning':
        return <AlertCircle size={16} color="#f59e0b" />;
      default:
        return <Info size={16} color="#3b82f6" />;
    }
  };

  return (
    <PanelContainer>
      <ReviewSummary>
        <ScoreContainer>
          <div>
            <h3 style={{ margin: 0 }}>Overall Score</h3>
            <p style={{ margin: 0, color: '#666' }}>{summary}</p>
          </div>
          <Score score={overallScore}>
            {overallScore}/10
          </Score>
        </ScoreContainer>
      </ReviewSummary>

      {issues.length > 0 && (
        <>
          <SectionTitle>Issues Found ({issues.length})</SectionTitle>
          <IssuesList>
            {issues.map((issue, index) => (
              <IssueItem key={index} severity={issue.severity || 'info'}>
                <IssueHeader>
                  {getSeverityIcon(issue.severity)}
                  <IssueType>{(issue.type || 'general').replace('_', ' ')}</IssueType>
                  {issue.line != null && <LineNumber>Line {issue.line}</LineNumber>}
                </IssueHeader>
                <IssueMessage>{issue.message || ''}</IssueMessage>
                {issue.suggestion && (
                  <IssueSuggestion>
                    <strong>Suggestion:</strong> {issue.suggestion}
                  </IssueSuggestion>
                )}
              </IssueItem>
            ))}
          </IssuesList>
        </>
      )}

      {recommendations.length > 0 && (
        <>
          <SectionTitle>Recommendations</SectionTitle>
          <RecommendationList>
            {recommendations.map((rec, index) => (
              <RecommendationItem key={index}>
                <Lightbulb size={16} color="#f59e0b" />
                <span>{rec}</span>
              </RecommendationItem>
            ))}
          </RecommendationList>
        </>
      )}

      {compliments.length > 0 && (
        <>
          <SectionTitle>What's Good</SectionTitle>
          <RecommendationList>
            {compliments.map((compliment, index) => (
              <RecommendationItem key={index}>
                <CheckCircle size={16} color="#10b981" />
                <span>{compliment}</span>
              </RecommendationItem>
            ))}
          </RecommendationList>
        </>
      )}
    </PanelContainer>
  );
};

export default ReviewPanel;