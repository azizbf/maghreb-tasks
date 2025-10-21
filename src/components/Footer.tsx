import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-secondary/30 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">F</span>
              </div>
              <span className="font-bold text-xl">FreelanceTN</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Tunisia's premier freelancing platform connecting talented professionals with clients.
            </p>
            <div className="flex gap-3">
              <a href="#" className="h-9 w-9 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-smooth flex items-center justify-center">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-smooth flex items-center justify-center">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-smooth flex items-center justify-center">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-smooth flex items-center justify-center">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Freelancers</h3>
            <ul className="space-y-2">
              <li><Link to="/browse-jobs" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">Find Work</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">How It Works</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">Success Stories</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Clients</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">Post a Job</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">Find Talent</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">About Us</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">Contact</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">Privacy Policy</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2025 FreelanceTN. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
