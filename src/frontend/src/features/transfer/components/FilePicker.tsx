import { useRef, useEffect } from 'react';
import { Upload, File, X } from 'lucide-react';
import { useAndroidFilePickerPermissions } from '../hooks/useAndroidFilePickerPermissions';
import FilePermissionPromptCard from './FilePermissionPromptCard';

interface FilePickerProps {
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  onStartTransfer: () => void;
}

export default function FilePicker({
  onFilesSelected,
  selectedFiles,
  onStartTransfer,
}: FilePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    permissionState,
    needsPermission,
    checkPermission,
    requestPermission,
    openSettings,
    reset,
  } = useAndroidFilePickerPermissions();

  // Check permission on mount if needed
  useEffect(() => {
    if (needsPermission) {
      checkPermission();
    }
  }, [needsPermission, checkPermission]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected([...selectedFiles, ...filesArray]);
    }
    // Reset permission state after successful file selection
    reset();
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    onFilesSelected(newFiles);
  };

  const handleClickToSelect = async () => {
    // Non-Android or already granted: open picker immediately
    if (!needsPermission || permissionState.flowState === 'granted') {
      fileInputRef.current?.click();
      return;
    }

    // Check permission status first
    if (permissionState.flowState === 'idle') {
      await checkPermission();
    }
  };

  const handleContinuePermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      // Permission granted, open file picker
      fileInputRef.current?.click();
    }
  };

  const handleNotNow = () => {
    reset();
  };

  const handleTryAgain = async () => {
    await checkPermission();
  };

  const handleOpenSettings = async () => {
    await openSettings();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const isPickerDisabled = 
    permissionState.flowState === 'checking' || 
    permissionState.flowState === 'requesting';

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold">Select Files to Send</h2>
        <p className="text-sm text-muted-foreground">
          Choose one or more files to transfer
        </p>
      </div>

      {/* Permission flow UI */}
      {needsPermission && permissionState.flowState === 'checking' && (
        <FilePermissionPromptCard
          state="checking"
          title="Checking permissions..."
          body=""
        />
      )}

      {needsPermission && permissionState.flowState === 'needs-rationale' && (
        <FilePermissionPromptCard
          state="rationale"
          title={permissionState.copy.rationaleTitle}
          body={permissionState.copy.rationaleBody}
          onContinue={handleContinuePermission}
          onNotNow={handleNotNow}
        />
      )}

      {needsPermission && permissionState.flowState === 'denied' && (
        <FilePermissionPromptCard
          state="denied"
          title={permissionState.copy.deniedTitle}
          body={permissionState.copy.deniedBody}
          settingsInstructions={permissionState.copy.settingsInstructions}
          onTryAgain={handleTryAgain}
          onOpenSettings={handleOpenSettings}
          canOpenSettings={permissionState.canOpenSettings}
        />
      )}

      <div
        onClick={handleClickToSelect}
        className={`border-2 border-dashed border-border rounded-2xl p-12 text-center transition-all ${
          isPickerDisabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:border-primary hover:bg-accent/50'
        }`}
      >
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm font-medium mb-1">
          {isPickerDisabled ? 'Please wait...' : 'Click to select files'}
        </p>
        <p className="text-xs text-muted-foreground">or drag and drop</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          disabled={isPickerDisabled}
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              Selected Files ({selectedFiles.length})
            </h3>
            <button
              onClick={() => onFilesSelected([])}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-card border border-border rounded-lg p-3"
              >
                <File className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={onStartTransfer}
            className="w-full rounded-xl bg-primary px-6 py-4 text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
            Send {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'}
          </button>
        </div>
      )}
    </div>
  );
}
