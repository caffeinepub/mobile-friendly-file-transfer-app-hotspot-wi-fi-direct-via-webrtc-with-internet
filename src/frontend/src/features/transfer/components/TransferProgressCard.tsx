import { useEffect } from 'react';
import { Loader2, X, Download, Upload } from 'lucide-react';

interface TransferProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  isComplete: boolean;
}

interface TransferProgressCardProps {
  progress: TransferProgress;
  currentFile: string;
  role: 'sender' | 'receiver';
  onCancel: () => void;
  onComplete: () => void;
}

export default function TransferProgressCard({
  progress,
  currentFile,
  role,
  onCancel,
  onComplete,
}: TransferProgressCardProps) {
  useEffect(() => {
    if (progress.isComplete) {
      onComplete();
    }
  }, [progress.isComplete, onComplete]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="bg-card border-2 border-border rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {role === 'sender' ? (
            <Upload className="h-6 w-6 text-primary" />
          ) : (
            <Download className="h-6 w-6 text-primary" />
          )}
          <div>
            <h3 className="text-lg font-bold">
              {role === 'sender' ? 'Sending Files' : 'Receiving Files'}
            </h3>
            <p className="text-sm text-muted-foreground">{currentFile}</p>
          </div>
        </div>
        {!progress.isComplete && (
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{Math.round(progress.percentage)}%</span>
        </div>
        <div className="h-3 bg-accent rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatFileSize(progress.bytesTransferred)}</span>
          <span>{formatFileSize(progress.totalBytes)}</span>
        </div>
      </div>

      {!progress.isComplete && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Transferring...</span>
        </div>
      )}
    </div>
  );
}
