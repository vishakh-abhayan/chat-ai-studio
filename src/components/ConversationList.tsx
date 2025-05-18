
import { Button } from "@/components/ui/button";
import { Conversation } from "@/types/azure-openai";
import { formatDistanceToNow } from "date-fns";
import { 
  Plus, MessageSquare, Trash2, Edit, Check, X
} from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onCreateConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, name: string) => void;
}

export const ConversationList = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  onRenameConversation
}: ConversationListProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  const handleStartRenaming = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setNewName(conversation.name);
  };

  const handleSaveRename = (id: string) => {
    if (newName.trim()) {
      onRenameConversation(id, newName.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = () => {
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full bg-muted/20 dark:bg-muted/10">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-medium">Conversations</h2>
        <Button variant="outline" size="sm" onClick={onCreateConversation}>
          <Plus size={16} className="mr-2" />
          New
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No conversations yet
          </div>
        ) : (
          <ul className="space-y-1 p-2">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <div
                   className={`flex items-center p-2 rounded-md ${
                    activeConversationId === conversation.id
                      ? "bg-primary/10 text-primary dark:bg-primary/20"
                      : "hover:bg-muted/50 dark:hover:bg-muted/20"
                  } cursor-pointer group`}
                >
                  {editingId === conversation.id ? (
                    <div className="flex items-center w-full">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="h-8 flex-1 mr-1"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveRename(conversation.id);
                          if (e.key === "Escape") handleCancelRename();
                        }}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleSaveRename(conversation.id)}
                        className="h-6 w-6"
                      >
                        <Check size={14} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleCancelRename}
                        className="h-6 w-6"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div
                        className="flex-1 flex items-center gap-2"
                        onClick={() => onSelectConversation(conversation.id)}
                      >
                        <MessageSquare size={16} className="text-gray-500" />
                        <span className="truncate">{conversation.name}</span>
                      </div>
                      
                      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartRenaming(conversation);
                          }}
                        >
                          <Edit size={14} />
                        </Button>
                        
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-500"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72" side="right">
                            <div className="space-y-3">
                              <h4 className="font-medium">Delete conversation?</h4>
                              <p className="text-sm text-muted-foreground">
                                This action cannot be undone.
                              </p>
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteConversation(conversation.id);
                                  }}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </>
                  )}
                </div>
                {editingId !== conversation.id && (
                  <p className="text-xs text-gray-500 px-8 pb-1">
                    {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
