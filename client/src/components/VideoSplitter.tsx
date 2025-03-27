import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileUpload } from "@/components/FileUpload";
import { SegmentList } from "@/components/SegmentList";
import { ErrorAlert } from "@/components/ErrorAlert";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

type Segment = {
  url: string;
  fileName: string;
  startTime: number;
  endTime: number;
};

export function VideoSplitter() {
  const [soundFile, setSoundFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [ffmpeg] = useState(() => new FFmpeg());
  const [loaded, setLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isErrorVisible, setIsErrorVisible] = useState(false);

  useEffect(() => {
    // Use a specific version of FFmpeg that we know works
    const load = async () => {
      try {
        console.log('Starting FFmpeg loading...');
        
        // Configure progress event handler
        ffmpeg.on('progress', ({ progress }) => {
          setProgress(Math.round(progress * 100));
        });
        
        // Load the FFmpeg instance
        await ffmpeg.load({
          corePath: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js",
          wasmPath: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.wasm",
        });
        
        console.log('FFmpeg loaded successfully');
        setLoaded(true);
      } catch (error) {
        console.error('Failed to load FFmpeg:', error);
        setErrorMessage('Failed to load video processing library. Please refresh the page and try again.');
        setIsErrorVisible(true);
      }
    };
    
    load();
  }, []);

  const resetSoundFile = () => {
    setSoundFile(null);
  };

  const resetVideoFile = () => {
    setVideoFile(null);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const splitVideo = async () => {
    if (!soundFile || !videoFile) {
      setErrorMessage('Please upload both sound and video files');
      setIsErrorVisible(true);
      return;
    }

    if (!loaded) {
      setErrorMessage('Video processing library is not loaded yet. Please wait or refresh the page.');
      setIsErrorVisible(true);
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(0);
      setSegments([]);

      // Write files to FFmpeg file system
      await ffmpeg.writeFile(soundFile.name, await fetchFile(soundFile));
      await ffmpeg.writeFile(videoFile.name, await fetchFile(videoFile));

      // For now, we'll use a simple approach to get video duration
      // In a production app, we would use the actual duration from the video metadata
      // Since this is a demo, we'll use a fixed duration of 5 minutes
      console.log('Getting video info for', videoFile.name);
      
      // Use createObjectURL to get the video element duration
      const videoObjectUrl = URL.createObjectURL(videoFile);
      const videoElement = document.createElement('video');
      videoElement.src = videoObjectUrl;
      
      // Get the duration when the metadata is loaded
      const totalSeconds = await new Promise<number>((resolve) => {
        videoElement.addEventListener('loadedmetadata', () => {
          const duration = videoElement.duration;
          // Clean up
          URL.revokeObjectURL(videoObjectUrl);
          resolve(duration);
        });
        
        // Handle errors
        videoElement.addEventListener('error', () => {
          console.error('Error loading video metadata');
          URL.revokeObjectURL(videoObjectUrl);
          // Default to 5 minutes if we can't get the duration
          resolve(300);
        });
      });
      
      // Split video into 1-minute segments
      const segmentDuration = 60; // 1 minute in seconds
      const segmentsCount = Math.ceil(totalSeconds / segmentDuration);
      
      for (let i = 0; i < segmentsCount; i++) {
        const startTime = i * segmentDuration;
        const endTime = Math.min(startTime + segmentDuration, totalSeconds);
        const outputFileName = `segment_${i + 1}.mp4`;
        
        try {
          // Run FFmpeg command to create the segment with the new audio
          await ffmpeg.exec([
            '-i', videoFile.name,
            '-i', soundFile.name,
            '-map', '0:v',  // Take video from the first input
            '-map', '1:a',  // Take audio from the second input
            '-ss', startTime.toString(),
            '-to', endTime.toString(),
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-b:a', '128k',
            '-shortest',
            outputFileName
          ]);
          
          // Read the created file and create an object URL
          const data = await ffmpeg.readFile(outputFileName);
          const blob = new Blob([data], { type: 'video/mp4' });
          const url = URL.createObjectURL(blob);
          
          // Update segments state incrementally
          setSegments(prev => [...prev, {
            url,
            fileName: outputFileName,
            startTime,
            endTime
          }]);
          
        } catch (error) {
          console.error(`Error processing segment ${i + 1}:`, error);
          throw new Error(`Failed to process segment ${i + 1}`);
        }
      }
      
      setProgress(100);
    } catch (error) {
      console.error('Error in split video process:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
      setIsErrorVisible(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-3xl mx-auto mt-2 bg-card rounded-lg border shadow-sm">
        <CardHeader>
          <CardTitle>Video Splitter</CardTitle>
          <CardDescription>Upload a sound file and a video file to split the video into segments.</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!loaded ? (
            <div className="py-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <svg className="animate-spin -ml-1 h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-1">Loading Video Processing Engine</h3>
              <p className="text-sm text-muted-foreground mb-2">Please wait while we initialize the video processing library</p>
              <p className="text-xs text-muted-foreground">This may take a few seconds on the first load</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <FileUpload
                  id="sound-file"
                  label="Sound File"
                  accept="audio/*"
                  file={soundFile}
                  onFileChange={setSoundFile}
                  onFileReset={resetSoundFile}
                  icon="audio"
                  fileTypes="MP3, WAV, or AAC"
                />
                
                <FileUpload
                  id="video-file"
                  label="Video File"
                  accept="video/*"
                  file={videoFile}
                  onFileChange={setVideoFile}
                  onFileReset={resetVideoFile}
                  icon="video"
                  fileTypes="MP4, MOV, or AVI"
                />
              </div>
              
              {isProcessing && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Processing</label>
                      <span className="text-sm text-muted-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 w-full" />
                  </div>
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing video segments. This may take several minutes.
                  </div>
                </div>
              )}
              
              {segments.length > 0 ? (
                <SegmentList segments={segments} formatTime={formatTime} />
              ) : !isProcessing && (
                <div className="py-8 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-muted-foreground">
                    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                    <path d="M12 12v.01"></path>
                    <path d="M16 12v.01"></path>
                    <path d="M8 12v.01"></path>
                    <path d="M2 10h20"></path>
                  </svg>
                  <h3 className="text-lg font-medium mb-1">No segments processed yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Upload your files and click the button below to start processing</p>
                </div>
              )}
            </>
          )}
        </CardContent>
        
        <CardFooter className="px-6 py-4 border-t flex flex-col sm:flex-row items-center gap-3">
          <Button 
            className="w-full sm:w-auto"
            onClick={splitVideo}
            disabled={isProcessing || !loaded || (!soundFile && !videoFile)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <rect x="2" y="2" width="8" height="8" rx="2"></rect>
              <rect x="14" y="2" width="8" height="8" rx="2"></rect>
              <rect x="2" y="14" width="8" height="8" rx="2"></rect>
              <rect x="14" y="14" width="8" height="8" rx="2"></rect>
            </svg>
            Split Video
          </Button>
          <span className="text-sm text-muted-foreground">
            Video will be split into 1-minute segments
          </span>
        </CardFooter>
      </Card>
      
      <ErrorAlert 
        isOpen={isErrorVisible} 
        onClose={() => setIsErrorVisible(false)} 
        message={errorMessage || 'An error occurred'}
      />
    </>
  );
}
