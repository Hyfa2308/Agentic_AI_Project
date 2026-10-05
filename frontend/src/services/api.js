import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// ── Chat ────────────────────────────────────────────────────────────
export const sendChatMessage = async (message, customerId = null, conversationId = null) => {
  const payload = { message };
  if (customerId) payload.customer_id = customerId;
  if (conversationId) payload.conversation_id = conversationId;

  const response = await api.post("/chat", payload);
  return response.data;
};

export const getConversationHistory = async (conversationId) => {
  const response = await api.get(`/chat/history/${conversationId}`);
  return response.data;
};

// ── Tickets ─────────────────────────────────────────────────────────
export const createTicket = async (ticketData) => {
  const response = await api.post("/tickets", ticketData);
  return response.data;
};

export const getTickets = async (params = {}) => {
  const response = await api.get("/tickets", { params });
  return response.data;
};

export const getTicket = async (ticketId) => {
  const response = await api.get(`/tickets/${ticketId}`);
  return response.data;
};

export const updateTicket = async (ticketId, data) => {
  const response = await api.patch(`/tickets/${ticketId}`, data);
  return response.data;
};

export const addTicketMessage = async (ticketId, message) => {
  const response = await api.post(`/tickets/${ticketId}/messages`, message);
  return response.data;
};

// ── Customers ───────────────────────────────────────────────────────
export const getCustomerHistory = async (customerId) => {
  const response = await api.get(`/customers/${customerId}/history`);
  return response.data;
};

export const getCustomers = async () => {
  const response = await api.get("/customers");
  return response.data;
};

// ── Conversations ───────────────────────────────────────────────────
export const getConversation = async (conversationId) => {
  const response = await api.get(`/conversations/${conversationId}`);
  return response.data;
};

export const getConversationsList = async () => {
  const response = await api.get("/conversations");
  return response.data;
};

// ── Analytics ───────────────────────────────────────────────────────
export const getAnalytics = async () => {
  const response = await api.get("/analytics");
  return response.data;
};

// ── Knowledge Base ──────────────────────────────────────────────────
export const getKnowledgeBase = async () => {
  const response = await api.get("/knowledge");
  return response.data;
};

export const uploadKnowledgeDoc = async (docData) => {
  const response = await api.post("/knowledge", docData);
  return response.data;
};

// ── Feedback ────────────────────────────────────────────────────────
export const submitFeedback = async (feedbackData) => {
  const response = await api.post("/feedback", feedbackData);
  return response.data;
};

// ── Health ──────────────────────────────────────────────────────────
export const checkHealth = async () => {
  const response = await api.get("/health");
  return response.data;
};

export default api;
