export interface Message {
  id: number;
  userId: number;
  fromName: string;
  fromEmail: string;
  body: string;
  isRead: number;
  createdAt: string;
}

export interface MessagesResponse {
  success: boolean;
  data: Message[];
}
