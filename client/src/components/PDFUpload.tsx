import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useTravelContext } from '@/contexts/TravelContext';
import { PDFExtraction } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface PDFUploadProps {
  onSuccess: (data: PDFExtraction) => void;
}

export function PDFUpload({ onSuccess }: PDFUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const { navigateToStep } = useTravelContext();
  const { toast } = useToast();

  const uploadFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a PDF file only.",
      });
      return;
    }

    if (file.size > 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload a PDF smaller than 1MB.",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/travel/extract-pdf', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.fallback) {
          toast({
            variant: "destructive",
            title: "PDF processing failed",
            description: result.message,
          });
          // Navigate to manual entry
          navigateToStep(2);
          return;
        }
        throw new Error(result.message || 'Upload failed');
      }

      if (result.success && result.extractedData) {
        toast({
          title: "Document processed successfully",
          description: "Travel details extracted. Please verify all information.",
        });
        onSuccess(result.extractedData);
        navigateToStep(2);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to process document",
      });
      // Navigate to manual entry as fallback
      navigateToStep(2);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-8 mb-6 bg-gray-50/50 transition-colors ${
        isDragOver ? 'border-primary bg-primary/5' : 'border-gray-300'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      data-testid="pdf-upload-zone"
    >
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-lg mb-3">
            {isUploading ? (
              <Loader2 className="text-white animate-spin" size={20} />
            ) : (
              <Upload className="text-white" size={20} />
            )}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          {isUploading ? (
            <>
              <FileText className="inline mr-1" size={16} />
              Processing your travel document...
            </>
          ) : (
            <>
              Upload or drag and drop your travel document<br />
              <span className="text-xs text-gray-500">(PDF only, max 1MB)</span>
            </>
          )}
        </p>

        {!isUploading && (
          <>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="pdf-upload"
              data-testid="input-pdf-upload"
            />
            <label 
              htmlFor="pdf-upload"
              className="inline-block w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors cursor-pointer"
              data-testid="button-select-pdf"
            >
              SELECT PDF FILE
            </label>
          </>
        )}

        <div className="mt-4 text-xs text-gray-500 flex items-center justify-center gap-2">
          <CheckCircle size={12} />
          <span>AI extracts your travel details automatically</span>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 flex items-center justify-center gap-2">
          <AlertCircle size={12} />
          <span>Personal information is protected and not stored</span>
        </div>
      </div>
    </div>
  );
}