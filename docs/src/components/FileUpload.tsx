import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Music, Video, X } from "lucide-react";

interface FileUploadProps {
  id: string;
  label: string;
  accept: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  onFileReset: () => void;
  icon: "audio" | "video" | "document";
  fileTypes: string;
}

export function FileUpload({
  id,
  label,
  accept,
  file,
  onFileChange,
  onFileReset,
  icon,
  fileTypes
}: FileUploadProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFileChange(files[0]);
    }
  };

  const IconComponent = () => {
    switch (icon) {
      case "audio":
        return <Music className="mb-3 text-muted-foreground" />;
      case "video":
        return <Video className="mb-3 text-muted-foreground" />;
      case "document":
      default:
        return <FileText className="mb-3 text-muted-foreground" />;
    }
  };

  const FileIconComponent = () => {
    switch (icon) {
      case "audio":
        return <Music className="mr-2 text-muted-foreground h-5 w-5" />;
      case "video":
        return <Video className="mr-2 text-muted-foreground h-5 w-5" />;
      case "document":
      default:
        return <FileText className="mr-2 text-muted-foreground h-5 w-5" />;
    }
  };

  return (
    <div>
      <Label htmlFor={id} className="block text-sm font-medium mb-1">
        {label}
      </Label>
      <div className="mt-1 flex items-center">
        {!file ? (
          <label 
            htmlFor={id} 
            className="flex-1 flex flex-col items-center px-4 py-6 border-2 border-dashed border-border rounded-md cursor-pointer hover:bg-secondary transition-colors"
          >
            <div className="flex flex-col items-center">
              <IconComponent />
              <div className="text-sm text-center">
                <span className="font-medium text-primary">Click to upload</span>
                <p className="text-xs text-muted-foreground mt-1">{fileTypes}</p>
              </div>
            </div>
            <Input 
              id={id}
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        ) : (
          <div className="mt-3 flex items-center py-2 px-3 rounded-md bg-secondary w-full">
            <FileIconComponent />
            <span className="text-sm font-medium">{file.name}</span>
            <button 
              className="ml-auto rounded-full p-1 hover:bg-background text-muted-foreground" 
              aria-label="Remove file"
              onClick={onFileReset}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
