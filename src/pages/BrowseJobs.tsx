import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JobCard from "@/components/JobCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { mockJobs, categories } from "@/data/mockData";

const BrowseJobs = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const allSkills = Array.from(
    new Set(mockJobs.flatMap(job => job.skills))
  );

  const filteredJobs = mockJobs.filter(job => {
    const matchesCategory = selectedCategory === "all" || job.category === selectedCategory;
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSkills = selectedSkills.length === 0 || 
                         selectedSkills.some(skill => job.skills.includes(skill));
    
    return matchesCategory && matchesSearch && matchesSkills;
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
          <p className="text-muted-foreground">Find your next opportunity from {mockJobs.length} available jobs</p>
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
                  <SelectItem key={cat.name} value={cat.name}>
                    {cat.name} ({cat.count})
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
            Showing {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
          </p>
          <Select defaultValue="recent">
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
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
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
