import { useEffect, useRef } from 'react';
import { createQRPayload } from '../utils/joinCode';
import { generateQRCode } from '../utils/qrCodeGenerator';

interface QRCodePanelProps {
  sessionCode: string;
}

export default function QRCodePanel({ sessionCode }: QRCodePanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && sessionCode) {
      const payload = createQRPayload(sessionCode);
      try {
        generateQRCode(canvasRef.current, payload);
      } catch (error) {
        console.error('QR generation error:', error);
      }
    }
  }, [sessionCode]);

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="bg-white p-4 rounded-lg">
        <canvas ref={canvasRef} width="200" height="200" />
      </div>
      <p className="text-xs text-muted-foreground">Scan with receiver device</p>
    </div>
  );
}
