// src/lib/api-routes.ts

// Master API endpoint list for the entire frontend.
// Change routes here once → auto updates everywhere else.

export const API_ROUTES = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
  },

  users: {
    base: "/users",
    byId: (id: number) => `/users/${id}`,
  },

  keyExchange: {
    initiate: "/key-exchange/initiate",
    respond: "/key-exchange/respond",
    confirm: "/key-exchange/confirm",
  },

  messages: {
    send: "/messages/send",
    history: "/messages",
  },

  files: {
    upload: "/files/upload",
    download: (id: string) => `/files/${id}`,
  },

  logs: {
    all: "/logs",
  },

  attacks: {
    mitmTest: "/attacks/mitm",
    replayTest: "/attacks/replay",
  },
} as const;
