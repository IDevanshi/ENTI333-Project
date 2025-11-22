import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudyGroupCard } from "@/components/study-group-card";
import { Plus, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

// Mock study groups data
const mockGroups = [
  {
    id: "1",
    name: "CS Algorithm Study Circle",
    course: "CS301",
    description: "Weekly meetups to tackle tough algorithm problems together. We focus on LeetCode and interview prep.",
    image: "",
    creatorId: "user1",
    members: ["1", "2", "3", "4", "5"],
    tags: ["Algorithms", "Data Structures", "Interview Prep"],
    maxMembers: 10,
    isPrivate: false,
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Calculus Homework Help",
    course: "MATH210",
    description: "Struggling with calculus? Join us! We meet twice a week to work through problem sets.",
    image: "",
    creatorId: "user2",
    members: ["1", "2", "3", "4", "5", "6", "7"],
    tags: ["Calculus", "Problem Sets", "Homework"],
    maxMembers: 15,
    isPrivate: false,
    createdAt: new Date(),
  },
  {
    id: "3",
    name: "Business Strategy Mastermind",
    course: "BUS401",
    description: "Advanced business students collaborating on case studies and projects.",
    image: "",
    creatorId: "user3",
    members: ["1", "2", "3"],
    tags: ["Business", "Case Studies", "Projects"],
    maxMembers: 8,
    isPrivate: true,
    createdAt: new Date(),
  },
];

export default function StudyGroups() {
  const [searchQuery, setSearchQuery] = useState("");
  const [memberGroups, setMemberGroups] = useState<Set<string>>(new Set(["1"]));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newGroupTags, setNewGroupTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const toggleMembership = (groupId: string) => {
    const newMembership = new Set(memberGroups);
    if (newMembership.has(groupId)) {
      newMembership.delete(groupId);
    } else {
      newMembership.add(groupId);
    }
    setMemberGroups(newMembership);
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

  const filteredGroups = mockGroups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Button data-testid="button-create-group">
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Study Group</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setDialogOpen(false); }}>
              <div>
                <Label htmlFor="group-name">Group Name</Label>
                <Input id="group-name" placeholder="CS Algorithm Study Circle" data-testid="input-group-name" />
              </div>
              <div>
                <Label htmlFor="group-course">Course Code</Label>
                <Input id="group-course" placeholder="CS301" data-testid="input-group-course" />
              </div>
              <div>
                <Label htmlFor="group-description">Description</Label>
                <Textarea
                  id="group-description"
                  placeholder="What will your group focus on?"
                  rows={3}
                  data-testid="input-group-description"
                />
              </div>
              <div>
                <Label htmlFor="group-tags">Tags</Label>
                <div className="flex gap-2 mb-2">
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
                <div>
                  <Label htmlFor="group-capacity">Max Members (Optional)</Label>
                  <Input id="group-capacity" type="number" placeholder="10" data-testid="input-group-capacity" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="group-private" data-testid="switch-group-private" />
                  <Label htmlFor="group-private">Private Group</Label>
                </div>
              </div>
              <Button type="submit" className="w-full" data-testid="button-submit-group">
                Create Study Group
              </Button>
            </form>
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
                  isMember={memberGroups.has(group.id)}
                  onJoin={() => toggleMembership(group.id)}
                />
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-12 text-muted-foreground" data-testid="empty-groups-search">
              No study groups found matching "{searchQuery}"
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground" data-testid="empty-groups">
              No study groups available. Create the first one!
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-groups" className="mt-6">
          {filteredGroups.filter(g => memberGroups.has(g.id)).length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredGroups
                .filter(g => memberGroups.has(g.id))
                .map((group) => (
                  <StudyGroupCard
                    key={group.id}
                    group={group}
                    isMember={true}
                    onJoin={() => toggleMembership(group.id)}
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
    </div>
  );
}
