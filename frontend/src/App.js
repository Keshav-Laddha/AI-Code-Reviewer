import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeProviderCustom, useThemeMode } from './contexts/ThemeContext';

import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CodeEditor from './pages/CodeEditor';
import Sessions from './pages/Sessions';
import Profile from './pages/Profile';

import GlobalStyles from './styles/GlobalStyles';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ThemeConsumerComponent({ children }) {
  const { theme } = useThemeMode();
  return <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProviderCustom>
        <ThemeConsumerComponent>
          <GlobalStyles />
          <Router>
            <AuthProvider>
              <SocketProvider>
                <div className="App">
                  <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected routes with layout */}
                    <Route element={
                      <ProtectedRoute>
                        <Layout />
                      </ProtectedRoute>
                    }>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/editor" element={<CodeEditor />} />
                      <Route path="/sessions" element={<Sessions />} />
                      <Route path="/profile" element={<Profile />} />
                    </Route>
                  </Routes>
                  <Toaster position="top-right" />
                </div>
              </SocketProvider>
            </AuthProvider>
          </Router>
        </ThemeConsumerComponent>
      </ThemeProviderCustom>
    </QueryClientProvider>
  );
}

export default App;