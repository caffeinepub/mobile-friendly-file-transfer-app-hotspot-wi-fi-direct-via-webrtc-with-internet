import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface SessionStatusHeaderProps {
  sessionCode: string;
  connectionState: string;
  onDisconnect: () => void;
}

export default function SessionStatusHeader({
  sessionCode,
  connectionState,
  onDisconnect,
}: SessionStatusHeaderProps) {
  const getStatusIcon = () => {
    switch (connectionState) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'connecting':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case 'disconnected':
      case 'failed':
        return <WifiOff className="h-4 w-4 text-destructive" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (connectionState) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'failed':
        return 'Failed';
      default:
        return 'Initializing...';
    }
  };

  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div className="text-sm">
            <div className="font-medium">{getStatusText()}</div>
            <div className="text-xs text-muted-foreground">Code: {sessionCode}</div>
          </div>
        </div>
        <button
          onClick={onDisconnect}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
