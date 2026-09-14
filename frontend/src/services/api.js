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
export const sendChatMessage = async (message, customerId = null, sessionId = null) => {
  const response = await api.post("/chat", {
    message,
    customer_id: customerId,
    session_id: sessionId,
  });
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

// ── Conversations ───────────────────────────────────────────────────
export const getConversation = async (conversationId) => {
  const response = await api.get(`/conversations/${conversationId}`);
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
