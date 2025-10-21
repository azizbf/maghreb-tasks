import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JobPostForm from "@/components/JobPostForm";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const PostJob = () => {
  const { user, loading } = useAuth();
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'client')) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSuccess = () => {
    setSuccess(true);
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  if (loading) {
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

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-8 pb-8">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Job Posted Successfully!</h2>
              <p className="text-muted-foreground mb-6">
                Your job posting is now live and freelancers can start applying.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate("/dashboard")} 
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
                <Button 
                  onClick={() => setSuccess(false)} 
                  variant="outline" 
                  className="w-full"
                >
                  Post Another Job
                </Button>
              </div>
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
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Post a New Job</h1>
          <p className="text-muted-foreground">
            Create a job posting to find the perfect freelancer for your project
          </p>
        </div>

        <JobPostForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>

      <Footer />
    </div>
  );
};

export default PostJob;
