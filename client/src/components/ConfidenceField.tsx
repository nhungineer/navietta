import { Input } from '@/components/ui/input';
import { CheckCircle, AlertTriangle, Edit3 } from 'lucide-react';
import { ExtractedField } from '@shared/schema';
import { cn } from '@/lib/utils';

interface ConfidenceFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  extractedField?: ExtractedField;
  placeholder?: string;
  type?: string;
  className?: string;
  'data-testid'?: string;
}

export function ConfidenceField({
  label,
  value,
  onChange,
  extractedField,
  placeholder,
  type = "text",
  className,
  'data-testid': testId,
}: ConfidenceFieldProps) {
  const isExtracted = extractedField?.source === 'extracted';
  const confidence = extractedField?.confidence || 0;
  
  // Determine confidence level styling
  const getConfidenceStyle = () => {
    if (!isExtracted) return '';
    
    if (confidence >= 70) {
      return 'border-green-300 bg-green-50 focus:border-green-500';
    } else if (confidence >= 50) {
      return 'border-yellow-300 bg-yellow-50 focus:border-yellow-500';
    }
    return '';
  };

  const getConfidenceIcon = () => {
    if (!isExtracted) return null;
    
    if (confidence >= 70) {
      return <CheckCircle className="text-green-600" size={16} />;
    } else if (confidence >= 50) {
      return <AlertTriangle className="text-yellow-600" size={16} />;
    }
    return null;
  };

  const getConfidenceMessage = () => {
    if (!isExtracted) return null;
    
    if (confidence >= 70) {
      return "High confidence extraction";
    } else if (confidence >= 50) {
      return "Please verify this information";
    }
    return null;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        {label}
        {isExtracted && (
          <div className="flex items-center gap-1">
            {getConfidenceIcon()}
            <span className="text-xs text-gray-500">
              {confidence >= 70 ? 'AI-extracted' : 'AI-extracted (verify)'}
            </span>
          </div>
        )}
      </label>
      
      <div className="relative">
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            isExtracted && confidence < 50 
              ? "Please enter manually" 
              : placeholder
          }
          className={cn(
            "w-full",
            getConfidenceStyle(),
            isExtracted && "pr-10"
          )}
          data-testid={testId}
        />
        
        {isExtracted && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Edit3 className="text-gray-400" size={14} />
          </div>
        )}
      </div>
      
      {getConfidenceMessage() && (
        <p className={cn(
          "text-xs",
          confidence >= 70 ? "text-green-600" : "text-yellow-600"
        )}>
          {getConfidenceMessage()}
        </p>
      )}
    </div>
  );
}