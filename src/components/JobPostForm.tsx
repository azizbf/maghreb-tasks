import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { apiService } from "@/services/api";
import { useNotifications } from "@/contexts/NotificationContext";

interface Category {
  id: number;
  name: string;
  description: string;
}

interface JobPostFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const JobPostForm = ({ onSuccess, onCancel }: JobPostFormProps) => {
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget_min: "",
    budget_max: "",
    currency: "TND",
    duration: "",
    location: "",
    category_id: "",
    is_remote: false,
    skills: [] as string[]
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState("");
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await apiService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate required fields
      if (formData.description.length < 20) {
        setError("Description must be at least 20 characters long");
        return;
      }
      
      if (formData.skills.length === 0) {
        setError("At least one skill is required");
        return;
      }

      const jobData = {
        title: formData.title,
        description: formData.description,
        budget_min: parseFloat(formData.budget_min),
        budget_max: parseFloat(formData.budget_max),
        currency: formData.currency,
        duration: formData.duration,
        location: formData.location,
        category_id: parseInt(formData.category_id),
        skills: [1], // Use skill ID 1 (General Programming)
        is_remote: formData.is_remote
      };

      const response = await apiService.createJob(jobData);
      
      if (response.success) {
        // Add notification for successful job creation
        addNotification({
          type: 'job',
          title: 'Job Posted Successfully',
          message: `"${formData.title}" has been posted and is now visible to freelancers`,
        });
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error("Job creation error:", error);
      let errorMessage = "Failed to create job posting";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.status === 401) {
        errorMessage = "You must be logged in to create a job posting";
      } else if (error.response?.status === 403) {
        errorMessage = "Only clients can create job postings";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Post a New Job</CardTitle>
        <p className="text-muted-foreground">
          Create a job posting to find the perfect freelancer for your project
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="e.g., React Developer for E-commerce Website"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Job Description * (min 20 characters)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your project in detail. Please provide at least 20 characters with specific requirements, deliverables, and any other important details..."
              rows={6}
              required
              minLength={20}
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/2000 characters (minimum 20 required)
            </p>
          </div>

          {/* Category and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => handleInputChange("category_id", value)}
                required
                disabled={categoriesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select a category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days) *</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                placeholder="e.g., 30"
                min="1"
                required
              />
            </div>
          </div>

          {/* Budget Range */}
          <div className="space-y-4">
            <Label>Budget Range (TND) *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget_min">Minimum Budget</Label>
                <Input
                  id="budget_min"
                  type="number"
                  value={formData.budget_min}
                  onChange={(e) => handleInputChange("budget_min", e.target.value)}
                  placeholder="e.g., 500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget_max">Maximum Budget</Label>
                <Input
                  id="budget_max"
                  type="number"
                  value={formData.budget_max}
                  onChange={(e) => handleInputChange("budget_max", e.target.value)}
                  placeholder="e.g., 2000"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="e.g., Tunis, Tunisia"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_remote"
                checked={formData.is_remote}
                onCheckedChange={(checked) => handleInputChange("is_remote", checked)}
              />
              <Label htmlFor="is_remote">This job can be done remotely</Label>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label>Required Skills * (at least 1 skill required)</Label>
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add a skill..."
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <Button type="button" onClick={handleAddSkill} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.skills.length} skill(s) added (minimum 1 required)
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}


          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating Job..." : "Post Job"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default JobPostForm;
