import { Button } from "@/components/ui/button";
import { Download, Video } from "lucide-react";

interface Segment {
  url: string;
  fileName: string;
  startTime: number;
  endTime: number;
}

interface SegmentListProps {
  segments: Segment[];
  formatTime: (seconds: number) => string;
}

export function SegmentList({ segments, formatTime }: SegmentListProps) {
  const handleDownload = (url: string, fileName: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-4">
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium mb-3">Processed Segments</h4>
        <div className="space-y-2">
          {segments.map((segment, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between py-3 px-4 rounded-md bg-secondary"
            >
              <div className="flex items-center">
                <Video className="mr-2 text-primary h-4 w-4" />
                <div>
                  <div className="text-sm font-medium">Segment {index + 1}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => handleDownload(segment.url, segment.fileName)}
                className="inline-flex items-center justify-center"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
