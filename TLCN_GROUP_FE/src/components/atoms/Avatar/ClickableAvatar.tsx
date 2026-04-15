import React, { useState, useRef, useEffect } from "react";
import { Button } from "../Button/Button";
import { useNavigate } from "react-router-dom";
import { authService } from "../../../services/authService";
import { Avatar } from "./index";
import conversationApi from "../../../api/conversationApi";
import { User } from 'lucide-react';
import { MessageCircle } from 'lucide-react';

type Props = {
  userId: string;
  username?: string;
  fullName?: string;
  avatarUrl?: string | null;
  size?: "sm" | "md";
  className?: string;
};

const ClickableAvatar: React.FC<Props> = ({ userId, username, fullName, avatarUrl, size = "md", className = "" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const otherName = fullName || username || "User";
  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "w-10 h-10";
      case "md":
        return "w-16 h-16";
      default:
        return "w-10 h-10";
    }
  };

  const handleViewProfile = () => {
    setOpen(false);
    navigate(`/users/${userId}`);
  };

  const handleChat = async () => {
    try {
      setOpen(false);
      if (!authService.isAuthenticated()) {
        navigate("/signin");
        return;
      }

      const convo: any = await conversationApi.getOrCreateConversation(userId);
      const id = convo?.id || convo?.conversation?.id || convo?.data?.id || convo?.conversationId || convo?.conversation?.conversationId;

      if (id) {
        navigate(`/connections?conversationId=${id}`);
      } else {
        navigate(`/connections`);
      }
    } catch (err) {
      console.error("Create conversation failed", err);
      const status = (err as any)?.response?.status;
      if (status === 401 || status === 403) {
        navigate("/signin");
      }
    }
  };

  return (
    <div className={`relative inline-block ${className}`} ref={ref}>
      <Button
        onClick={() => setOpen((s) => !s)}
        aria-label={`Open actions for ${otherName}`}
        className="rounded-full"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={otherName}
            className={`${getSizeClass()} rounded-full object-cover border-4 border-white shadow-lg`}
          />
        ) : (
          <Avatar name={otherName} size={size} />
        )}
      </Button>

      {open && (
        <div className="absolute z-50 top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="font-semibold text-gray-900 text-sm truncate">{otherName}</p>
            <p className="text-xs text-gray-500">@{username || 'user'}</p>
          </div>
          <div className="py-1">
            <Button
              onClick={handleViewProfile}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 transition-colors flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              View Profile
            </Button>
            <Button
              onClick={handleChat}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClickableAvatar;
