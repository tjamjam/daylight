import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ToolHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export default function ToolHeader({ title, description, icon: Icon }: ToolHeaderProps) {
  return (
    <div className="mb-8">
      <Link
        to="/"
        className="inline-flex items-center text-amber-500 hover:text-amber-400 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to home
      </Link>
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-amber-500/10 rounded-lg">
          <Icon className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-4xl font-bold text-white">{title}</h1>
      </div>
      <p className="text-xl text-zinc-400">{description}</p>
    </div>
  );
}
