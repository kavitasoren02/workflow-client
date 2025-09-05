"use client";

import type React from "react";
import { useState, useCallback, useRef } from "react";
import ReactFlow, {
  type Node,
  addEdge,
  type Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

import ComponentLibrary from "./ComponentLibrary";
import ConfigurationPanel from "./ConfigurationPanel";
import ExecutionControls from "./ExecutionControls";
import CustomNode from "./CustomNode";

const nodeTypes = {
  custom: CustomNode,
};

interface WorkflowBuilderProps {
  onChatWithStack: (workflow: any) => void;
}

export default function WorkflowBuilder({
  onChatWithStack,
}: WorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState("My Workflow");
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds: any) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = reactFlowInstance?.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: "custom",
        position,
        data: {
          label: getComponentLabel(type),
          componentType: type,
          config: getDefaultConfig(type),
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const getComponentLabel = (type: string) => {
    const labels: Record<string, string> = {
      "user-query": "User Query",
      "knowledge-base": "Knowledge Base",
      "llm-engine": "LLM Engine",
      output: "Output",
    };
    return labels[type] || type;
  };

  const getDefaultConfig = (type: string) => {
    const configs: Record<string, any> = {
      "user-query": {},
      "knowledge-base": {
        uploadedDocuments: [],
      },
      "llm-engine": {
        model: "gemini-2.5-flash",
        systemPrompt: "You are a helpful assistant.",
        useWebSearch: false,
      },
      output: {
        displayFormat: "chat",
      },
    };
    return configs[type] || {};
  };

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const updateNodeConfig = (nodeId: string, config: any) => {
    setNodes((nds: any) =>
      nds.map((node: any) =>
        node.id === nodeId ? { ...node, data: { ...node.data, config } } : node
      )
    );
  };

  const buildWorkflow = async () => {
    try {
      const workflowData = {
        name: workflowName,
        description: "Generated workflow",
        components: nodes.map((node: any) => ({
          id: node.id,
          type: node.data.componentType,
          config: node.data.config,
        })),
        connections: edges.map((edge: any) => ({
          source: edge.source,
          target: edge.target,
        })),
      };

      const response = await fetch("http://localhost:8000/api/workflows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workflowData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Workflow "${workflowName}" built successfully!`);
        return result;
      } else {
        throw new Error("Failed to build workflow");
      }
    } catch (error) {
      console.error("Error building workflow:", error);
      alert("Error building workflow. Please try again.");
    }
  };

  const handleChatWithStack = async () => {
    const workflow = await buildWorkflow();
    if (workflow) {
      onChatWithStack(workflow);
    }
  };

  return (
    <div className="flex h-full">
      {/* Component Library Panel */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Components</h2>
        </div>
        <ComponentLibrary />
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-xl font-semibold bg-transparent border-none outline-none text-gray-800"
              placeholder="Workflow Name"
            />
          </div>
          <ExecutionControls
            onBuildStack={buildWorkflow}
            onChatWithStack={handleChatWithStack}
            hasNodes={nodes.length > 0}
          />
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
            >
              <Controls />
              <Background />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>

      {/* Configuration Panel */}
      {selectedNode && (
        <div className="w-80 bg-white border-l border-gray-200">
          <ConfigurationPanel
            node={selectedNode}
            onUpdateConfig={(config) =>
              updateNodeConfig(selectedNode.id, config)
            }
            onClose={() => setSelectedNode(null)}
          />
        </div>
      )}
    </div>
  );
}
