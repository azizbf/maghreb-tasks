import { Button } from "@/components/ui/button";
import { Menu, Search, User } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">F</span>
            </div>
            <span className="font-bold text-xl hidden sm:inline">FreelanceTN</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/browse-jobs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">
              Browse Jobs
            </Link>
            <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">
              Dashboard
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="sm" className="hidden md:flex">
            Sign In
          </Button>
          
          <Button size="sm" className="hidden md:flex">
            Get Started
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
