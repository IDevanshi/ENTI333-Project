import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudyGroupCard } from "@/components/study-group-card";
import { StudyGroupDetailDialog } from "@/components/study-group-detail-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertStudyGroupSchema, type InsertStudyGroup, type StudyGroup } from "@shared/schema";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const groupFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  course: z.string().min(1, "Course is required"),
  description: z.string().min(1, "Description is required"),
  maxMembers: z.string().optional(),
  isPrivate: z.boolean().default(false),
});

type GroupFormData = z.infer<typeof groupFormSchema>;

export default function StudyGroups() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newGroupTags, setNewGroupTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const form = useForm<GroupFormData>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: "",
      course: "",
      description: "",
      maxMembers: "",
      isPrivate: false,
    },
  });

  const { data: groups, isLoading } = useQuery<StudyGroup[]>({
    queryKey: ["/api/study-groups"],
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: GroupFormData) => {
      if (!user?.student?.id) throw new Error("Not authenticated");
      const groupData: InsertStudyGroup = {
        name: data.name,
        course: data.course,
        description: data.description,
        creatorId: user.student.id,
        members: [user.student.id],
        tags: newGroupTags,
        maxMembers: data.maxMembers ? parseInt(data.maxMembers) : null,
        isPrivate: data.isPrivate,
      };
      const response = await apiRequest("POST", "/api/study-groups", groupData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-groups"] });
      toast({
        title: "Group created!",
        description: "Your study group has been successfully created.",
      });
      setDialogOpen(false);
      form.reset();
      setNewGroupTags([]);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create study group. Please try again.",
      });
    },
  });

  const joinLeaveMutation = useMutation({
    mutationFn: async ({ groupId, action }: { groupId: string; action: "join" | "leave" }) => {
      if (!user?.student?.id) throw new Error("Not authenticated");
      const endpoint = action === "join" ? `/api/study-groups/${groupId}/join` : `/api/study-groups/${groupId}/leave`;
      const method = action === "join" ? "POST" : "DELETE";
      const response = await apiRequest(method, endpoint, {
        studentId: user.student.id,
      });
      return await response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-groups"] });
      toast({
        title: variables.action === "join" ? "Joined group!" : "Left group",
        description: variables.action === "join" 
          ? "You've joined this study group."
          : "You've left this study group.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update membership. Please try again.",
      });
    },
  });

  const handleMembership = (groupId: string, isMember: boolean) => {
    joinLeaveMutation.mutate({
      groupId,
      action: isMember ? "leave" : "join",
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !newGroupTags.includes(tagInput.trim())) {
      setNewGroupTags([...newGroupTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setNewGroupTags(newGroupTags.filter(t => t !== tag));
  };

  const onSubmit = (data: GroupFormData) => {
    createGroupMutation.mutate(data);
  };

  const filteredGroups = groups?.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const isMember = (group: StudyGroup) => {
    return user?.student?.id ? group.members.includes(user.student.id) : false;
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Study Groups</h1>
            <p className="text-muted-foreground">Loading groups...</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Study Groups</h1>
          <p className="text-muted-foreground">
            Find or create study groups for your classes
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-group" disabled={!user?.student}>
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Study Group</DialogTitle>
              <DialogDescription>Fill in the details to create a new study group.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group Name</FormLabel>
                      <FormControl>
                        <Input placeholder="CS Algorithm Study Circle" {...field} data-testid="input-group-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="course"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Code</FormLabel>
                      <FormControl>
                        <Input placeholder="CS301" {...field} data-testid="input-group-course" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What will your group focus on?"
                          rows={3}
                          {...field}
                          data-testid="input-group-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <Label htmlFor="group-tags">Tags</Label>
                  <div className="flex gap-2 mb-2 mt-1">
                    <Input
                      id="group-tags"
                      placeholder="Add a tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      data-testid="input-group-tag"
                    />
                    <Button type="button" onClick={addTag} data-testid="button-add-tag">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newGroupTags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="rounded-full gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover-elevate rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maxMembers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Members (Optional)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="10" {...field} data-testid="input-group-capacity" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isPrivate"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 pt-6">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-group-private"
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">Private Group</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createGroupMutation.isPending}
                  data-testid="button-submit-group"
                >
                  {createGroupMutation.isPending ? "Creating..." : "Create Study Group"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search study groups..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          data-testid="input-search-groups"
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all-groups">All Groups</TabsTrigger>
          <TabsTrigger value="my-groups" data-testid="tab-my-groups">My Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {filteredGroups.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredGroups.map((group) => (
                <StudyGroupCard
                  key={group.id}
                  group={group}
                  isMember={isMember(group)}
                  onJoin={user?.student ? () => handleMembership(group.id, isMember(group)) : undefined}
                  onClick={() => {
                    setSelectedGroup(group);
                    setDetailDialogOpen(true);
                  }}
                />
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-12 text-muted-foreground" data-testid="empty-groups-search">
              No study groups found matching "{searchQuery}"
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Study Groups Yet</h3>
              <p className="text-muted-foreground mb-4" data-testid="empty-groups">
                Be the first to create a study group!
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-groups" className="mt-6">
          {filteredGroups.filter(g => isMember(g)).length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredGroups
                .filter(g => isMember(g))
                .map((group) => (
                  <StudyGroupCard
                    key={group.id}
                    group={group}
                    isMember={true}
                    onJoin={() => handleMembership(group.id, true)}
                    onClick={() => {
                      setSelectedGroup(group);
                      setDetailDialogOpen(true);
                    }}
                  />
                ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground" data-testid="empty-my-groups">
              You haven't joined any study groups yet. Join groups to see them here.
            </div>
          )}
        </TabsContent>
      </Tabs>

      <StudyGroupDetailDialog
        group={selectedGroup}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onJoin={selectedGroup ? () => handleMembership(selectedGroup.id, isMember(selectedGroup)) : undefined}
        isMember={selectedGroup ? isMember(selectedGroup) : false}
        isLoggedIn={!!user?.student}
      />
    </div>
  );
}
