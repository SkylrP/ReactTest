import { AlertCircle, X } from "lucide-react";

interface ErrorAlertProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export function ErrorAlert({ isOpen, onClose, message }: ErrorAlertProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="mb-4 flex items-center">
          <div className="bg-destructive/10 p-2 rounded-full mr-3">
            <AlertCircle className="text-destructive h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium">Processing Error</h3>
        </div>
        <div className="mb-4">
          <p className="text-muted-foreground">{message}</p>
        </div>
        <div className="flex justify-end">
          <button 
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
