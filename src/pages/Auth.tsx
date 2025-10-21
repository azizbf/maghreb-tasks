import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Users } from "lucide-react";
import { z } from "zod";

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
  role: z.enum(["freelancer", "client"]),
});

const signInSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, register, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signup");

  // Sign Up State
  const [fullName, setFullName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [userRole, setUserRole] = useState<"freelancer" | "client">("freelancer");

  // Sign In State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      const validatedData = signUpSchema.parse({
        fullName,
        email: signUpEmail,
        password: signUpPassword,
        role: userRole,
      });

      const result = await register({
        email: validatedData.email,
        password: validatedData.password,
        full_name: validatedData.fullName,
        role: validatedData.role,
      });

      if (result.success) {
        toast({
          title: "Welcome to FreelanceTN!",
          description: `Your ${validatedData.role} account has been created successfully.`,
        });
        navigate("/dashboard");
      } else {
        if (result.message.includes("already exists")) {
          toast({
            title: "Account exists",
            description: "This email is already registered. Please sign in instead.",
            variant: "destructive",
          });
          setActiveTab("signin");
          setSignInEmail(validatedData.email);
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "An error occurred during sign up",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      const validatedData = signInSchema.parse({
        email: signInEmail,
        password: signInPassword,
      });

      const result = await login(validatedData.email, validatedData.password);

      if (result.success) {
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Sign In Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign In Failed",
          description: error instanceof Error ? error.message : "Invalid email or password",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md p-8 shadow-elegant">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <span className="text-primary-foreground font-bold text-2xl">F</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">FreelanceTN</h1>
          <p className="text-muted-foreground">Join Tunisia's premier freelancing platform</p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "signin" | "signup")}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="signin">Sign In</TabsTrigger>
          </TabsList>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Ahmed Ben Ali"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signUpEmail">Email</Label>
                <Input
                  id="signUpEmail"
                  type="email"
                  placeholder="you@example.com"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signUpPassword">Password</Label>
                <Input
                  id="signUpPassword"
                  type="password"
                  placeholder="••••••••"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-3">
                <Label>I want to</Label>
                <RadioGroup value={userRole} onValueChange={(v) => setUserRole(v as "freelancer" | "client")} disabled={loading}>
                  <div className="flex items-center space-x-2 p-4 rounded-lg border border-border hover:bg-secondary transition-smooth cursor-pointer">
                    <RadioGroupItem value="freelancer" id="freelancer" />
                    <Label htmlFor="freelancer" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Find Work</p>
                        <p className="text-xs text-muted-foreground">I'm a freelancer looking for jobs</p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 rounded-lg border border-border hover:bg-secondary transition-smooth cursor-pointer">
                    <RadioGroupItem value="client" id="client" />
                    <Label htmlFor="client" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">Hire Talent</p>
                        <p className="text-xs text-muted-foreground">I'm looking to hire freelancers</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signInEmail">Email</Label>
                <Input
                  id="signInEmail"
                  type="email"
                  placeholder="you@example.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signInPassword">Password</Label>
                <Input
                  id="signInPassword"
                  type="password"
                  placeholder="••••••••"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
