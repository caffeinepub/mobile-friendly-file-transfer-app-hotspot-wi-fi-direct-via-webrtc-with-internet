import { useEffect, useState } from 'react';
import { Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import BrandHeader from './BrandHeader';
import SessionStatusHeader from './SessionStatusHeader';
import QRCodePanel from './QRCodePanel';
import { generateSessionCode } from '../utils/joinCode';
import { usePeerConnection } from '../../webrtc/hooks/usePeerConnection';
import { SessionState } from '../state/sessionMachine';

interface SenderSessionScreenProps {
  sessionState: SessionState;
  onSessionCreated: (code: string) => void;
  onConnected: (pc: RTCPeerConnection, dc: RTCDataChannel) => void;
  onDisconnect: () => void;
  onError: (error: string) => void;
  sessionCode: string;
}

export default function SenderSessionScreen({
  sessionState,
  onSessionCreated,
  onConnected,
  onDisconnect,
  onError,
  sessionCode: existingCode,
}: SenderSessionScreenProps) {
  const [sessionCode, setSessionCode] = useState(existingCode);
  const [copied, setCopied] = useState(false);

  const { createOffer, peerConnection, dataChannel, connectionState, error } = usePeerConnection(
    sessionCode,
    'sender'
  );

  useEffect(() => {
    if (sessionState === 'creating' && !sessionCode) {
      const code = generateSessionCode();
      setSessionCode(code);
      onSessionCreated(code);
      createOffer();
    }
  }, [sessionState, sessionCode, onSessionCreated, createOffer]);

  useEffect(() => {
    if (connectionState === 'connected' && peerConnection && dataChannel) {
      onConnected(peerConnection, dataChannel);
    }
  }, [connectionState, peerConnection, dataChannel, onConnected]);

  useEffect(() => {
    if (error) {
      onError(error);
      toast.error(error);
    }
  }, [error, onError]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(sessionCode);
      setCopied(true);
      toast.success('Code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <BrandHeader />
      <SessionStatusHeader
        sessionCode={sessionCode}
        connectionState={connectionState}
        onDisconnect={onDisconnect}
      />

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Share This Code</h2>
            <p className="text-muted-foreground">
              Ask the receiver to enter this code or scan the QR code
            </p>
          </div>

          {/* Session Code Display */}
          <div className="bg-card border-2 border-border rounded-2xl p-8 space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold tracking-wider text-primary mb-4">
                {sessionCode}
              </div>
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Code
                  </>
                )}
              </button>
            </div>

            <div className="border-t border-border pt-6">
              <QRCodePanel sessionCode={sessionCode} />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Waiting for receiver to join...</span>
          </div>
        </div>
      </main>
    </div>
  );
}
