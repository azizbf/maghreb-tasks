import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
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
  MessageSquare
} from "lucide-react";

const Dashboard = () => {
  const stats = [
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 shadow-elegant hover:shadow-hover transition-smooth">
              <div className="flex items-start justify-between mb-4">
                <div className={`h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Projects */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="active">Active Projects</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="proposals">Proposals</TabsTrigger>
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
            </Tabs>
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
                <Button className="w-full justify-start" variant="outline">
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
