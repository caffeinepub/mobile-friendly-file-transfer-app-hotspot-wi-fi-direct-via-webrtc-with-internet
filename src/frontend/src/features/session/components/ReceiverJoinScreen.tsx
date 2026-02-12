import { useState, useEffect } from 'react';
import { QrCode, Keyboard, Loader2, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import BrandHeader from './BrandHeader';
import SessionStatusHeader from './SessionStatusHeader';
import ErrorBanner from './ErrorBanner';
import { formatSessionCode, validateSessionCode, parseQRPayload } from '../utils/joinCode';
import { usePeerConnection } from '../../webrtc/hooks/usePeerConnection';
import { SessionState } from '../state/sessionMachine';
import { useQRScanner } from '../../../qr-code/useQRScanner';

interface ReceiverJoinScreenProps {
  sessionState: SessionState;
  onJoinSession: (code: string) => void;
  onConnected: (pc: RTCPeerConnection, dc: RTCDataChannel) => void;
  onDisconnect: () => void;
  onError: (error: string) => void;
  sessionCode: string;
}

export default function ReceiverJoinScreen({
  sessionState,
  onJoinSession,
  onConnected,
  onDisconnect,
  onError,
  sessionCode: existingCode,
}: ReceiverJoinScreenProps) {
  const [inputMode, setInputMode] = useState<'manual' | 'scan'>('manual');
  const [manualCode, setManualCode] = useState('');
  const [sessionCode, setSessionCode] = useState(existingCode);

  const { createAnswer, peerConnection, dataChannel, connectionState, error } = usePeerConnection(
    sessionCode,
    'receiver'
  );

  const {
    qrResults,
    isScanning,
    isActive,
    isSupported,
    error: cameraError,
    isLoading: cameraLoading,
    canStartScanning,
    startScanning,
    stopScanning,
    videoRef,
    canvasRef,
  } = useQRScanner({
    facingMode: 'environment',
    scanInterval: 100,
    maxResults: 1,
  });

  useEffect(() => {
    if (qrResults.length > 0) {
      const latestResult = qrResults[0];
      const code = parseQRPayload(latestResult.data);
      if (code && validateSessionCode(code)) {
        stopScanning();
        setSessionCode(code);
        onJoinSession(code);
        createAnswer();
        toast.success('QR code scanned successfully');
      } else {
        toast.error('Invalid QR code');
      }
    }
  }, [qrResults, onJoinSession, createAnswer, stopScanning]);

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

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = formatSessionCode(manualCode);
    if (!validateSessionCode(formatted)) {
      toast.error('Please enter a valid session code');
      return;
    }
    setSessionCode(formatted);
    onJoinSession(formatted);
    createAnswer();
  };

  const handleStartScanning = async () => {
    setInputMode('scan');
    const success = await startScanning();
    if (!success) {
      toast.error('Failed to start camera. Please check camera permissions in your device settings.');
    }
  };

  const handleStopScanning = async () => {
    await stopScanning();
    setInputMode('manual');
  };

  if (sessionState === 'connecting') {
    return (
      <div className="flex min-h-screen flex-col">
        <BrandHeader />
        <SessionStatusHeader
          sessionCode={sessionCode}
          connectionState={connectionState}
          onDisconnect={onDisconnect}
        />
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <h2 className="text-xl font-semibold">Connecting...</h2>
            <p className="text-muted-foreground">Establishing secure connection</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <BrandHeader />

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Join Session</h2>
            <p className="text-muted-foreground">
              Enter the code or scan QR from sender
            </p>
          </div>

          {cameraError && inputMode === 'scan' && (
            <ErrorBanner
              message={
                cameraError.type === 'permission'
                  ? 'Camera permission denied. Please enable camera access in your device settings to scan QR codes.'
                  : cameraError.message
              }
              onRetry={cameraError.type === 'permission' ? undefined : handleStartScanning}
              onDismiss={handleStopScanning}
            />
          )}

          {inputMode === 'manual' ? (
            <div className="space-y-4">
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium mb-2">
                    Session Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="w-full rounded-lg border-2 border-input bg-background px-4 py-4 text-center text-2xl font-bold tracking-wider focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    maxLength={8}
                    autoComplete="off"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-all active:scale-[0.98]"
                >
                  <Keyboard className="h-5 w-5" />
                  Join Session
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <button
                onClick={handleStartScanning}
                disabled={isSupported === false}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-4 text-accent-foreground font-semibold text-lg hover:bg-accent/90 transition-all border-2 border-border active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <QrCode className="h-5 w-5" />
                Scan QR Code
              </button>

              {isSupported === false && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">
                    Camera not supported on this device. Please enter the session code manually.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-card border-2 border-border rounded-2xl overflow-hidden" style={{ minHeight: '300px', aspectRatio: '1/1' }}>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                  autoPlay
                />
                <canvas ref={canvasRef} className="hidden" />

                {!isActive && cameraLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                    <div className="text-center space-y-3">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                      <p className="text-sm text-muted-foreground">Starting camera...</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleStopScanning}
                  className="absolute top-4 right-4 rounded-full bg-background/80 p-2 hover:bg-background transition-colors"
                  aria-label="Close camera"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                {isScanning ? 'Scanning for QR code...' : 'Position QR code in frame'}
              </div>

              <button
                onClick={handleStopScanning}
                className="w-full rounded-xl bg-accent px-6 py-3 text-accent-foreground font-medium hover:bg-accent/90 transition-all border-2 border-border"
              >
                Enter Code Manually
              </button>
            </div>
          )}

          <button
            onClick={onDisconnect}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </main>
    </div>
  );
}
