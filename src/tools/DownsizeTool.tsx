import { ImageDown } from 'lucide-react';
import ToolHeader from '../components/ToolHeader';
import DownsizePanel from '../components/DownsizePanel';

export default function DownsizeTool() {
  return (
    <div className="container mx-auto px-4 py-12">
      <ToolHeader
        title="Downsize Images"
        description="Resize and compress images instantly — drop files and they auto-download"
        icon={ImageDown}
      />
      <div className="max-w-5xl mx-auto">
        <DownsizePanel />
      </div>
    </div>
  );
}
