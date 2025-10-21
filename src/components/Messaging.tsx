import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Send, 
  User, 
  Clock,
  ChevronRight
} from 'lucide-react';
import apiService from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface Conversation {
  job_id: number;
  job_title: string;
  other_user_id: number;
  other_user_name: string;
  other_user_avatar: string;
  other_user_role: string;
  last_message_time: string;
  message_count: number;
  last_message_content: string;
  proposal_status?: string;
}

interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  content: string;
  job_id: number | null;
  created_at: string;
  sender_name: string;
  sender_avatar: string;
}

interface MessagingProps {
  onClose?: () => void;
}

const Messaging: React.FC<MessagingProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  // Real-time polling for new messages
  useEffect(() => {
    if (!user) return;

    const pollMessages = async () => {
      // Only poll if the page is visible (user is actively using the app)
      if (document.hidden) return;
      
      try {
        if (selectedJobId) {
          await fetchMessages(selectedJobId);
        }
        // Also refresh conversations to get updated last message
        await fetchConversations();
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    };

    // Poll every 8 seconds
    const interval = setInterval(pollMessages, 8000);

    return () => clearInterval(interval);
  }, [user, selectedJobId]);

  useEffect(() => {
    if (selectedJobId) {
      fetchMessages(selectedJobId);
      // Also refresh conversations when switching to get latest data
      fetchConversations();
    }
  }, [selectedJobId]);

  // Auto-select first conversation if none is selected
  useEffect(() => {
    if (conversations.length > 0 && !selectedJobId) {
      setSelectedJobId(conversations[0].job_id);
    }
  }, [conversations, selectedJobId]);

  // Auto-scroll to bottom when new messages arrive (but only when sending new messages)
  useEffect(() => {
    if (messages.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages.length]); // Only trigger when message count changes


  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await apiService.getUserConversations();
      if (response.success && response.data) {
        const conversations = (response.data as any).conversations || [];
        setConversations(conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (jobId: number) => {
    try {
      // Get the other user ID from the selected conversation
      const conversation = conversations.find(c => c.job_id === jobId);
      if (!conversation) return;

      const response = await apiService.getConversation(conversation.other_user_id, jobId);
      if (response.success && response.data) {
        const messages = (response.data as any).messages || [];
        setMessages(messages);
        // Mark messages as read
        await apiService.markMessagesAsRead(conversation.other_user_id);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedJobId || !newMessage.trim() || !user) return;

    try {
      setSending(true);
      // Get the other user ID from the selected conversation
      const conversation = conversations.find(c => c.job_id === selectedJobId);
      if (!conversation) return;

      const response = await apiService.sendMessage({
        recipient_id: conversation.other_user_id,
        content: newMessage.trim(),
        job_id: selectedJobId
      });

      if (response.success) {
        setNewMessage('');
        // Immediately refresh messages and conversations
        await Promise.all([
          fetchMessages(selectedJobId),
          fetchConversations()
        ]);
      } else {
        console.error('Failed to send message:', response.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    const diffInHours = diffInMinutes / 60;
    const diffInDays = diffInHours / 24;

    // If the message is from today, show time
    if (diffInDays < 1) {
      if (diffInMinutes < 1) {
        return 'Just now';
      } else if (diffInMinutes < 60) {
        return `${Math.floor(diffInMinutes)}m ago`;
      } else {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    } 
    // If the message is from yesterday
    else if (diffInDays < 2) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    // If the message is older
    else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (!user) {
    return (
      <Card className="h-96">
        <CardContent className="p-6 flex items-center justify-center">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Please log in to access messages</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="h-96">
        <CardContent className="p-6 flex items-center justify-center">
          <p className="text-muted-foreground">Loading conversations...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex h-full border rounded-lg overflow-hidden">
      {/* Conversations List - Fixed Width */}
      <div className="w-80 border-r bg-muted/20 flex flex-col">
        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Conversations</h3>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No conversations yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Start by accepting a proposal
              </p>
            </div>
          ) : (
            <div className="p-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.job_id}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 mb-2 ${
                    selectedJobId === conversation.job_id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-background hover:shadow-sm'
                  }`}
                  onClick={() => setSelectedJobId(conversation.job_id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedJobId === conversation.job_id 
                        ? 'bg-primary-foreground/20' 
                        : 'bg-primary/10'
                    }`}>
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <p className={`font-medium text-sm truncate ${
                          selectedJobId === conversation.job_id ? 'text-primary-foreground' : ''
                        }`}>
                          {conversation.job_title}
                        </p>
                        <span className={`text-xs ml-2 ${
                          selectedJobId === conversation.job_id 
                            ? 'text-primary-foreground/70' 
                            : 'text-muted-foreground'
                        }`}>
                          {formatTime(conversation.last_message_time)}
                        </span>
                      </div>
                      <p className={`text-xs truncate mb-2 ${
                        selectedJobId === conversation.job_id 
                          ? 'text-primary-foreground/80' 
                          : 'text-muted-foreground'
                      }`}>
                        with {conversation.other_user_name}
                      </p>
                      <div className="flex items-center gap-1 flex-wrap">
                        <Badge 
                          variant={selectedJobId === conversation.job_id ? "secondary" : "outline"} 
                          className="text-xs"
                        >
                          {conversation.other_user_role}
                        </Badge>
                        {conversation.proposal_status && (
                          <Badge 
                            variant={selectedJobId === conversation.job_id ? "default" : "secondary"} 
                            className="text-xs"
                          >
                            {conversation.proposal_status}
                          </Badge>
                        )}
                        {conversation.message_count > 0 && (
                          <Badge 
                            variant={selectedJobId === conversation.job_id ? "outline" : "default"} 
                            className="text-xs"
                          >
                            {conversation.message_count}
                          </Badge>
                        )}
                      </div>
                      <p className={`text-xs truncate mt-2 ${
                        selectedJobId === conversation.job_id 
                          ? 'text-primary-foreground/70' 
                          : 'text-muted-foreground'
                      }`}>
                        {conversation.last_message_content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area - Flexible Width */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedJobId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-background">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-base">
                    {conversations.find(c => c.job_id === selectedJobId)?.job_title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    with {conversations.find(c => c.job_id === selectedJobId)?.other_user_name}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea ref={scrollAreaRef} className="h-full">
                <div className="p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-2xl ${
                          message.sender_id === user?.id
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-2 ${
                          message.sender_id === user?.id 
                            ? 'text-primary-foreground/70' 
                            : 'text-muted-foreground'
                        }`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-background">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={sending}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={sending || !newMessage.trim()}
                  size="sm"
                  className="px-4"
                >
                  {sending ? (
                    <Clock className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                Select a conversation
              </h3>
              <p className="text-sm text-muted-foreground">
                Choose a job conversation from the list to start messaging
              </p>
              {conversations.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} available
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messaging;
