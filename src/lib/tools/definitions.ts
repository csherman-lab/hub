export const HUB_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "read_gmail",
      description:
        "Read the user's recent Gmail inbox. Use when they ask about emails, inbox, or messages.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "read_calendar",
      description:
        "Read upcoming Google Calendar events for the next 7 days. Use for schedule, meetings, or availability.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "search_web",
      description: "Search the web for current information on a topic.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "remember",
      description:
        "Save a short fact about the user for future conversations. Use when they ask you to remember something.",
      parameters: {
        type: "object",
        properties: {
          fact: { type: "string", description: "Concise fact to remember" },
        },
        required: ["fact"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "draft_email",
      description:
        "Create an email draft for user approval. Does not send until approved.",
      parameters: {
        type: "object",
        properties: {
          to: { type: "string", description: "Recipient email" },
          subject: { type: "string", description: "Email subject" },
          body: { type: "string", description: "Email body text" },
        },
        required: ["subject", "body"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "draft_calendar_event",
      description:
        "Create a calendar event draft for user approval. Does not book until approved.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Event title" },
          description: { type: "string", description: "Event details" },
          when: {
            type: "string",
            description: "When the event happens (e.g. tomorrow 2pm)",
          },
        },
        required: ["title"],
      },
    },
  },
];

export const TOOL_LABELS: Record<string, string> = {
  read_gmail: "Checking Gmail…",
  read_calendar: "Checking Calendar…",
  search_web: "Searching the web…",
  remember: "Saving to memory…",
  draft_email: "Preparing email draft…",
  draft_calendar_event: "Preparing calendar draft…",
};

export type ToolName =
  | "read_gmail"
  | "read_calendar"
  | "search_web"
  | "remember"
  | "draft_email"
  | "draft_calendar_event";
