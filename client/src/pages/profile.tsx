import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  Edit, 
  MessageSquare, 
  UserMinus, 
  MapPin, 
  GraduationCap, 
  BookOpen,
  Target,
  Sparkles,
  Mail
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { Student, Match } from "@shared/schema";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    year: "",
    major: "",
    location: "",
    bio: "",
    email: "",
    courses: "",
    interests: "",
    hobbies: "",
    goals: "",
  });

  const { data: connections } = useQuery<Match[]>({
    queryKey: ["/api/matches", user?.student?.id, "accepted"],
    queryFn: async () => {
      if (!user?.student?.id) return [];
      const response = await fetch(`/api/matches/${user.student.id}/accepted`);
      return await response.json();
    },
    enabled: !!user?.student?.id,
  });

  const { data: allStudents } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<Student>) => {
      if (!user?.student?.id) throw new Error("No student profile");
      const response = await apiRequest("PUT", `/api/students/${user.student.id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been saved.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
      });
    },
  });

  const removeConnectionMutation = useMutation({
    mutationFn: async (matchId: string) => {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to delete");
      }
    },
    onSuccess: () => {
      toast({
        title: "Connection removed",
        description: "You are no longer connected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/matches", user?.student?.id, "accepted"] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove connection. Please try again.",
      });
    },
  });

  const startChatMutation = useMutation({
    mutationFn: async (otherStudentId: string) => {
      if (!user?.student?.id) throw new Error("Not authenticated");
      const response = await apiRequest("POST", "/api/chat-rooms/direct", {
        student1Id: user.student.id,
        student2Id: otherStudentId,
      });
      return await response.json();
    },
    onSuccess: () => {
      setLocation("/chat");
    },
  });

  const getConnectedStudent = (match: Match): Student | undefined => {
    if (!user?.student?.id) return undefined;
    const otherId = match.student1Id === user.student.id ? match.student2Id : match.student1Id;
    return allStudents?.find(s => s.id === otherId);
  };

  const handleEditClick = () => {
    if (user?.student) {
      setEditForm({
        name: user.student.name || "",
        year: user.student.year || "",
        major: user.student.major || "",
        location: user.student.location || "",
        bio: user.student.bio || "",
        email: user.student.email || "",
        courses: user.student.courses?.join(", ") || "",
        interests: user.student.interests?.join(", ") || "",
        hobbies: user.student.hobbies?.join(", ") || "",
        goals: user.student.goals?.join(", ") || "",
      });
      setIsEditing(true);
    }
  };

  const handleSaveProfile = () => {
    const parseList = (str: string) => str.split(",").map(s => s.trim()).filter(Boolean);
    
    updateProfileMutation.mutate({
      name: editForm.name,
      year: editForm.year,
      major: editForm.major,
      location: editForm.location || null,
      bio: editForm.bio || null,
      email: editForm.email,
      courses: parseList(editForm.courses),
      interests: parseList(editForm.interests),
      hobbies: parseList(editForm.hobbies),
      goals: parseList(editForm.goals),
    });
  };

  if (!user?.student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] text-center p-8">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">No Profile Yet</h3>
        <p className="text-muted-foreground mb-4">
          Create your profile to connect with other students
        </p>
        <Button onClick={() => setLocation("/profile-setup")} data-testid="button-create-profile">
          Create Profile
        </Button>
      </div>
    );
  }

  const student = user.student;
  const initials = student.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <Card data-testid="card-profile">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl" data-testid="text-profile-name">{student.name}</CardTitle>
              <p className="text-muted-foreground">@{user.username}</p>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <GraduationCap className="h-4 w-4" />
                <span>{student.year} - {student.major}</span>
              </div>
              {student.location && (
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{student.location}</span>
                </div>
              )}
            </div>
          </div>
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={handleEditClick} data-testid="button-edit-profile">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      data-testid="input-edit-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      data-testid="input-edit-email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select 
                      value={editForm.year} 
                      onValueChange={(value) => setEditForm({ ...editForm, year: value })}
                    >
                      <SelectTrigger data-testid="select-edit-year">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Freshman">Freshman</SelectItem>
                        <SelectItem value="Sophomore">Sophomore</SelectItem>
                        <SelectItem value="Junior">Junior</SelectItem>
                        <SelectItem value="Senior">Senior</SelectItem>
                        <SelectItem value="Graduate">Graduate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="major">Major</Label>
                    <Input
                      id="major"
                      value={editForm.major}
                      onChange={(e) => setEditForm({ ...editForm, major: e.target.value })}
                      data-testid="input-edit-major"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    placeholder="e.g., North Campus"
                    data-testid="input-edit-location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Tell others about yourself..."
                    data-testid="input-edit-bio"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courses">Courses (comma-separated)</Label>
                  <Input
                    id="courses"
                    value={editForm.courses}
                    onChange={(e) => setEditForm({ ...editForm, courses: e.target.value })}
                    placeholder="e.g., CS101, MATH201, PHYS101"
                    data-testid="input-edit-courses"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interests">Interests (comma-separated)</Label>
                  <Input
                    id="interests"
                    value={editForm.interests}
                    onChange={(e) => setEditForm({ ...editForm, interests: e.target.value })}
                    placeholder="e.g., AI, Web Development, Music"
                    data-testid="input-edit-interests"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hobbies">Hobbies (comma-separated)</Label>
                  <Input
                    id="hobbies"
                    value={editForm.hobbies}
                    onChange={(e) => setEditForm({ ...editForm, hobbies: e.target.value })}
                    placeholder="e.g., Gaming, Hiking, Photography"
                    data-testid="input-edit-hobbies"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goals">Goals (comma-separated)</Label>
                  <Input
                    id="goals"
                    value={editForm.goals}
                    onChange={(e) => setEditForm({ ...editForm, goals: e.target.value })}
                    placeholder="e.g., Find study partners, Make friends"
                    data-testid="input-edit-goals"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button variant="outline" onClick={() => setIsEditing(false)} data-testid="button-cancel-edit">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-save-profile"
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-6">
          {student.bio && (
            <div>
              <p className="text-muted-foreground">{student.bio}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {student.courses && student.courses.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Courses</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {student.courses.map((course: string, idx: number) => (
                    <Badge key={idx} variant="default">{course}</Badge>
                  ))}
                </div>
              </div>
            )}

            {student.interests && student.interests.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Interests</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {student.interests.map((interest: string, idx: number) => (
                    <Badge key={idx} variant="secondary">{interest}</Badge>
                  ))}
                </div>
              </div>
            )}

            {student.hobbies && student.hobbies.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Hobbies</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {student.hobbies.map((hobby: string, idx: number) => (
                    <Badge key={idx} variant="outline">{hobby}</Badge>
                  ))}
                </div>
              </div>
            )}

            {student.goals && student.goals.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Goals</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {student.goals.map((goal: string, idx: number) => (
                    <Badge key={idx} variant="outline">{goal}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-connections">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              My Connections
            </CardTitle>
            <Badge variant="secondary">{connections?.length || 0}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {!connections || connections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No connections yet</p>
              <p className="text-sm">Start discovering matches to make connections!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {connections.map((match) => {
                const connectedStudent = getConnectedStudent(match);
                if (!connectedStudent) return null;

                const studentInitials = connectedStudent.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase();

                return (
                  <div
                    key={match.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    data-testid={`connection-${match.id}`}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{studentInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{connectedStudent.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {connectedStudent.year} - {connectedStudent.major}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startChatMutation.mutate(connectedStudent.id)}
                        disabled={startChatMutation.isPending}
                        data-testid={`button-message-${match.id}`}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeConnectionMutation.mutate(match.id)}
                        disabled={removeConnectionMutation.isPending}
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-remove-${match.id}`}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
