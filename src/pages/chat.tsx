import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Search, MessageCircle, Plus, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ChatRoom, Message, Student } from "@shared/schema";

export default function Chat() {
  const { user } = useAuth();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [wsMessages, setWsMessages] = useState<Message[]>([]);
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chatRooms = [], isLoading: roomsLoading } = useQuery<ChatRoom[]>({
    queryKey: ["/api/chat-rooms", user?.student?.id],
    queryFn: async () => {
      if (!user?.student?.id) return [];
      const response = await fetch(`/api/chat-rooms?studentId=${user.student.id}`);
      if (!response.ok) throw new Error("Failed to fetch chat rooms");
      return response.json();
    },
    enabled: !!user?.student?.id,
  });

  const { data: roomMessages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedRoomId],
    enabled: !!selectedRoomId,
  });

  const { data: allStudents = [] } = useQuery<Student[]>({
    queryKey: ["/api/students"],
    enabled: newChatDialogOpen,
  });

  const selectedRoom = chatRooms.find(r => r.id === selectedRoomId);

  const allMessages = [...roomMessages, ...wsMessages.filter(m => m.roomId === selectedRoomId)];
  const uniqueMessages = allMessages.filter((msg, index, self) =>
    index === self.findIndex(m => m.id === msg.id)
  );

  const filteredRooms = chatRooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const otherStudents = allStudents.filter(
    s => s.id !== user?.student?.id && 
    s.name.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  useEffect(() => {
    if (chatRooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(chatRooms[0].id);
    }
  }, [chatRooms, selectedRoomId]);

  useEffect(() => {
    if (!selectedRoomId) return;

    setWsMessages([]);

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join", roomId: selectedRoomId }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "message" && data.data) {
          setWsMessages(prev => [...prev, data.data]);
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, [selectedRoomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [uniqueMessages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedRoomId || !user?.student) return;
      
      const messageData = {
        roomId: selectedRoomId,
        senderId: user.student.id,
        senderName: user.student.name,
        content,
      };

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "message",
          ...messageData,
        }));
      } else {
        await apiRequest("POST", "/api/messages", messageData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedRoomId] });
      queryClient.invalidateQueries({ queryKey: ["/api/chat-rooms", user?.student?.id] });
    },
  });

  const startDirectChatMutation = useMutation({
    mutationFn: async (otherStudent: Student) => {
      if (!user?.student) return;
      
      const response = await apiRequest("POST", "/api/chat-rooms/direct", {
        student1Id: user.student.id,
        student2Id: otherStudent.id,
        student1Name: user.student.name,
        student2Name: otherStudent.name,
      });
      return await response.json();
    },
    onSuccess: (room: ChatRoom) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat-rooms", user?.student?.id] });
      setSelectedRoomId(room.id);
      setNewChatDialogOpen(false);
      setUserSearchQuery("");
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && user?.student) {
      sendMessageMutation.mutate(messageInput.trim());
      setMessageInput("");
    }
  };

  const handleStartChat = (student: Student) => {
    startDirectChatMutation.mutate(student);
  };

  const getRoomDisplayName = (room: ChatRoom) => {
    if (room.type === "direct" && user?.student) {
      const names = room.name.split(" & ");
      return names.find(n => n !== user.student?.name) || room.name;
    }
    return room.name;
  };

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="p-8 text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Sign in to Chat</h2>
          <p className="text-muted-foreground">
            Please log in to access your messages.
          </p>
        </Card>
      </div>
    );
  }

  if (!user.student) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="p-8 text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Complete Your Profile</h2>
          <p className="text-muted-foreground">
            Please set up your profile to start chatting.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="w-80 border-r flex flex-col bg-card">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-xl font-bold">Messages</h2>
            <Dialog open={newChatDialogOpen} onOpenChange={setNewChatDialogOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" data-testid="button-new-chat">
                  <Plus className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
                <DialogHeader>
                  <DialogTitle>Start New Chat</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      className="pl-9"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      data-testid="input-search-users"
                    />
                  </div>
                  <ScrollArea className="h-64">
                    <div className="space-y-1">
                      {otherStudents.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                          No users found
                        </p>
                      ) : (
                        otherStudents.map((student) => (
                          <button
                            key={student.id}
                            onClick={() => handleStartChat(student)}
                            disabled={startDirectChatMutation.isPending}
                            className="w-full p-3 rounded-lg text-left hover-elevate flex items-center gap-3"
                            data-testid={`user-${student.id}`}
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>{student.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm truncate">{student.name}</h3>
                              <p className="text-xs text-muted-foreground truncate">
                                {student.major} - {student.year}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-chats"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {roomsLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading chats...
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No chats yet</p>
                <p className="text-xs mt-1">Click + to start a conversation</p>
              </div>
            ) : (
              filteredRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`w-full p-3 rounded-lg text-left hover-elevate ${
                    selectedRoomId === room.id ? "bg-muted" : ""
                  }`}
                  data-testid={`chat-room-${room.id}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{getRoomDisplayName(room)[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-sm truncate">{getRoomDisplayName(room)}</h3>
                        {room.lastMessageTime && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {format(new Date(room.lastMessageTime), "h:mm a")}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-muted-foreground truncate">
                          {room.lastMessage || "No messages yet"}
                        </p>
                        {room.type !== "direct" && (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {room.type}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            <div className="p-4 border-b bg-card">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{getRoomDisplayName(selectedRoom)[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold" data-testid="text-chat-room-name">
                    {getRoomDisplayName(selectedRoom)}
                  </h2>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedRoom.type === "direct" ? "Direct message" : `${selectedRoom.type} chat`}
                  </p>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-4xl">
                {messagesLoading ? (
                  <div className="text-center text-muted-foreground py-8">
                    Loading messages...
                  </div>
                ) : uniqueMessages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  uniqueMessages.map((message) => {
                    const isMe = message.senderId === user.student?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
                        data-testid={`message-${message.id}`}
                      >
                        {!isMe && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {message.senderName[0]}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`flex-1 ${isMe ? "flex flex-col items-end" : ""}`}>
                          {!isMe && (
                            <p className="text-xs text-muted-foreground mb-1">
                              {message.senderName}
                            </p>
                          )}
                          <div
                            className={`inline-block px-4 py-2 rounded-2xl max-w-md ${
                              isMe
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-muted rounded-bl-sm"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(message.createdAt), "h:mm a")}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-card">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1"
                  data-testid="input-message"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!messageInput.trim() || sendMessageMutation.isPending}
                  data-testid="button-send"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a chat or start a new conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
