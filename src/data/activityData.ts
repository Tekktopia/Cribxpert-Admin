/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ActivityRecord {
  id: string;
  ticketId: string;
  date: string;
  status: "Under Investigation" | "Resolved" | "Pending" | "Closed";
  type:
    | "Property Issue"
    | "Property Condition"
    | "Payment Issue"
    | "Account Issue"
    | "Booking Issue";
}

export const mockActivityData: ActivityRecord[] = [
  {
    id: "1",
    ticketId: "100012",
    date: "2025-01-20",
    status: "Under Investigation",
    type: "Property Issue",
  },
  {
    id: "2",
    ticketId: "100019",
    date: "2025-01-22",
    status: "Resolved",
    type: "Property Condition",
  },
  {
    id: "3",
    ticketId: "100020",
    date: "2025-01-23",
    status: "Pending",
    type: "Payment Issue",
  },
  {
    id: "4",
    ticketId: "100021",
    date: "2025-01-24",
    status: "Under Investigation",
    type: "Account Issue",
  },
  {
    id: "5",
    ticketId: "100022",
    date: "2025-01-25",
    status: "Resolved",
    type: "Booking Issue",
  },
  // Add more mock data for pagination testing
  ...Array.from({ length: 45 }, (_, i) => ({
    id: (i + 6).toString(),
    ticketId: (100023 + i).toString(),
    date: new Date(2025, 0, 26 + (i % 30)).toISOString().split("T")[0],
    status: ["Under Investigation", "Resolved", "Pending", "Closed"][
      i % 4
    ] as any,
    type: [
      "Property Issue",
      "Property Condition",
      "Payment Issue",
      "Account Issue",
      "Booking Issue",
    ][i % 5] as any,
  })),
];
