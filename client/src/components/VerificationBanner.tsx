import { AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerificationBannerProps {
  hasExtractedData: boolean;
  className?: string;
}

export function VerificationBanner({ hasExtractedData, className }: VerificationBannerProps) {
  if (!hasExtractedData) return null;

  return (
    <div className={cn(
      "bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6",
      className
    )}>
      <div className="flex items-start gap-3">
        <FileText className="text-blue-600 mt-0.5" size={20} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-blue-800">
              Travel Document Processed
            </h3>
            <CheckCircle className="text-green-600" size={16} />
          </div>
          <p className="text-sm text-blue-700 mb-3">
            We've extracted your travel details from your document. Please verify all information below is correct before proceeding.
          </p>
          <div className="flex items-center gap-4 text-xs text-blue-600">
            <div className="flex items-center gap-1">
              <CheckCircle size={12} className="text-green-600" />
              <span>High confidence</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle size={12} className="text-yellow-600" />
              <span>Please verify</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 border border-gray-300 rounded bg-white inline-block"></span>
              <span>Manual entry</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}