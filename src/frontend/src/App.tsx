import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import LandingScreen from './features/session/components/LandingScreen';
import SenderSessionScreen from './features/session/components/SenderSessionScreen';
import ReceiverJoinScreen from './features/session/components/ReceiverJoinScreen';
import ConnectedSessionScreen from './features/session/components/ConnectedSessionScreen';
import { SessionState } from './features/session/state/sessionMachine';

const queryClient = new QueryClient();

type Role = 'sender' | 'receiver' | null;

function AppContent() {
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [role, setRole] = useState<Role>(null);
  const [sessionCode, setSessionCode] = useState<string>('');
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);

  const handleStartAsSender = () => {
    setRole('sender');
    setSessionState('creating');
  };

  const handleStartAsReceiver = () => {
    setRole('receiver');
    setSessionState('joining');
  };

  const handleSessionCreated = (code: string) => {
    setSessionCode(code);
    setSessionState('waiting');
  };

  const handleJoinSession = (code: string) => {
    setSessionCode(code);
    setSessionState('connecting');
  };

  const handleConnected = (pc: RTCPeerConnection, dc: RTCDataChannel) => {
    setPeerConnection(pc);
    setDataChannel(dc);
    setSessionState('connected');
  };

  const handleDisconnect = () => {
    if (dataChannel) {
      dataChannel.close();
    }
    if (peerConnection) {
      peerConnection.close();
    }
    setSessionState('idle');
    setRole(null);
    setSessionCode('');
    setPeerConnection(null);
    setDataChannel(null);
    queryClient.clear();
  };

  const handleTransferring = () => {
    setSessionState('transferring');
  };

  const handleTransferComplete = () => {
    setSessionState('completed');
  };

  const handleError = (error: string) => {
    console.error('Session error:', error);
    setSessionState('failed');
  };

  useEffect(() => {
    return () => {
      if (dataChannel) dataChannel.close();
      if (peerConnection) peerConnection.close();
    };
  }, [dataChannel, peerConnection]);

  return (
    <div className="min-h-screen bg-background">
      {sessionState === 'idle' && (
        <LandingScreen
          onStartAsSender={handleStartAsSender}
          onStartAsReceiver={handleStartAsReceiver}
        />
      )}

      {(sessionState === 'creating' || sessionState === 'waiting') && role === 'sender' && (
        <SenderSessionScreen
          sessionState={sessionState}
          onSessionCreated={handleSessionCreated}
          onConnected={handleConnected}
          onDisconnect={handleDisconnect}
          onError={handleError}
          sessionCode={sessionCode}
        />
      )}

      {(sessionState === 'joining' || sessionState === 'connecting') && role === 'receiver' && (
        <ReceiverJoinScreen
          sessionState={sessionState}
          onJoinSession={handleJoinSession}
          onConnected={handleConnected}
          onDisconnect={handleDisconnect}
          onError={handleError}
          sessionCode={sessionCode}
        />
      )}

      {(sessionState === 'connected' || sessionState === 'transferring' || sessionState === 'completed') && (
        <ConnectedSessionScreen
          role={role!}
          sessionCode={sessionCode}
          dataChannel={dataChannel}
          onDisconnect={handleDisconnect}
          onTransferring={handleTransferring}
          onTransferComplete={handleTransferComplete}
          sessionState={sessionState}
        />
      )}

      {sessionState === 'failed' && (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md space-y-4 text-center">
            <div className="text-destructive text-lg font-semibold">Connection Failed</div>
            <p className="text-muted-foreground">
              Unable to establish connection. Please try again.
            </p>
            <button
              onClick={handleDisconnect}
              className="mt-4 rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
