import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, DollarSign, Briefcase } from "lucide-react";

export interface Job {
  id: string;
  title: string;
  description: string;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  duration: string;
  location: string;
  category: string;
  skills: string[];
  postedAt: string;
  proposalsCount: number;
}

interface JobCardProps {
  job: Job;
}

const JobCard = ({ job }: JobCardProps) => {
  const formatBudget = () => {
    if (job.budget.min === job.budget.max) {
      return `${job.budget.min} ${job.budget.currency}`;
    }
    return `${job.budget.min}-${job.budget.max} ${job.budget.currency}`;
  };

  return (
    <Card className="p-6 hover:shadow-hover transition-smooth border-border bg-card">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2 hover:text-primary cursor-pointer transition-smooth">
              {job.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {job.description}
            </p>
          </div>
          <Badge variant="secondary">{job.category}</Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          {job.skills.map((skill, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-4 w-4" />
            <span className="font-medium text-foreground">{formatBudget()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{job.duration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Briefcase className="h-4 w-4" />
            <span>{job.proposalsCount} proposals</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-muted-foreground">{job.postedAt}</span>
          <Button size="sm">Apply Now</Button>
        </div>
      </div>
    </Card>
  );
};

export default JobCard;
