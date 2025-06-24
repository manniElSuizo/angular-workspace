import { RailOrderStatus } from "./rail-order-status.enum";

export interface RailOrderStatusHistory {
  railOrderStatus: RailOrderStatus; // Enum reference
  dateTime: string; // ISO 8601 format (e.g., "2024-07-24T09:37:42Z")
}

export interface RailOrderStatusHistoryList {
  statusHistory: RailOrderStatusHistory[];
}