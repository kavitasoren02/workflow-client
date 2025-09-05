import type React from "react";

import { Database, MessageSquare, Brain, Monitor } from "lucide-react";

const components = [
  {
    type: "user-query",
    label: "User Query",
    icon: MessageSquare,
    description: "Accepts user input and queries",
    color: "bg-blue-100 border-blue-300 text-blue-800",
  },
  {
    type: "knowledge-base",
    label: "Knowledge Base",
    icon: Database,
    description: "Processes documents and retrieves context",
    color: "bg-green-100 border-green-300 text-green-800",
  },
  {
    type: "llm-engine",
    label: "LLM Engine",
    icon: Brain,
    description: "Generates responses using AI models",
    color: "bg-purple-100 border-purple-300 text-purple-800",
  },
  {
    type: "output",
    label: "Output",
    icon: Monitor,
    description: "Displays final responses to users",
    color: "bg-orange-100 border-orange-300 text-orange-800",
  },
];

export default function ComponentLibrary() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="p-4 space-y-3">
      {components.map((component) => {
        const Icon = component.icon;
        return (
          <div
            key={component.type}
            className={`p-3 rounded-lg border-2 border-dashed cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${component.color}`}
            draggable
            onDragStart={(event) => onDragStart(event, component.type)}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon size={20} />
              <span className="font-medium">{component.label}</span>
            </div>
            <p className="text-sm opacity-80">{component.description}</p>
          </div>
        );
      })}

      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-700 mb-2">Instructions</h3>
        <p className="text-sm text-gray-600">
          Drag components onto the canvas to build your workflow. Connect them
          by dragging from one component's handle to another.
        </p>
      </div>
    </div>
  );
}
