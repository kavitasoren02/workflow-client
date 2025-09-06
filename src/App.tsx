import { useState } from "react";
import "./App.css";
import WorkflowBuilder from "./components/WorkflowBuilder";
import ChatModal from "./components/ChatModal";

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [currentWorkflow, setCurrentWorkflow] = useState<any>(null)

  const handleChatWithStack = (workflow: any) => {
    setCurrentWorkflow(workflow)
    setIsChatOpen(true)
  }
  return (
    <div className="h-screen bg-gray-50">
      <WorkflowBuilder onChatWithStack={handleChatWithStack} />
      {isChatOpen && <ChatModal workflow={currentWorkflow} onClose={() => setIsChatOpen(false)} />}
    </div>
  )
}

export default App;
