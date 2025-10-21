import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '@/services/api';
import { useAuth } from './AuthContext';

interface Notification {
  id: string;
  type: 'proposal' | 'message' | 'job' | 'system';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Get user-specific localStorage key
  const getStorageKey = () => {
    return user ? `notifications_${user.id}` : 'notifications_guest';
  };

  // Generate unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Add notification
  const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      read: false,
      created_at: new Date().toISOString(),
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-remove after 10 seconds for non-persistent notifications
    if (notification.type !== 'proposal' && notification.type !== 'message') {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 10000);
    }
  };

  // Mark as read
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Remove notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
  };

  // Load notifications from localStorage on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      const savedNotifications = localStorage.getItem(getStorageKey());
      if (savedNotifications) {
        try {
          const parsed = JSON.parse(savedNotifications);
          setNotifications(parsed);
        } catch (error) {
          console.error('Error loading notifications from localStorage:', error);
        }
      } else {
        setNotifications([]);
      }
    } else {
      setNotifications([]);
    }
  }, [user, isAuthenticated]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem(getStorageKey(), JSON.stringify(notifications));
    }
  }, [notifications, user, isAuthenticated]);

  // Real-time notification checking
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const interval = setInterval(async () => {
      try {
        // Check for new messages
        const messagesResponse = await apiService.getUnreadCount();
        if (messagesResponse.success && messagesResponse.data.unread_count > 0) {
          const existingMessageNotifications = notifications.filter(n => n.type === 'message' && !n.read);
          if (existingMessageNotifications.length === 0) {
            addNotification({
              type: 'message',
              title: 'New Messages',
              message: `You have ${messagesResponse.data.unread_count} unread message(s)`,
            });
          }
        }

        // Check for new proposals (if user is a client)
        if (user.role === 'client') {
          try {
            // Get user's jobs first
            const userJobsResponse = await apiService.getUserJobs();
            if (userJobsResponse.success && userJobsResponse.data) {
              const userJobs = Array.isArray(userJobsResponse.data) ? userJobsResponse.data : userJobsResponse.data.jobs || [];
              
              // Check for new proposals on each job
              for (const job of userJobs) {
                const proposalsResponse = await apiService.getJobProposals(job.id);
                if (proposalsResponse.success && proposalsResponse.data.proposals) {
                  const newProposals = proposalsResponse.data.proposals.filter((p: any) => p.status === 'pending');
                  const existingProposalNotifications = notifications.filter(n => 
                    n.type === 'proposal' && 
                    !n.read && 
                    n.data?.jobId === job.id
                  );
                  
                  if (newProposals.length > 0 && newProposals.length > existingProposalNotifications.length) {
                    addNotification({
                      type: 'proposal',
                      title: 'New Proposals',
                      message: `You have ${newProposals.length} new proposal(s) for "${job.title}"`,
                      data: { jobId: job.id, jobTitle: job.title }
                    });
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error checking proposals:', error);
          }
        }
      } catch (error) {
        // Silently fail for background checks
        console.error('Background notification check failed:', error);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [notifications, user, isAuthenticated]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    loading,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
