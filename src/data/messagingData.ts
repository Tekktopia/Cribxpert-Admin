import type { Conversation, Message } from "@/types";

export const conversations: Conversation[] = [
  {
    id: "c1",
    participants: [
      { id: "u1", name: "John Doe", avatar: "/avatars/michael.png" },
      { id: "u2", name: "Sarah", role: "Host", avatar: "/avatars/cynthia.png" },
    ],
    lastMessageAt: new Date().toISOString(),
    preview: "Can I check in early?",
    unreadCount: 0,
    status: "normal",
    contextSubtitle: "Makinwa's cottage",
  },
  {
    id: "c2",
    participants: [
      { id: "it", name: "IT Support", initials: "IT", role: "Support" },
    ],
    lastMessageAt: new Date().toISOString(),
    preview: "Server update scheduled at midnight",
    unreadCount: 0,
    status: "normal",
  },
  {
    id: "c3",
    participants: [
      { id: "u1", name: "John Doe", avatar: "/avatars/michael.png" },
      { id: "u2", name: "Sarah", role: "Host", avatar: "/avatars/cynthia.png" },
    ],
    lastMessageAt: new Date().toISOString(),
    preview: "Hi, is your apartment availab...",
    unreadCount: 2,
    status: "flagged",
    contextSubtitle: "Makinwa's cottage",
  },
  {
    id: "c4",
    participants: [
      { id: "hr", name: "HR Department", role: "Support", initials: "HR" },
    ],
    lastMessageAt: new Date().toISOString(),
    preview: "Reminder: Complete compliance tr...",
    unreadCount: 0,
    status: "normal",
  },
];

export const messagesByConversation: Record<string, Message[]> = {
  c1: [
    {
      id: "m1",
      conversationId: "c1",
      senderId: "u1",
      body: "Hi, is your apartment available from July 10–12?",
      createdAt: new Date().toISOString(),
    },
    {
      id: "m2",
      conversationId: "c1",
      senderId: "u2",
      body: "Yes, it is available! The price is ₦45,000/night.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "m3",
      conversationId: "c1",
      senderId: "u1",
      body: "Perfect! How far is it from the beach?",
      createdAt: new Date().toISOString(),
    },
    {
      id: "m4",
      conversationId: "c1",
      senderId: "u2",
      body: "About a 5–minute walk. I'll send you the booking link.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "m5",
      conversationId: "c1",
      senderId: "u2",
      body: "",
      createdAt: new Date().toISOString(),
      attachments: [
        {
          id: "a1",
          type: "file",
          url: "/files/BookingLink.pdf",
          name: "BookingLink.pdf",
          sizeLabel: "15 KB",
        },
      ],
    },
  ],
  c2: [
    {
      id: "m7",
      conversationId: "c2",
      senderId: "it",
      body: "Hi, a server update is scheduled at midnight.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "m8",
      conversationId: "c2",
      senderId: "it",
      body: "Expected downtime is 5–10 minutes.",
      createdAt: new Date().toISOString(),
    },
  ],
  c3: [
    {
      id: "m6",
      conversationId: "c3",
      senderId: "u1",
      body: "Hi, is your apartment available...",
      createdAt: new Date().toISOString(),
    },
  ],
  c4: [
    {
      id: "m9",
      conversationId: "c4",
      senderId: "hr",
      body: "Hi, payout for Sarah done?",
      createdAt: new Date().toISOString(),
    },
    {
      id: "m10",
      conversationId: "c4",
      senderId: "hr",
      body: "Okay, let me know if she complains",
      createdAt: new Date().toISOString(),
    },
  ],
};
