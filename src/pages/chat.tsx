import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

// Mock chat rooms
const mockRooms = [
  {
    id: "1",
    name: "CS Algorithm Study Group",
    type: "study",
    lastMessage: "Anyone free to study tonight?",
    lastMessageTime: new Date("2024-01-15T18:30:00"),
    unread: 3,
  },
  {
    id: "2",
    name: "Spring Festival Planning",
    type: "event",
    lastMessage: "Great idea! Let's do it",
    lastMessageTime: new Date("2024-01-15T16:45:00"),
    unread: 0,
  },
  {
    id: "3",
    name: "Basketball Team Chat",
    type: "social",
    lastMessage: "Practice moved to 5pm tomorrow",
    lastMessageTime: new Date("2024-01-15T14:20:00"),
    unread: 1,
  },
];

// Mock messages for selected room
const mockMessages = [
  {
    id: "1",
    senderId: "other",
    senderName: "Sarah Chen",
    content: "Hey everyone! Are we still meeting at the library tonight?",
    createdAt: new Date("2024-01-15T18:00:00"),
  },
  {
    id: "2",
    senderId: "me",
    senderName: "You",
    content: "Yes! I'll be there at 7pm",
    createdAt: new Date("2024-01-15T18:05:00"),
  },
  {
    id: "3",
    senderId: "other2",
    senderName: "Marcus Johnson",
    content: "Count me in. I'll bring snacks!",
    createdAt: new Date("2024-01-15T18:10:00"),
  },
  {
    id: "4",
    senderId: "other",
    senderName: "Sarah Chen",
    content: "Perfect! See you all there 📚",
    createdAt: new Date("2024-01-15T18:15:00"),
  },
];

export default function Chat() {
  const [selectedRoom, setSelectedRoom] = useState(mockRooms[0]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRooms = mockRooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      console.log("Sending message:", messageInput);
      setMessageInput("");
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Chat List Sidebar */}
      <div className="w-80 border-r flex flex-col bg-card">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold mb-3">Messages</h2>
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
            {filteredRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`w-full p-3 rounded-lg text-left hover-elevate ${
                  selectedRoom.id === room.id ? "bg-muted" : ""
                }`}
                data-testid={`chat-room-${room.id}`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{room.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate">{room.name}</h3>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {format(room.lastMessageTime, "h:mm a")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-muted-foreground truncate">
                        {room.lastMessage}
                      </p>
                      {room.unread > 0 && (
                        <Badge
                          variant="default"
                          className="rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center text-xs"
                        >
                          {room.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b bg-card">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{selectedRoom.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold" data-testid="text-chat-room-name">
                {selectedRoom.name}
              </h2>
              <p className="text-sm text-muted-foreground capitalize">
                {selectedRoom.type} chat
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl">
            {mockMessages.map((message) => {
              const isMe = message.senderId === "me";
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
                      {format(message.createdAt, "h:mm a")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t bg-card">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1"
              data-testid="input-message"
            />
            <Button type="submit" size="icon" data-testid="button-send">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
