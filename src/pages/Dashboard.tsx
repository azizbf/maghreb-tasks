import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Briefcase, 
  DollarSign, 
  Star, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Plus,
  Users
} from "lucide-react";
import Messaging from "@/components/Messaging";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { toast } from 'sonner';
import apiService from "@/services/api";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [userJobs, setUserJobs] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");


  useEffect(() => {
    if (authLoading) {
      return; // Still loading authentication
    }
    
    if (user?.role === 'client') {
      fetchUserJobs();
      fetchMessages();
    } else {
      fetchMessages(); // Freelancers can also have messages
      setLoading(false);
    }
  }, [user, authLoading]);

  // Fetch proposals after userJobs are loaded
  useEffect(() => {
    if (user?.role === 'client' && userJobs.length > 0) {
      fetchProposals();
    }
  }, [userJobs]);

  const fetchUserJobs = async () => {
    try {
      const response = await apiService.getUserJobs();
      
      // Handle different response structures
      let jobs = [];
      if (Array.isArray(response.data)) {
        jobs = response.data;
      } else if (response.data && Array.isArray(response.data.jobs)) {
        jobs = response.data.jobs;
      } else if (response.data && Array.isArray(response.data.data)) {
        jobs = response.data.data;
      }
      
      setUserJobs(jobs);
    } catch (error) {
      console.error("Error fetching user jobs:", error);
      setUserJobs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchProposals = async () => {
    if (user?.role !== 'client') return;
    
    try {
      // Get proposals for each of the user's jobs
      const allProposals = [];
      for (const job of userJobs) {
        try {
          const response = await apiService.getJobProposals(job.id);
          if (response.success && response.data.proposals) {
            allProposals.push(...response.data.proposals);
          }
        } catch (error) {
          console.error(`Error fetching proposals for job ${job.id}:`, error);
        }
      }
      
      setProposals(allProposals);
      
      // Add notification for new proposals
      const newProposals = allProposals.filter((p: any) => p.status === 'pending');
      if (newProposals.length > 0) {
        addNotification({
          type: 'proposal',
          title: 'New Proposals',
          message: `You have ${newProposals.length} new proposal(s) to review`,
        });
      }
    } catch (error) {
      console.error("Error fetching proposals:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await apiService.getUserConversations();
      if (response.success) {
        setMessages(response.data.conversations || []);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleAcceptProposal = async (proposalId: number) => {
    try {
      const response = await apiService.acceptProposal(proposalId);
      if (response.success) {
        addNotification({
          type: 'proposal',
          title: 'Proposal Accepted',
          message: 'Proposal has been accepted and contract created. You can now chat with the freelancer.',
        });
        
        // Find the proposal to get freelancer info
        const proposal = proposals.find(p => p.id === proposalId);
        if (proposal) {
          // Send initial message to freelancer
          try {
            await apiService.sendMessage({
              recipient_id: proposal.freelancer_id,
              content: `Hi ${proposal.freelancer_name}! I've accepted your proposal for the job. Let's discuss the details and get started!`,
              job_id: proposal.job_id
            });
          } catch (messageError) {
            // Error sending initial message - non-critical
          }
        }
        
        // Refresh proposals and messages
        fetchProposals();
        fetchMessages();
        // Switch to messages tab to start chat
        setActiveTab("messages");
      } else {
        toast.error(response.message || 'Failed to accept proposal');
      }
    } catch (error: any) {
      console.error('Error accepting proposal:', error);
      toast.error(error.response?.data?.message || 'Failed to accept proposal');
    }
  };

  const handleRejectProposal = async (proposalId: number) => {
    try {
      const response = await apiService.rejectProposal(proposalId);
      if (response.success) {
        addNotification({
          type: 'proposal',
          title: 'Proposal Rejected',
          message: 'Proposal has been rejected',
        });
        // Refresh proposals
        fetchProposals();
      } else {
        toast.error(response.message || 'Failed to reject proposal');
      }
    } catch (error: any) {
      console.error('Error rejecting proposal:', error);
      toast.error(error.response?.data?.message || 'Failed to reject proposal');
    }
  };

  const handleViewProposalDetails = (proposal: any) => {
    // For now, just show an alert with details
    // In a real app, this would open a modal or navigate to a details page
    toast.info(`Proposal Details`, {
      description: `Freelancer: ${proposal.freelancer_name}\nBudget: ${proposal.proposed_budget} TND\nDuration: ${proposal.proposed_duration}\nStatus: ${proposal.status}\n\nCover Letter:\n${proposal.cover_letter}`,
      duration: 10000
    });
  };

  const stats = user?.role === 'client' ? [
    { 
      label: "Posted Jobs", 
      value: (userJobs?.length || 0).toString(), 
      icon: Briefcase, 
      description: "Total jobs posted",
      change: "Total jobs posted",
      color: "text-primary" 
    },
    { 
      label: "Active Jobs", 
      value: (Array.isArray(userJobs) ? userJobs.filter((job: any) => job.status === 'open').length : 0).toString(), 
      icon: Clock, 
      description: "Currently open",
      change: "Currently open",
      color: "text-accent" 
    },
    { 
      label: "In Progress", 
      value: (Array.isArray(userJobs) ? userJobs.filter((job: any) => job.status === 'in_progress').length : 0).toString(), 
      icon: TrendingUp, 
      description: "Being worked on",
      change: "Being worked on",
      color: "text-success" 
    },
    { 
      label: "Completed", 
      value: (Array.isArray(userJobs) ? userJobs.filter((job: any) => job.status === 'completed').length : 0).toString(), 
      icon: CheckCircle2, 
      description: "Successfully finished",
      change: "Successfully finished",
      color: "text-primary" 
    },
  ] : [
    { 
      label: "Active Projects", 
      value: "3", 
      icon: Briefcase, 
      change: "+1 this month",
      color: "text-primary" 
    },
    { 
      label: "Total Earnings", 
      value: "12,450 TND", 
      icon: DollarSign, 
      change: "+2,340 this month",
      color: "text-success" 
    },
    { 
      label: "Avg. Rating", 
      value: "4.9", 
      icon: Star, 
      change: "From 24 reviews",
      color: "text-accent" 
    },
    { 
      label: "Success Rate", 
      value: "98%", 
      icon: TrendingUp, 
      change: "15 completed jobs",
      color: "text-primary" 
    },
  ];

  const activeProjects = [
    {
      id: 1,
      title: "E-commerce Website",
      client: "Ahmed Ben Ali",
      budget: "4,500 TND",
      deadline: "5 days",
      progress: 65,
      status: "in-progress"
    },
    {
      id: 2,
      title: "Mobile App Design",
      client: "Salma Trabelsi",
      budget: "2,000 TND",
      deadline: "12 days",
      progress: 30,
      status: "in-progress"
    },
    {
      id: 3,
      title: "Social Media Campaign",
      client: "Karim Mansour",
      budget: "1,200 TND",
      deadline: "3 days",
      progress: 85,
      status: "review"
    },
  ];

  const recentActivity = [
    {
      type: "message",
      text: "New message from Ahmed Ben Ali",
      time: "2 hours ago",
      icon: MessageSquare,
    },
    {
      type: "milestone",
      text: "Milestone completed for Mobile App Design",
      time: "5 hours ago",
      icon: CheckCircle2,
    },
    {
      type: "deadline",
      text: "Deadline approaching for Social Media Campaign",
      time: "1 day ago",
      icon: AlertCircle,
    },
  ];

  // Show loading while authentication is in progress
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-8 pb-8">
              <p className="text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Show message if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-8 pb-8">
              <p className="text-muted-foreground">Please log in to access the dashboard</p>
              <Button onClick={() => navigate("/auth")} className="mt-4">
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your overview</p>
        </div>


        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {user?.role === 'client' ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="jobs">My Jobs</TabsTrigger>
                  <TabsTrigger value="proposals">Proposals</TabsTrigger>
                  <TabsTrigger value="messages">Messages</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {stats.map((stat, index) => (
                      <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            {stat.label}
                          </CardTitle>
                          <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{stat.value}</div>
                          <p className="text-xs text-muted-foreground">
                            {stat.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button onClick={() => navigate("/post-job")} className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Post New Job
                      </Button>
                      <Button variant="outline" onClick={() => setActiveTab("proposals")} className="w-full">
                        <Users className="mr-2 h-4 w-4" />
                        View Proposals
                      </Button>
                      <Button variant="outline" onClick={() => setActiveTab("messages")} className="w-full">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Messages
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="jobs" className="space-y-4">
                  {loading ? (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground">Loading your jobs...</p>
                    </Card>
                  ) : (!Array.isArray(userJobs) || userJobs.length === 0) ? (
                    <Card className="p-8 text-center">
                      <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start by posting your first job to find talented freelancers.
                      </p>
                      <Button onClick={() => navigate("/post-job")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Post Your First Job
                      </Button>
                    </Card>
                  ) : (
                    (Array.isArray(userJobs) ? userJobs : []).map((job: any) => (
                      <Card key={job.id} className="p-6 shadow-elegant hover:shadow-hover transition-smooth">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                          </div>
                          <Badge variant={job.status === "open" ? "default" : "secondary"}>
                            {job.status === "open" ? "Open" : job.status === "in_progress" ? "In Progress" : "Completed"}
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Budget</span>
                            <span className="font-medium">{job.budget_min} - {job.budget_max} TND</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Duration</span>
                            <span className="font-medium">{job.duration} days</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Location</span>
                            <span className="font-medium">{job.is_remote ? "Remote" : job.location || "Not specified"}</span>
                          </div>

                          <div className="flex justify-between items-center pt-2">
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{job.proposal_count || 0} proposals</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">View Details</Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="proposals">
                  {proposals.length === 0 ? (
                    <Card className="p-8 text-center">
                      <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                      <p className="text-muted-foreground">Proposals will appear here when freelancers apply to your jobs</p>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Proposals ({proposals.length})</h3>
                        <Badge variant="outline">
                          {proposals.filter((p: any) => p.status === 'pending').length} Pending
                        </Badge>
                      </div>
                      {proposals.map((proposal: any) => (
                        <Card key={proposal.id} className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <Users className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium">{proposal.freelancer_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(proposal.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Badge variant={proposal.status === 'pending' ? 'default' : 'secondary'}>
                              {proposal.status}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-3">{proposal.cover_letter}</p>
                          <div className="flex justify-between items-center">
                            <div className="text-sm">
                              <span className="font-medium">{proposal.proposed_budget} TND</span>
                              <span className="text-muted-foreground ml-2">• {proposal.proposed_duration}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleViewProposalDetails(proposal)}
                              >
                                View Details
                              </Button>
                              {proposal.status === 'pending' && (
                                <>
                                  <Button 
                                    size="sm"
                                    onClick={() => handleAcceptProposal(proposal.id)}
                                  >
                                    Accept
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleRejectProposal(proposal.id)}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="messages">
                  <div className="h-[600px]">
                    <Messaging />
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="active">Active Projects</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="proposals">Proposals</TabsTrigger>
                  <TabsTrigger value="messages">Messages</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-4">
                {activeProjects.map((project) => (
                  <Card key={project.id} className="p-6 shadow-elegant hover:shadow-hover transition-smooth">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{project.title}</h3>
                        <p className="text-sm text-muted-foreground">Client: {project.client}</p>
                      </div>
                      <Badge variant={project.status === "review" ? "default" : "secondary"}>
                        {project.status === "review" ? "In Review" : "In Progress"}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-smooth" 
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-medium text-foreground">{project.budget}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{project.deadline}</span>
                          </div>
                        </div>
                        <Button size="sm">View Details</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="completed">
                <Card className="p-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
                  <p className="text-muted-foreground">You have completed 15 projects</p>
                  <Button variant="outline" className="mt-4">View All</Button>
                </Card>
              </TabsContent>

              <TabsContent value="proposals">
                <Card className="p-8 text-center">
                  <Briefcase className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">You have 4 pending proposals</p>
                  <Button variant="outline" className="mt-4">View All</Button>
                </Card>
              </TabsContent>

              <TabsContent value="messages">
                <div className="h-[600px]">
                  <Messaging />
                </div>
              </TabsContent>
            </Tabs>
            )}
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="p-6 shadow-elegant">
              <h3 className="font-semibold text-lg mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <activity.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm mb-1">{activity.text}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-6">View All Activity</Button>
            </Card>

            <Card className="p-6 shadow-elegant mt-6">
              <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {user?.role === 'client' ? (
                  <>
                    <Button 
                      className="w-full justify-start" 
                      onClick={() => navigate("/post-job")}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Post New Job
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => navigate("/browse-jobs")}
                    >
                      <Briefcase className="h-4 w-4 mr-2" />
                      Browse Jobs
                    </Button>
                <Button className="w-full justify-start" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Messages
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => navigate("/browse-jobs")}
                    >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Browse New Jobs
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Star className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
