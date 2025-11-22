import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { X, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStudentSchema, type InsertStudent } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const INTERESTS_OPTIONS = [
  "Music", "Sports", "Art", "Photography", "Gaming", "Reading", "Cooking",
  "Hiking", "Dancing", "Theater", "Film", "Technology", "Travel", "Fitness"
];

const HOBBIES_OPTIONS = [
  "Basketball", "Soccer", "Tennis", "Swimming", "Running", "Yoga",
  "Guitar", "Piano", "Singing", "Drawing", "Painting", "Writing",
  "Coding", "Volunteering", "Meditation", "Chess"
];

const GOALS_OPTIONS = [
  "Make new friends", "Find study partners", "Network professionally",
  "Join clubs", "Attend more events", "Improve grades", "Learn new skills",
  "Stay active", "Explore campus", "Build community"
];

export default function ProfileSetup() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const form = useForm<InsertStudent>({
    resolver: zodResolver(insertStudentSchema),
    defaultValues: {
      name: "",
      email: "",
      year: "",
      major: "",
      bio: "",
      avatar: "",
      courses: [],
      interests: [],
      hobbies: [],
      goals: [],
      location: "",
    },
  });

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [customCourse, setCustomCourse] = useState("");

  const toggleSelection = (item: string, list: string[], setter: (list: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter((i) => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  const addCourse = () => {
    if (customCourse.trim()) {
      const currentCourses = form.getValues("courses");
      form.setValue("courses", [...currentCourses, customCourse.trim()]);
      setCustomCourse("");
    }
  };

  const removeCourse = (course: string) => {
    const currentCourses = form.getValues("courses");
    form.setValue("courses", currentCourses.filter((c) => c !== course));
  };

  const handleNext = () => {
    if (step === 2) {
      form.setValue("interests", selectedInterests);
    } else if (step === 3) {
      form.setValue("hobbies", selectedHobbies);
      form.setValue("goals", selectedGoals);
    }
    
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const onSubmit = (data: InsertStudent) => {
    console.log("Profile data:", data);
    // Will connect to API in integration phase
    navigate("/discover");
  };

  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-2xl p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">Create Your Profile</h2>
            <span className="text-sm text-muted-foreground">
              Step {step} of {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="h-2" data-testid="progress-setup" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@university.edu" {...field} data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-year">
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Freshman" data-testid="option-freshman">Freshman</SelectItem>
                            <SelectItem value="Sophomore" data-testid="option-sophomore">Sophomore</SelectItem>
                            <SelectItem value="Junior" data-testid="option-junior">Junior</SelectItem>
                            <SelectItem value="Senior" data-testid="option-senior">Senior</SelectItem>
                            <SelectItem value="Graduate" data-testid="option-graduate">Graduate</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="major"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Major</FormLabel>
                        <FormControl>
                          <Input placeholder="Computer Science" {...field} data-testid="input-major" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about yourself..."
                          className="resize-none"
                          rows={3}
                          {...field}
                          data-testid="input-bio"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Courses & Interests</h3>
                
                <div>
                  <Label className="mb-2 block">Your Courses</Label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="e.g., CS101, MATH201"
                      value={customCourse}
                      onChange={(e) => setCustomCourse(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCourse())}
                      data-testid="input-course"
                    />
                    <Button type="button" onClick={addCourse} data-testid="button-add-course">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.watch("courses").map((course, idx) => (
                      <Badge key={idx} variant="default" className="rounded-full gap-1" data-testid={`badge-course-${idx}`}>
                        {course}
                        <button
                          type="button"
                          onClick={() => removeCourse(course)}
                          className="hover-elevate rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Interests</Label>
                  <p className="text-sm text-muted-foreground mb-3">Select all that apply</p>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS_OPTIONS.map((interest) => (
                      <Badge
                        key={interest}
                        variant={selectedInterests.includes(interest) ? "default" : "outline"}
                        className="cursor-pointer rounded-full hover-elevate"
                        onClick={() => toggleSelection(interest, selectedInterests, setSelectedInterests)}
                        data-testid={`badge-interest-${interest}`}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Hobbies & Goals</h3>
                
                <div>
                  <Label className="mb-2 block">Hobbies</Label>
                  <p className="text-sm text-muted-foreground mb-3">What do you like to do?</p>
                  <div className="flex flex-wrap gap-2">
                    {HOBBIES_OPTIONS.map((hobby) => (
                      <Badge
                        key={hobby}
                        variant={selectedHobbies.includes(hobby) ? "default" : "outline"}
                        className="cursor-pointer rounded-full hover-elevate"
                        onClick={() => toggleSelection(hobby, selectedHobbies, setSelectedHobbies)}
                        data-testid={`badge-hobby-${hobby}`}
                      >
                        {hobby}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Goals</Label>
                  <p className="text-sm text-muted-foreground mb-3">What are you hoping to achieve?</p>
                  <div className="flex flex-wrap gap-2">
                    {GOALS_OPTIONS.map((goal) => (
                      <Badge
                        key={goal}
                        variant={selectedGoals.includes(goal) ? "default" : "outline"}
                        className="cursor-pointer rounded-full hover-elevate"
                        onClick={() => toggleSelection(goal, selectedGoals, setSelectedGoals)}
                        data-testid={`badge-goal-${goal}`}
                      >
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Almost Done!</h3>
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campus Location (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="North Campus, Building A" {...field} data-testid="input-location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="p-6 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-3">Profile Summary</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Name:</span> {form.watch("name")}</p>
                    <p><span className="text-muted-foreground">Year:</span> {form.watch("year")}</p>
                    <p><span className="text-muted-foreground">Major:</span> {form.watch("major")}</p>
                    <p><span className="text-muted-foreground">Courses:</span> {form.watch("courses").length} added</p>
                    <p><span className="text-muted-foreground">Interests:</span> {selectedInterests.length} selected</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                  data-testid="button-back"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              
              {step < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex-1"
                  data-testid="button-next"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" className="flex-1" data-testid="button-complete">
                  <Check className="mr-2 h-4 w-4" />
                  Complete Profile
                </Button>
              )}
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}
