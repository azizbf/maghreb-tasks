import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JobCard from "@/components/JobCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import apiService from "@/services/api";
import { useToast } from "@/hooks/use-toast";

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
  updated_at: string;
  category_name: string;
  client_name: string;
  client_avatar: string;
  proposals_count: number;
  skills: Array<{ id: number; name: string }>;
}

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  job_count: number;
}

const BrowseJobs = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("recent");

  // Fetch jobs and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobsResponse, categoriesResponse] = await Promise.all([
          apiService.getJobs({ status: 'open' }),
          apiService.getCategories()
        ]);

        if (jobsResponse.success && jobsResponse.data) {
          setJobs(jobsResponse.data.jobs || []);
        }

        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load jobs. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Get all unique skills from jobs
  const allSkills = Array.from(
    new Set(jobs.flatMap(job => job.skills.map(skill => skill.name)))
  );

  // Filter jobs based on search criteria
  const filteredJobs = jobs.filter(job => {
    const matchesCategory = selectedCategory === "all" || job.category_name === selectedCategory;
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSkills = selectedSkills.length === 0 || 
                         selectedSkills.some(skill => job.skills.some(jobSkill => jobSkill.name === skill));
    
    return matchesCategory && matchesSearch && matchesSkills;
  });

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'budget-high':
        return b.budget_max - a.budget_max;
      case 'budget-low':
        return a.budget_min - b.budget_min;
      case 'recent':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Browse Jobs</h1>
          <p className="text-muted-foreground">Find your next opportunity from {jobs.length} available jobs</p>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search jobs..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name} ({cat.job_count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Skills Filter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by skills:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allSkills.slice(0, 12).map((skill) => (
                <Badge
                  key={skill}
                  variant={selectedSkills.includes(skill) ? "default" : "outline"}
                  className="cursor-pointer transition-smooth hover:shadow-elegant"
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                  {selectedSkills.includes(skill) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
            
            {selectedSkills.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3"
                onClick={() => setSelectedSkills([])}
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Showing {sortedJobs.length} job{sortedJobs.length !== 1 ? 's' : ''}
          </p>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="budget-high">Highest Budget</SelectItem>
              <SelectItem value="budget-low">Lowest Budget</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Job Cards */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading jobs...</span>
            </div>
          ) : sortedJobs.length > 0 ? (
            sortedJobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={{
                  id: job.id.toString(),
                  title: job.title,
                  description: job.description,
                  budget: {
                    min: job.budget_min,
                    max: job.budget_max,
                    currency: job.currency
                  },
                  duration: job.duration,
                  location: job.is_remote ? `${job.location} (Remote)` : job.location,
                  category: job.category_name,
                  skills: job.skills.map(skill => skill.name),
                  postedAt: new Date(job.created_at).toLocaleDateString(),
                  proposalsCount: job.proposals_count
                }} 
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">No jobs found matching your criteria</p>
              <Button onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
                setSelectedSkills([]);
              }}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BrowseJobs;
