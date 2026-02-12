import { useState } from 'react';
import BrandHeader from './BrandHeader';
import SessionStatusHeader from './SessionStatusHeader';
import FilePicker from '../../transfer/components/FilePicker';
import IncomingTransferPrompt from '../../transfer/components/IncomingTransferPrompt';
import TransferProgressCard from '../../transfer/components/TransferProgressCard';
import { useWebRTCDataChannelTransfer } from '../../transfer/hooks/useWebRTCDataChannelTransfer';
import { SessionState } from '../state/sessionMachine';
import { CheckCircle2 } from 'lucide-react';

interface ConnectedSessionScreenProps {
  role: 'sender' | 'receiver';
  sessionCode: string;
  dataChannel: RTCDataChannel | null;
  onDisconnect: () => void;
  onTransferring: () => void;
  onTransferComplete: () => void;
  sessionState: SessionState;
}

export default function ConnectedSessionScreen({
  role,
  sessionCode,
  dataChannel,
  onDisconnect,
  onTransferring,
  onTransferComplete,
  sessionState,
}: ConnectedSessionScreenProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const {
    isTransferring,
    progress,
    currentFile,
    incomingFiles,
    sendFiles,
    acceptTransfer,
    declineTransfer,
    cancelTransfer,
  } = useWebRTCDataChannelTransfer(dataChannel, role);

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleStartTransfer = () => {
    if (selectedFiles.length > 0) {
      onTransferring();
      sendFiles(selectedFiles);
    }
  };

  const handleAcceptTransfer = () => {
    onTransferring();
    acceptTransfer();
  };

  const handleTransferComplete = () => {
    onTransferComplete();
  };

  if (sessionState === 'completed') {
    return (
      <div className="flex min-h-screen flex-col">
        <BrandHeader />
        <SessionStatusHeader
          sessionCode={sessionCode}
          connectionState="connected"
          onDisconnect={onDisconnect}
        />
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Transfer Complete!</h2>
            <p className="text-muted-foreground">
              {role === 'sender' ? 'Files sent successfully' : 'Files received successfully'}
            </p>
            <button
              onClick={onDisconnect}
              className="mt-6 rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Start New Transfer
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <BrandHeader />
      <SessionStatusHeader
        sessionCode={sessionCode}
        connectionState="connected"
        onDisconnect={onDisconnect}
      />

      <main className="flex-1 p-6">
        <div className="container mx-auto max-w-2xl space-y-6">
          {role === 'sender' && !isTransferring && (
            <FilePicker
              onFilesSelected={handleFilesSelected}
              selectedFiles={selectedFiles}
              onStartTransfer={handleStartTransfer}
            />
          )}

          {role === 'receiver' && incomingFiles.length > 0 && !isTransferring && (
            <IncomingTransferPrompt
              files={incomingFiles}
              onAccept={handleAcceptTransfer}
              onDecline={declineTransfer}
            />
          )}

          {isTransferring && (
            <TransferProgressCard
              progress={progress}
              currentFile={currentFile}
              role={role}
              onCancel={cancelTransfer}
              onComplete={handleTransferComplete}
            />
          )}

          {!isTransferring && role === 'receiver' && incomingFiles.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Waiting for sender to select files...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
