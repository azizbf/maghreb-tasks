import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  DollarSign, 
  User, 
  Calendar,
  MessageCircle,
  Send,
  Briefcase,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { toast } from 'sonner';
import apiService from '@/services/api';

interface Job {
  id: number;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  currency: string;
  duration: string;
  location: string;
  is_remote: boolean;
  status: string;
  created_at: string;
  client_id: number;
  client_name: string;
  client_avatar: string;
  category_name: string;
  skills: Array<{
    id: number;
    name: string;
  }>;
}

interface Proposal {
  id: number;
  cover_letter: string;
  proposed_budget: number;
  proposed_duration: string;
  status: string;
  created_at: string;
  freelancer_name: string;
  freelancer_avatar: string;
}

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [job, setJob] = useState<Job | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalData, setProposalData] = useState({
    cover_letter: '',
    proposed_budget: '',
    proposed_duration: ''
  });
  const [userProposal, setUserProposal] = useState<Proposal | null>(null);
  const [showMessages, setShowMessages] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getJob(parseInt(id!));
      if (response.success) {
        setJob(response.data);
        
        // If user is the client, fetch proposals
        if (user?.role === 'client' && user.id === response.data.client_id) {
          fetchProposals();
        }
        
        // If user is a freelancer, check if they already applied
        if (user?.role === 'freelancer') {
          checkUserProposal();
        }
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProposals = async () => {
    try {
      const response = await apiService.getJobProposals(parseInt(id!));
      if (response.success) {
        setProposals(response.data.proposals || []);
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
    }
  };

  const checkUserProposal = async () => {
    try {
      const response = await apiService.getFreelancerProposals();
      if (response.success) {
        const userProposal = response.data.proposals?.find(
          (p: any) => p.job_id === parseInt(id!)
        );
        setUserProposal(userProposal || null);
      }
    } catch (error) {
      console.error('Error checking user proposal:', error);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !user) return;

    // Validate cover letter length
    if (proposalData.cover_letter.length < 50) {
      toast.error('Cover letter must be at least 50 characters long');
      return;
    }

    if (proposalData.cover_letter.length > 1000) {
      toast.error('Cover letter must be less than 1000 characters');
      return;
    }

    // Validate budget
    const budget = parseFloat(proposalData.proposed_budget);
    if (isNaN(budget) || budget < 0) {
      toast.error('Please enter a valid budget amount');
      return;
    }

    if (budget < job.budget_min || budget > job.budget_max) {
      toast.error(`Budget must be between ${job.budget_min} and ${job.budget_max} ${job.currency}`);
      return;
    }

    // Validate duration
    if (!proposalData.proposed_duration.trim()) {
      toast.error('Please enter a proposed duration');
      return;
    }

    try {
      setApplying(true);
      const response = await apiService.createProposal({
        job_id: job.id,
        cover_letter: proposalData.cover_letter,
        proposed_budget: budget,
        proposed_duration: proposalData.proposed_duration
      });

      if (response.success) {
        setShowProposalForm(false);
        setProposalData({ cover_letter: '', proposed_budget: '', proposed_duration: '' });
        
        // Add notification for successful proposal submission
        addNotification({
          type: 'proposal',
          title: 'Proposal Submitted',
          message: `Your proposal for "${job.title}" has been submitted successfully`,
        });
        
        // Refresh proposals if user is client
        if (user.role === 'client') {
          fetchProposals();
        } else {
          // Refresh user proposal if freelancer
          checkUserProposal();
        }
      }
    } catch (error: any) {
      console.error('Error creating proposal:', error);
      let errorMessage = 'Failed to submit proposal';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        errorMessage = errors.map((err: any) => err.msg).join(', ');
      }
      
      toast.error(errorMessage);
    } finally {
      setApplying(false);
    }
  };

  const handleSendMessage = async () => {
    if (!job || !user || !messageContent.trim()) return;

    try {
      setSendingMessage(true);
      const response = await apiService.sendMessage({
        recipient_id: job.client_id,
        content: messageContent,
        job_id: job.id
      });

      if (response.success) {
        setMessageContent('');
        setShowMessages(false);
        
        // Add notification for successful message
        addNotification({
          type: 'message',
          title: 'Message Sent',
          message: `Message sent to ${job.client_name}`,
        });
        
        toast.success('Message sent successfully!');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleAcceptProposal = async (proposalId: number) => {
    if (!confirm('Are you sure you want to accept this proposal?')) return;

    try {
      const response = await apiService.acceptProposal(proposalId);
      if (response.success) {
        toast.success('Proposal accepted successfully!');
        fetchProposals();
        fetchJobDetails(); // Refresh job status
      }
    } catch (error: any) {
      console.error('Error accepting proposal:', error);
      toast.error(error.response?.data?.message || 'Failed to accept proposal');
    }
  };

  const handleRejectProposal = async (proposalId: number) => {
    if (!confirm('Are you sure you want to reject this proposal?')) return;

    try {
      const response = await apiService.rejectProposal(proposalId);
      if (response.success) {
        toast.success('Proposal rejected');
        fetchProposals();
      }
    } catch (error: any) {
      console.error('Error rejecting proposal:', error);
      toast.error(error.response?.data?.message || 'Failed to reject proposal');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-8 pb-8">
              <p className="text-muted-foreground">Loading job details...</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-8 pb-8">
              <p className="text-muted-foreground">Job not found</p>
              <Button onClick={() => navigate('/browse-jobs')} className="mt-4">
                Browse Jobs
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const canApply = user?.role === 'freelancer' && 
                  job.status === 'open' && 
                  job.client_id !== user.id && 
                  !userProposal;

  const isJobOwner = user?.role === 'client' && job.client_id === user.id;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/browse-jobs')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                    <div className="flex items-center gap-4 text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{job.client_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(job.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                    {job.status}
                  </Badge>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{job.budget_min} - {job.budget_max} {job.currency}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{job.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{job.is_remote ? 'Remote' : job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{job.category_name}</span>
                  </div>
                </div>

                {/* Skills */}
                {job.skills && job.skills.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Required Skills:</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <Badge key={skill.id} variant="outline">
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2">Description:</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Action buttons */}
            {user && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {canApply && (
                      <Dialog open={showProposalForm} onOpenChange={setShowProposalForm}>
                        <DialogTrigger asChild>
                          <Button size="lg">
                            Apply for this Job
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Submit Proposal</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleApply} className="space-y-4">
                            <div>
                              <Label htmlFor="cover_letter">Cover Letter</Label>
                              <Textarea
                                id="cover_letter"
                                placeholder="Explain why you're the best fit for this job..."
                                value={proposalData.cover_letter}
                                onChange={(e) => setProposalData(prev => ({ ...prev, cover_letter: e.target.value }))}
                                rows={6}
                                required
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                {proposalData.cover_letter.length}/1000 characters (minimum 50)
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="proposed_budget">Proposed Budget ({job.currency})</Label>
                                <Input
                                  id="proposed_budget"
                                  type="number"
                                  placeholder="Enter your proposed budget"
                                  value={proposalData.proposed_budget}
                                  onChange={(e) => setProposalData(prev => ({ ...prev, proposed_budget: e.target.value }))}
                                  min={job.budget_min}
                                  max={job.budget_max}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="proposed_duration">Proposed Duration</Label>
                                <Input
                                  id="proposed_duration"
                                  placeholder="e.g., 2 weeks, 1 month"
                                  value={proposalData.proposed_duration}
                                  onChange={(e) => setProposalData(prev => ({ ...prev, proposed_duration: e.target.value }))}
                                  required
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setShowProposalForm(false)}
                              >
                                Cancel
                              </Button>
                              <Button type="submit" disabled={applying}>
                                {applying ? 'Submitting...' : 'Submit Proposal'}
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}

                    {userProposal && (
                      <div className="flex items-center gap-2">
                        <Badge variant={userProposal.status === 'accepted' ? 'default' : 'secondary'}>
                          {userProposal.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Your proposal status
                        </span>
                      </div>
                    )}

                    {!isJobOwner && user.role === 'freelancer' && (
                      <Dialog open={showMessages} onOpenChange={setShowMessages}>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Message Client
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Send Message to {job.client_name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Type your message..."
                              value={messageContent}
                              onChange={(e) => setMessageContent(e.target.value)}
                              rows={4}
                            />
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                onClick={() => setShowMessages(false)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleSendMessage}
                                disabled={sendingMessage || !messageContent.trim()}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                {sendingMessage ? 'Sending...' : 'Send'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Proposals (for job owner) */}
            {isJobOwner && proposals.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Proposals ({proposals.length})</h3>
                  <div className="space-y-4">
                    {proposals.map((proposal) => (
                      <Card key={proposal.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{proposal.freelancer_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(proposal.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant={proposal.status === 'accepted' ? 'default' : 'secondary'}>
                            {proposal.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{proposal.cover_letter}</p>
                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            <span className="font-medium">{proposal.proposed_budget} {job.currency}</span>
                            <span className="text-muted-foreground ml-2">• {proposal.proposed_duration}</span>
                          </div>
                          {proposal.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleAcceptProposal(proposal.id)}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleRejectProposal(proposal.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Client Information</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">{job.client_name}</p>
                    <p className="text-sm text-muted-foreground">Client</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job stats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Job Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget Range:</span>
                    <span className="font-medium">{job.budget_min} - {job.budget_max} {job.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{job.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">{job.is_remote ? 'Remote' : job.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium">{job.category_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Posted:</span>
                    <span className="font-medium">{new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default JobDetails;
