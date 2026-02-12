import { File, AlertCircle } from 'lucide-react';

interface IncomingFile {
  name: string;
  size: number;
  type: string;
}

interface IncomingTransferPromptProps {
  files: IncomingFile[];
  onAccept: () => void;
  onDecline: () => void;
}

export default function IncomingTransferPrompt({
  files,
  onAccept,
  onDecline,
}: IncomingTransferPromptProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className="bg-card border-2 border-border rounded-2xl p-6 space-y-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-lg font-bold mb-1">Incoming Files</h3>
          <p className="text-sm text-muted-foreground">
            The sender wants to transfer {files.length} {files.length === 1 ? 'file' : 'files'} ({formatFileSize(totalSize)})
          </p>
        </div>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {files.map((file, index) => (
          <div
            key={index}
            className="flex items-center gap-3 bg-accent/50 rounded-lg p-3"
          >
            <File className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onDecline}
          className="flex-1 rounded-xl bg-accent px-6 py-3 text-accent-foreground font-medium hover:bg-accent/90 transition-all border-2 border-border"
        >
          Decline
        </button>
        <button
          onClick={onAccept}
          className="flex-1 rounded-xl bg-primary px-6 py-3 text-primary-foreground font-medium hover:bg-primary/90 transition-all"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
