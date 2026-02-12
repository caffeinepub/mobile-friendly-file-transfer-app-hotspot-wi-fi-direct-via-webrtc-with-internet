export type SessionState =
  | 'idle'
  | 'creating'
  | 'waiting'
  | 'joining'
  | 'connecting'
  | 'connected'
  | 'transferring'
  | 'completed'
  | 'failed'
  | 'disconnected';

export interface SessionContext {
  sessionCode?: string;
  role?: 'sender' | 'receiver';
  error?: string;
}
