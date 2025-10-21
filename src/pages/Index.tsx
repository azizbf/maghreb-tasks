import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryCard from "@/components/CategoryCard";
import { Search, Code, Smartphone, Palette, PenTool, TrendingUp, Languages, Video, Database } from "lucide-react";
import { categories } from "@/data/mockData";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-freelance.jpg";

const Index = () => {
  const categoryIcons = {
    "Web Development": Code,
    "Mobile Apps": Smartphone,
    "Graphic Design": Palette,
    "Content Writing": PenTool,
    "Digital Marketing": TrendingUp,
    "Translation Services": Languages,
    "Video Editing": Video,
    "Data Entry": Database,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <img 
          src={heroImage} 
          alt="Freelancing professionals collaborating" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find the Perfect Freelance Services for Your Business
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90">
              Connect with talented Tunisian professionals. Post jobs, hire experts, and grow your business.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Search for services (e.g., web design, translation...)" 
                  className="pl-10 h-12 bg-background/95 backdrop-blur border-0"
                />
              </div>
              <Button size="lg" className="h-12 px-8 bg-accent hover:bg-accent/90">
                Search
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/browse-jobs">
                <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20">
                  Browse Jobs
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  Post a Job
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse by Category</h2>
          <p className="text-muted-foreground text-lg">Find the right talent for every project</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const Icon = categoryIcons[category.name as keyof typeof categoryIcons];
            return (
              <CategoryCard
                key={category.name}
                icon={Icon}
                title={category.name}
                jobCount={category.count}
              />
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-secondary/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Get started in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Create Your Profile</h3>
              <p className="text-muted-foreground">
                Sign up and showcase your skills, experience, and portfolio to attract clients.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Find Perfect Matches</h3>
              <p className="text-muted-foreground">
                Browse jobs or get discovered by clients looking for your expertise.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Get Paid Securely</h3>
              <p className="text-muted-foreground">
                Complete projects and receive payments safely through our platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="gradient-hero rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of freelancers and clients building successful projects together on FreelanceTN
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Join as Freelancer
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20">
                Hire Talent
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
