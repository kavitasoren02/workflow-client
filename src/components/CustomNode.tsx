import { Handle, Position } from "reactflow";
import { Database, MessageSquare, Brain, Monitor } from "lucide-react";

const iconMap = {
  "user-query": MessageSquare,
  "knowledge-base": Database,
  "llm-engine": Brain,
  output: Monitor,
};

const colorMap = {
  "user-query": "bg-blue-50 border-blue-200 text-blue-800",
  "knowledge-base": "bg-green-50 border-green-200 text-green-800",
  "llm-engine": "bg-purple-50 border-purple-200 text-purple-800",
  output: "bg-orange-50 border-orange-200 text-orange-800",
};

export default function CustomNode({ data }: { data: any }) {
  const Icon =
    iconMap[data.componentType as keyof typeof iconMap] || MessageSquare;
  const colorClass =
    colorMap[data.componentType as keyof typeof colorMap] ||
    "bg-gray-50 border-gray-200 text-gray-800";

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg border-2 min-w-[150px] ${colorClass}`}
    >
      {data.componentType !== "user-query" && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-gray-400 border-2 border-white"
        />
      )}

      <div className="flex items-center gap-2">
        <Icon size={18} />
        <div className="font-medium">{data.label}</div>
      </div>

      {data.componentType !== "output" && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-gray-400 border-2 border-white"
        />
      )}
    </div>
  );
}
