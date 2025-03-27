export function Footer() {
  return (
    <footer className="bg-background border-t py-6 mt-8">
      <div className="container mx-auto px-4">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="mt-4 sm:mt-0 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Video Splitter App. All rights reserved.</p>
          </div>
          <div className="flex justify-center mt-4 space-x-6 sm:mt-0">
            <span className="text-sm text-muted-foreground">Powered by FFmpeg</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
