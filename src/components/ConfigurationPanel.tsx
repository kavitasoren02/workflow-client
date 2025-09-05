import type React from "react";

import { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import type { Node } from "reactflow";

interface ConfigurationPanelProps {
  node: Node;
  onUpdateConfig: (config: any) => void;
  onClose: () => void;
}

export default function ConfigurationPanel({
  node,
  onUpdateConfig,
  onClose,
}: ConfigurationPanelProps) {
  const [config, setConfig] = useState(node.data.config || {});
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    setConfig(node.data.config || {});
    if (node.data.componentType === "knowledge-base") {
      fetchDocuments();
    }
  }, [node]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/documents");
      if (response.ok) {
        const docs = await response.json();
        setDocuments(docs);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onUpdateConfig(newConfig);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "http://localhost:8000/api/documents/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert(`Document "${file.name}" uploaded successfully!`);
        fetchDocuments();
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file. Please try again.");
    }
  };

  const renderConfiguration = () => {
    switch (node.data.componentType) {
      case "user-query":
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              This component accepts user queries and serves as the entry point
              for your workflow.
            </p>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                No configuration required. This component automatically captures
                user input.
              </p>
            </div>
          </div>
        );

      case "knowledge-base":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Documents
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Click to upload documents
                  </span>
                </label>
              </div>
            </div>

            {documents.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Uploaded Documents
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="text-sm font-medium">{doc.filename}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(doc.upload_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {doc.embeddings_generated ? (
                          <span className="text-xs text-green-600">
                            ✓ Processed
                          </span>
                        ) : (
                          <span className="text-xs text-yellow-600">
                            Processing...
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "llm-engine":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <select
                value={config.model || "gemini-2.5-flash"}
                onChange={(e) => handleConfigChange("model", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="gemini-2.5-flash">gemini 2.5 flash</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                System Prompt
              </label>
              <textarea
                value={config.systemPrompt || "You are a helpful assistant."}
                onChange={(e) =>
                  handleConfigChange("systemPrompt", e.target.value)
                }
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter system prompt..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="web-search"
                checked={config.useWebSearch || false}
                onChange={(e) =>
                  handleConfigChange("useWebSearch", e.target.checked)
                }
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="web-search" className="text-sm text-gray-700">
                Enable web search
              </label>
            </div>
          </div>
        );

      case "output":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Format
              </label>
              <select
                value={config.displayFormat || "chat"}
                onChange={(e) =>
                  handleConfigChange("displayFormat", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="chat">Chat Interface</option>
                <option value="text">Plain Text</option>
                <option value="markdown">Markdown</option>
              </select>
            </div>

            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-800">
                This component displays the final response from your workflow to
                users.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <p className="text-gray-500">
            No configuration available for this component.
          </p>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Configure {node.data.label}
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">{renderConfiguration()}</div>
    </div>
  );
}
