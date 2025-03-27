import { Play } from "lucide-react";

export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Play className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold">Video Splitter</h1>
        </div>
        <nav>
          <button className="text-sm px-2 py-1 rounded-md hover:bg-secondary">Help</button>
        </nav>
      </div>
    </header>
  );
}
