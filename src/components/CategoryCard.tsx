import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CategoryCardProps {
  icon: LucideIcon;
  title: string;
  jobCount: number;
}

const CategoryCard = ({ icon: Icon, title, jobCount }: CategoryCardProps) => {
  return (
    <Card className="p-6 hover:shadow-hover transition-smooth cursor-pointer border-border bg-card group">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="h-14 w-14 rounded-lg bg-primary/10 group-hover:bg-primary transition-smooth flex items-center justify-center">
          <Icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-smooth" />
        </div>
        <div>
          <h3 className="font-semibold text-base mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{jobCount} jobs</p>
        </div>
      </div>
    </Card>
  );
};

export default CategoryCard;
