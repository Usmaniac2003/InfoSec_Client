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
    vulnerable_initiate:"/key-exchange/vulnerable-initiate",
    confirm: "/key-exchange/confirm",
    logs: "/key-exchange/logs",
  },

  attacks: {
    mitmTest: "/attacks/mitm",
    replayTest: "/attacks/replay",
  },
} as const;
