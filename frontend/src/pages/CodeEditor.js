import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import styled from 'styled-components';
import { Play, Users, MessageSquare, Settings, Download } from 'lucide-react';
import toast from 'react-hot-toast';

import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import ReviewPanel from '../components/ReviewPanel';
import CollaboratorsList from '../components/CollaboratorsList';
import CommentPanel from '../components/CommentPanel';
import { aiService } from '../services/api';

const EditorContainer = styled.div`
  display: flex;
  height: 100vh;
  background: ${props => props.theme.colors.background};
`;

const MainEditor = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 1rem;
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const EditorActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: ${props => props.primary ? props.theme.colors.primary : props.theme.colors.surface};
  color: ${props => props.primary ? 'white' : props.theme.colors.text};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.primary ? props.theme.colors.primaryHover : props.theme.colors.border};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SidePanel = styled.div`
  width: 400px;
  background: ${props => props.theme.colors.surface};
  border-left: 1px solid ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const Tab = styled.button`
  flex: 1;
  padding: 1rem;
  border: none;
  background: ${props => props.active ? props.theme.colors.background : 'transparent'};
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.background};
  }
`;

const StatusBar = styled.div`
  padding: 0.5rem 1rem;
  background: ${props => props.theme.colors.surface};
  border-top: 1px solid ${props => props.theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const CodeEditor = () => {
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const { socket, isConnected } = useSocket();
    const [code, setCode] = useState('// Welcome to the AI Code Review Platform\n// Start typing your code here...\n\n');
    const [language, setLanguage] = useState('javascript');
    const [isReviewing, setIsReviewing] = useState(false);
    const [review, setReview] = useState(null);
    const [collaborators, setCollaborators] = useState([]);
    const [comments, setComments] = useState([]);
    const [activeTab, setActiveTab] = useState('review');
    const [sessionId, setSessionId] = useState(null);
    const editorRef = useRef(null);

    useEffect(() => {
        const saved = localStorage.getItem(`code_${language}`);
        if (saved !== null) setCode(saved);
    }, [language]);

    useEffect(() => {
        localStorage.setItem(`code_${language}`, code);
    }, [code, language]);

    useEffect(() => {
        const session = searchParams.get('session');
        if (session) {
            setSessionId(session);
            if (socket && isConnected) {
                socket.emit('joinSession', session);
            }
        }
    }, [searchParams, socket, isConnected]);

    useEffect(() => {
        if (socket) {
            socket.on('sessionJoined', (data) => {
                setCode(data.code);
                setLanguage(data.language);
                setCollaborators(data.participants);
                toast.success('Joined collaboration session');
            });

            socket.on('codeChange', (data) => {
                setCode(data.code);
                if (editorRef.current) {
                    editorRef.current.setValue(data.code);
                }
            });

            socket.on('userJoined', (data) => {
                setCollaborators(prev => [...prev, data.user]);
                toast.success(`${data.user.name} joined the session`);
            });

            socket.on('userLeft', (data) => {
                setCollaborators(prev => prev.filter(c => c.id !== data.user.id));
                toast(`${data.user.name} left the session`);
            });

            socket.on('commentAdded', (comment) => {
                setComments(prev => [...prev, comment]);
                toast.success('New comment added');
            });

            socket.on('reviewStarted', (data) => {
                setIsReviewing(true);
                toast('AI review started...');
            });

            socket.on('reviewCompleted', (data) => {
                setIsReviewing(false);
                setReview(data.result);
                setActiveTab('review');
                toast.success('AI review completed');
            });

            return () => {
                socket.off('sessionJoined');
                socket.off('codeChange');
                socket.off('userJoined');
                socket.off('userLeft');
                socket.off('commentAdded');
                socket.off('reviewStarted');
                socket.off('reviewCompleted');
            };
        }
    }, [socket]);

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;

        // Setup real-time collaboration
        editor.onDidChangeModelContent(() => {
            if (sessionId && socket) {
                socket.emit('codeChange', {
                    sessionId,
                    code: editor.getValue(),
                    changes: [] // You could implement detailed change tracking here
                });
            }
        });

        editor.onDidChangeCursorPosition((e) => {
            if (sessionId && socket) {
                socket.emit('cursorPosition', {
                    sessionId,
                    position: e.position
                });
            }
        });
    };

    const handleCodeChange = (value) => {
        setCode(value);
    };

    const handleRunReview = async () => {
        if (!code.trim()) {
            toast.error('Please enter some code to review');
            return;
        }

        setIsReviewing(true);
        try {
            if (sessionId && socket) {
                socket.emit('requestAIReview', {
                    sessionId,
                    code,
                    language
                });
            } else {
                const result = await aiService.reviewCode(code, language);
                setReview(result);
                setActiveTab('review');
                toast.success('Code review completed');
            }
        } catch (error) {
            console.error('Review error:', error);
            toast.error('Failed to review code');
        } finally {
            setIsReviewing(false);
        }
    };

    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);
    };

    const handleDownloadCode = () => {
        const element = document.createElement('a');
        const file = new Blob([code], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `code.${language === 'javascript' ? 'js' : language}`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const addComment = (line, text) => {
        if (sessionId && socket) {
            socket.emit('addComment', {
                sessionId,
                comment: { line, text }
            });
        } else {
            const comment = {
                id: Date.now().toString(),
                line,
                text,
                author: user,
                timestamp: new Date()
            };
            setComments(prev => [...prev, comment]);
        }
    };

    return (
        <EditorContainer>
            <MainEditor>
                <EditorHeader>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <select
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            style={{
                                padding: '0.5rem',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                background: 'white'
                            }}
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="typescript">TypeScript</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                            <option value="c">C</option>
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                        </select>
                        {sessionId && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Users size={16} />
                                <span>{collaborators.length} collaborators</span>
                            </div>
                        )}
                    </div>
                    <EditorActions>
                        <ActionButton onClick={handleDownloadCode}>
                            <Download size={16} />
                            Download
                        </ActionButton>
                        <ActionButton primary onClick={handleRunReview} disabled={isReviewing}>
                            <Play size={16} />
                            {isReviewing ? 'Reviewing...' : 'Run AI Review'}
                        </ActionButton>
                    </EditorActions>
                </EditorHeader>

                <div style={{ flex: 1 }}>
                    <Editor
                        height="100%"
                        language={language}
                        value={code}
                        onChange={handleCodeChange}
                        onMount={handleEditorDidMount}
                        theme="vs-dark"
                        options={{
                            fontSize: 14,
                            minimap: { enabled: true },
                            wordWrap: 'on',
                            lineNumbers: 'on',
                            folding: true,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            tabSize: 2,
                            insertSpaces: true,
                            renderWhitespace: 'boundary',
                            smoothScrolling: true,
                            cursorBlinking: 'smooth',
                            cursorSmoothCaretAnimation: true
                        }}
                    />
                </div>

                <StatusBar>
                    <div>
                        {sessionId ? `Session: ${sessionId}` : 'Local editing'}
                    </div>
                    <div>
                        Lines: {code.split('\n').length} | Language: {language}
                    </div>
                </StatusBar>
            </MainEditor>

            <SidePanel>
                <TabContainer>
                    <Tab
                        active={activeTab === 'review'}
                        onClick={() => setActiveTab('review')}
                    >
                        Review
                    </Tab>
                    <Tab
                        active={activeTab === 'comments'}
                        onClick={() => setActiveTab('comments')}
                    >
                        <MessageSquare size={16} />
                        Comments
                    </Tab>
                    {sessionId && (
                        <Tab
                            active={activeTab === 'collaborators'}
                            onClick={() => setActiveTab('collaborators')}
                        >
                            <Users size={16} />
                            Users
                        </Tab>
                    )}
                </TabContainer>

                {activeTab === 'review' && (
                    <ReviewPanel
                        review={review}
                        isLoading={isReviewing}
                        onAddComment={addComment}
                    />
                )}

                {activeTab === 'comments' && (
                    <CommentPanel
                        comments={comments}
                        onAddComment={addComment}
                        code={code}
                    />
                )}

                {activeTab === 'collaborators' && sessionId && (
                    <CollaboratorsList
                        collaborators={collaborators}
                        currentUser={user}
                    />
                )}
            </SidePanel>
        </EditorContainer>
    );
};

export default CodeEditor;