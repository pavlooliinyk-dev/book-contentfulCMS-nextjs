'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { QuizResultData } from '@/lib/qr-code-utils';
import { useRef } from 'react';

interface QRCodeGeneratorProps {
  resultData: QuizResultData;
}

export default function QRCodeGenerator({
  resultData,
}: QRCodeGeneratorProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `quiz-result-${resultData.timestamp}.png`;
      link.href = url;
      link.click();
    }
  };

  const qrValue = JSON.stringify(resultData);

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Share Your Result
      </h3>

      {/* QR Code */}
      <div
        ref={qrRef}
        className="bg-white p-4 rounded-lg shadow-lg mb-6"
      >
        <QRCodeCanvas
          value={qrValue}
          size={256}
          level="H"
          includeMargin={true}
          fgColor="#000000"
          bgColor="#ffffff"
        />
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors mb-4"
      >
        📥 Download QR Code
      </button>

      {/* Info */}
      <p className="text-center text-sm text-gray-600">
        Scan this QR code to share your quiz result. It contains:
        <br />
        Your score 100,
        answers, and timestamp.
      </p>
    </div>
  );
}
