import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { downloadFile } from '../utils/download';

interface IncomingFile {
  name: string;
  size: number;
  type: string;
}

interface TransferProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  isComplete: boolean;
}

const CHUNK_SIZE = 16384; // 16KB chunks

export function useWebRTCDataChannelTransfer(
  dataChannel: RTCDataChannel | null,
  role: 'sender' | 'receiver'
) {
  const [isTransferring, setIsTransferring] = useState(false);
  const [progress, setProgress] = useState<TransferProgress>({
    bytesTransferred: 0,
    totalBytes: 0,
    percentage: 0,
    isComplete: false,
  });
  const [currentFile, setCurrentFile] = useState('');
  const [incomingFiles, setIncomingFiles] = useState<IncomingFile[]>([]);

  const receivedChunksRef = useRef<Uint8Array[]>([]);
  const currentFileMetaRef = useRef<IncomingFile | null>(null);
  const receivedBytesRef = useRef(0);
  const totalBytesRef = useRef(0);

  const sendFiles = useCallback(
    async (files: File[]) => {
      if (!dataChannel || dataChannel.readyState !== 'open') {
        toast.error('Connection not ready');
        return;
      }

      setIsTransferring(true);
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      let transferredBytes = 0;

      try {
        // Send metadata first
        const metadata = {
          type: 'metadata',
          files: files.map((f) => ({
            name: f.name,
            size: f.size,
            type: f.type,
          })),
        };
        dataChannel.send(JSON.stringify(metadata));

        // Wait for acceptance
        await new Promise<void>((resolve, reject) => {
          const handleMessage = (event: MessageEvent) => {
            try {
              const msg = JSON.parse(event.data);
              if (msg.type === 'accept') {
                dataChannel.removeEventListener('message', handleMessage);
                resolve();
              } else if (msg.type === 'decline') {
                dataChannel.removeEventListener('message', handleMessage);
                reject(new Error('Transfer declined'));
              }
            } catch (e) {
              // Ignore non-JSON messages
            }
          };
          dataChannel.addEventListener('message', handleMessage);

          // Timeout after 30 seconds
          setTimeout(() => {
            dataChannel.removeEventListener('message', handleMessage);
            reject(new Error('Transfer acceptance timeout'));
          }, 30000);
        });

        // Send files
        for (const file of files) {
          setCurrentFile(file.name);

          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);

          // Send file start marker
          dataChannel.send(
            JSON.stringify({
              type: 'file-start',
              name: file.name,
              size: file.size,
              mimeType: file.type,
            })
          );

          // Send chunks with backpressure handling
          for (let offset = 0; offset < uint8Array.length; offset += CHUNK_SIZE) {
            // Wait if buffer is getting full
            while (dataChannel.bufferedAmount > CHUNK_SIZE * 4) {
              await new Promise((resolve) => setTimeout(resolve, 10));
            }

            const chunk = uint8Array.slice(offset, offset + CHUNK_SIZE);
            dataChannel.send(chunk);

            transferredBytes += chunk.length;
            setProgress({
              bytesTransferred: transferredBytes,
              totalBytes: totalSize,
              percentage: (transferredBytes / totalSize) * 100,
              isComplete: false,
            });
          }

          // Send file end marker
          dataChannel.send(JSON.stringify({ type: 'file-end' }));
        }

        // Send transfer complete
        dataChannel.send(JSON.stringify({ type: 'transfer-complete' }));

        setProgress((prev) => ({ ...prev, isComplete: true }));
        toast.success('Transfer complete!');
      } catch (error) {
        console.error('Transfer error:', error);
        toast.error(error instanceof Error ? error.message : 'Transfer failed');
        setIsTransferring(false);
      }
    },
    [dataChannel]
  );

  const acceptTransfer = useCallback(() => {
    if (!dataChannel || dataChannel.readyState !== 'open') {
      toast.error('Connection not ready');
      return;
    }

    dataChannel.send(JSON.stringify({ type: 'accept' }));
    setIsTransferring(true);
    setIncomingFiles([]);

    const totalSize = incomingFiles.reduce((sum, f) => sum + f.size, 0);
    totalBytesRef.current = totalSize;
    setProgress({
      bytesTransferred: 0,
      totalBytes: totalSize,
      percentage: 0,
      isComplete: false,
    });
  }, [dataChannel, incomingFiles]);

  const declineTransfer = useCallback(() => {
    if (!dataChannel || dataChannel.readyState !== 'open') return;
    dataChannel.send(JSON.stringify({ type: 'decline' }));
    setIncomingFiles([]);
    toast.info('Transfer declined');
  }, [dataChannel]);

  const cancelTransfer = useCallback(() => {
    if (!dataChannel || dataChannel.readyState !== 'open') return;
    dataChannel.send(JSON.stringify({ type: 'cancel' }));
    setIsTransferring(false);
    setProgress({
      bytesTransferred: 0,
      totalBytes: 0,
      percentage: 0,
      isComplete: false,
    });
    toast.info('Transfer cancelled');
  }, [dataChannel]);

  useEffect(() => {
    if (!dataChannel) return;

    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data === 'string') {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'metadata' && role === 'receiver') {
            setIncomingFiles(message.files);
          } else if (message.type === 'file-start') {
            currentFileMetaRef.current = {
              name: message.name,
              size: message.size,
              type: message.mimeType,
            };
            receivedChunksRef.current = [];
            setCurrentFile(message.name);
          } else if (message.type === 'file-end') {
            if (currentFileMetaRef.current) {
              // Convert Uint8Array[] to BlobPart[] by casting each element
              const blobParts: BlobPart[] = receivedChunksRef.current.map(
                (chunk) => chunk as BlobPart
              );
              const blob = new Blob(blobParts, {
                type: currentFileMetaRef.current.type,
              });
              downloadFile(blob, currentFileMetaRef.current.name);
              currentFileMetaRef.current = null;
              receivedChunksRef.current = [];
            }
          } else if (message.type === 'transfer-complete') {
            setProgress((prev) => ({ ...prev, isComplete: true }));
            toast.success('All files received!');
          } else if (message.type === 'cancel') {
            setIsTransferring(false);
            toast.info('Transfer cancelled by sender');
          }
        } catch (e) {
          // Not JSON, ignore
        }
      } else if (event.data instanceof ArrayBuffer) {
        const chunk = new Uint8Array(event.data);
        receivedChunksRef.current.push(chunk);
        receivedBytesRef.current += chunk.length;

        setProgress({
          bytesTransferred: receivedBytesRef.current,
          totalBytes: totalBytesRef.current,
          percentage: (receivedBytesRef.current / totalBytesRef.current) * 100,
          isComplete: false,
        });
      }
    };

    dataChannel.addEventListener('message', handleMessage);

    return () => {
      dataChannel.removeEventListener('message', handleMessage);
    };
  }, [dataChannel, role]);

  return {
    isTransferring,
    progress,
    currentFile,
    incomingFiles,
    sendFiles,
    acceptTransfer,
    declineTransfer,
    cancelTransfer,
  };
}
