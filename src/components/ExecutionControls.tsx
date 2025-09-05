import { MessageCircle, Settings } from "lucide-react";

interface ExecutionControlsProps {
  onBuildStack: () => void;
  onChatWithStack: () => void;
  hasNodes: boolean;
}

export default function ExecutionControls({
  onBuildStack,
  onChatWithStack,
  hasNodes,
}: ExecutionControlsProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onBuildStack}
        disabled={!hasNodes}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:text-gray-700 disabled:cursor-not-allowed transition-colors"
      >
        <Settings size={18} />
        Build Stack
      </button>

      <button
        onClick={onChatWithStack}
        disabled={!hasNodes}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:text-gray-700 disabled:cursor-not-allowed transition-colors"
      >
        <MessageCircle size={18} />
        Chat with Stack
      </button>
    </div>
  );
}
