import { io } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const SOCKET_URL = API_URL.replace("/api", "");

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
});
