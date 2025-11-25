import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User, 
  GraduationCap, 
  BookOpen, 
  Heart, 
  Target, 
  MapPin,
  Pencil,
  Gamepad2,
  Users,
  X,
  Save,
  MessageSquare
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StudentProfileDialog } from "@/components/student-profile-dialog";
import type { Student, Match } from "@shared/schema";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Student>>({});
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const { data: connections = [], isLoading: connectionsLoading } = useQuery<Match[]>({
    queryKey: ["/api/matches", user?.student?.id],
    queryFn: async () => {
      if (!user?.student?.id) return [];
      const response = await fetch(`/api/matches/${user.student.id}`);
      if (!response.ok) throw new Error("Failed to fetch connections");
      return response.json();
    },
    enabled: !!user?.student?.id,
  });

  const { data: connectedStudents = [] } = useQuery<Student[]>({
    queryKey: ["/api/students/connected", user?.student?.id, connections],
    queryFn: async () => {
      if (!user?.student?.id || connections.length === 0) return [];
      const studentIds = connections.map(m => 
        m.student1Id === user.student!.id ? m.student2Id : m.student1Id
      );
      const students = await Promise.all(
        studentIds.map(async (id) => {
          const response = await fetch(`/api/students/${id}`);
          if (!response.ok) return null;
          return response.json();
        })
      );
      return students.filter(Boolean) as Student[];
    },
    enabled: connections.length > 0,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<Student>) => {
      const response = await apiRequest("PUT", `/api/students/${user?.student?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Profile updated successfully!" });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Failed to update profile" });
    },
  });

  const updateUsernameMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await apiRequest("PUT", `/api/users/${user?.id}`, { username });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Username updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Failed to update username" });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <div className="flex items-center gap-6 mb-8">
              <Skeleton className="w-24 h-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] text-center p-8">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">Not Logged In</h3>
        <p className="text-muted-foreground mb-4">
          Please log in to view your profile
        </p>
        <Link href="/login">
          <Button data-testid="button-login">Log In</Button>
        </Link>
      </div>
    );
  }

  const student = user.student;

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] text-center p-8">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">Complete Your Profile</h3>
        <p className="text-muted-foreground mb-4">
          Set up your profile to start connecting with other students
        </p>
        <Link href="/profile-setup">
          <Button data-testid="button-setup-profile">Set Up Profile</Button>
        </Link>
      </div>
    );
  }

  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const startEditing = () => {
    setEditData({
      name: student.name,
      email: student.email,
      year: student.year,
      major: student.major,
      bio: student.bio || "",
      location: student.location || "",
      courses: student.courses || [],
      interests: student.interests || [],
      hobbies: student.hobbies || [],
      goals: student.goals || [],
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfileMutation.mutate(editData);
  };

  const handleArrayChange = (field: keyof Student, value: string) => {
    const items = value.split(",").map(item => item.trim()).filter(Boolean);
    setEditData(prev => ({ ...prev, [field]: items }));
  };

  const handleViewProfile = (studentData: Student) => {
    setSelectedStudent(studentData);
    setProfileDialogOpen(true);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Profile</h1>
          {!isEditing ? (
            <Button variant="outline" onClick={startEditing} data-testid="button-edit-profile">
              <Pencil className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)} data-testid="button-cancel-edit">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateProfileMutation.isPending} data-testid="button-save-profile">
                <Save className="h-4 w-4 mr-2" />
                {updateProfileMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>

        <Card className="overflow-hidden" data-testid="card-profile">
          <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-8">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24 border-4 border-background">
                <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={editData.name || ""}
                      onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Name"
                      className="text-xl font-bold"
                      data-testid="input-name"
                    />
                    <div className="flex gap-2">
                      <Select
                        value={editData.year}
                        onValueChange={(value) => setEditData(prev => ({ ...prev, year: value }))}
                      >
                        <SelectTrigger className="w-[140px]" data-testid="select-year">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Freshman">Freshman</SelectItem>
                          <SelectItem value="Sophomore">Sophomore</SelectItem>
                          <SelectItem value="Junior">Junior</SelectItem>
                          <SelectItem value="Senior">Senior</SelectItem>
                          <SelectItem value="Graduate">Graduate</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={editData.major || ""}
                        onChange={(e) => setEditData(prev => ({ ...prev, major: e.target.value }))}
                        placeholder="Major"
                        className="flex-1"
                        data-testid="input-major"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold" data-testid="text-profile-name">
                      {student.name}
                    </h2>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                      <GraduationCap className="h-4 w-4" />
                      <span data-testid="text-profile-year-major">
                        {student.year} - {student.major}
                      </span>
                    </div>
                  </>
                )}
                {isEditing ? (
                  <div className="flex items-center gap-2 mt-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Input
                      value={editData.location || ""}
                      onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Location"
                      className="flex-1"
                      data-testid="input-location"
                    />
                  </div>
                ) : student.location && (
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    <span data-testid="text-profile-location">{student.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div data-testid="section-account">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Account</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-24">Username:</span>
                  <span data-testid="text-username">{user.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-24">Email:</span>
                  {isEditing ? (
                    <Input
                      value={editData.email || ""}
                      onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Email"
                      className="flex-1"
                      data-testid="input-email"
                    />
                  ) : (
                    <span data-testid="text-email">{student.email}</span>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div data-testid="section-bio">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">About Me</h3>
              </div>
              {isEditing ? (
                <Textarea
                  value={editData.bio || ""}
                  onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  data-testid="input-bio"
                />
              ) : (
                <p className="text-muted-foreground" data-testid="text-profile-bio">
                  {student.bio || "No bio yet"}
                </p>
              )}
            </div>

            <Separator />

            <div data-testid="section-courses">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Current Courses</h3>
              </div>
              {isEditing ? (
                <div>
                  <Input
                    value={(editData.courses || []).join(", ")}
                    onChange={(e) => handleArrayChange("courses", e.target.value)}
                    placeholder="CS101, Math201, etc. (comma-separated)"
                    data-testid="input-courses"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Separate with commas</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {student.courses && student.courses.length > 0 ? (
                    student.courses.map((course, idx) => (
                      <Badge key={idx} variant="default" className="rounded-full" data-testid={`badge-course-${idx}`}>
                        {course}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No courses added</p>
                  )}
                </div>
              )}
            </div>

            <div data-testid="section-interests">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Interests</h3>
              </div>
              {isEditing ? (
                <div>
                  <Input
                    value={(editData.interests || []).join(", ")}
                    onChange={(e) => handleArrayChange("interests", e.target.value)}
                    placeholder="Technology, Music, etc. (comma-separated)"
                    data-testid="input-interests"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Separate with commas</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {student.interests && student.interests.length > 0 ? (
                    student.interests.map((interest, idx) => (
                      <Badge key={idx} variant="secondary" className="rounded-full" data-testid={`badge-interest-${idx}`}>
                        {interest}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No interests added</p>
                  )}
                </div>
              )}
            </div>

            <div data-testid="section-hobbies">
              <div className="flex items-center gap-2 mb-3">
                <Gamepad2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Hobbies</h3>
              </div>
              {isEditing ? (
                <div>
                  <Input
                    value={(editData.hobbies || []).join(", ")}
                    onChange={(e) => handleArrayChange("hobbies", e.target.value)}
                    placeholder="Gaming, Reading, etc. (comma-separated)"
                    data-testid="input-hobbies"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Separate with commas</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {student.hobbies && student.hobbies.length > 0 ? (
                    student.hobbies.map((hobby, idx) => (
                      <Badge key={idx} variant="outline" className="rounded-full" data-testid={`badge-hobby-${idx}`}>
                        {hobby}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No hobbies added</p>
                  )}
                </div>
              )}
            </div>

            <div data-testid="section-goals">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Goals</h3>
              </div>
              {isEditing ? (
                <div>
                  <Input
                    value={(editData.goals || []).join(", ")}
                    onChange={(e) => handleArrayChange("goals", e.target.value)}
                    placeholder="Find study partners, etc. (comma-separated)"
                    data-testid="input-goals"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Separate with commas</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {student.goals && student.goals.length > 0 ? (
                    student.goals.map((goal, idx) => (
                      <Badge key={idx} variant="outline" className="rounded-full" data-testid={`badge-goal-${idx}`}>
                        {goal}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No goals added</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6" data-testid="card-connections">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">My Connections ({connectedStudents.length})</h3>
          </div>
          
          {connectionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : connectedStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No connections yet</p>
              <Link href="/discover">
                <Button variant="outline" data-testid="button-discover-connections">
                  Discover People
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {connectedStudents.map((connectedStudent) => {
                const connectionInitials = connectedStudent.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase();
                return (
                  <div
                    key={connectedStudent.id}
                    className="flex items-center justify-between p-3 rounded-lg hover-elevate cursor-pointer"
                    onClick={() => handleViewProfile(connectedStudent)}
                    data-testid={`connection-${connectedStudent.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{connectionInitials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{connectedStudent.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {connectedStudent.year} - {connectedStudent.major}
                        </p>
                      </div>
                    </div>
                    <Link href="/chat" onClick={(e) => e.stopPropagation()}>
                      <Button size="icon" variant="ghost" data-testid={`button-chat-${connectedStudent.id}`}>
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <StudentProfileDialog
        student={selectedStudent}
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
      />
    </div>
  );
}
