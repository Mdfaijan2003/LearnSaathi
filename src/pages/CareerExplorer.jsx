import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  Background, Controls, Handle, Position, 
  applyNodeChanges, applyEdgeChanges, addEdge 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Compass, ArrowLeft, Milestone, GraduationCap, ChevronRight } from 'lucide-react';

// ==========================================
// 1. THE DATA STRUCTURE
// ==========================================
const careerGraph = {
  class_10: {
    label: "Class 10 Completed",
    desc: "Foundation built. Choose a stream.",
    options: [
      { id: "class_12_pcm", label: "Science (PCM)", desc: "Physics, Chem, Math" },
      { id: "class_12_pcb", label: "Science (PCB)", desc: "Physics, Chem, Bio" },
      { id: "commerce_12", label: "Commerce", desc: "Business & Finance" }
    ]
  },
  class_12_pcm: {
    label: "Class 12 (Science PCM)",
    desc: "Analytical background.",
    options: [
      { id: "btech", label: "B.Tech / B.E.", desc: "Engineering & Tech" },
      { id: "arch", label: "B.Arch", desc: "Architecture & Design" },
      { id: "bsc_math", label: "B.Sc Pure Sciences", desc: "Research & Academics" }
    ]
  },
  btech: {
    label: "Engineering (B.Tech)",
    desc: "Building the future.",
    options: [
      { id: "career_cs", label: "Computer Science", desc: "Software, AI, Web" },
      { id: "career_core", label: "Mechanical / Civil", desc: "Infrastructure, Machines" }
    ]
  },
  career_cs: {
    label: "Software Engineer / Tech",
    desc: "Destination Reached! Click to save roadmap.",
    options: [],
    isEndNode: true
  }
};

// ==========================================
// 2. OUR CUSTOM NOTION-STYLE NODE
// ==========================================
const CustomNode = ({ data }) => (
  <div className="bg-white border-2 border-slate-200 rounded-xl p-4 shadow-sm w-64 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group">
    {/* Input Handle (Hidden for the very first node) */}
    {!data.isRoot && <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500" />}
    
    <div className="flex justify-between items-start mb-2">
      <div className="font-bold text-slate-900">{data.label}</div>
      {!data.isEndNode && <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />}
    </div>
    <div className="text-xs text-slate-500 font-medium leading-relaxed">{data.desc}</div>
    
    {/* Output Handle */}
    {!data.isEndNode && <Handle type="source" position={Position.Right} className="w-3 h-3 bg-slate-300 group-hover:bg-blue-500 transition-colors" />}
  </div>
);

const nodeTypes = { customCard: CustomNode };

// ==========================================
// 3. THE MAIN APPLICATION
// ==========================================
const CareerExplorer = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [pathPreview, setPathPreview] = useState([]);
  
  // React Flow State
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  // Handle Dragging / Interactions
  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  // START THE JOURNEY
  const startJourney = (startId) => {
    const rootData = careerGraph[startId];
    
    // Create the initial Root Node
    const rootNode = {
      id: startId,
      type: 'customCard',
      position: { x: 50, y: window.innerHeight / 2 - 100 },
      data: { ...rootData, isRoot: true }
    };

    setNodes([rootNode]);
    setEdges([]);
    setPathPreview([rootData.label]);
    setHasStarted(true);
  };

  // EXPAND BRANCHES ON CLICK
  const onNodeClick = (event, node) => {
    const nodeData = careerGraph[node.id];
    if (!nodeData || !nodeData.options || nodeData.options.length === 0) return;

    // Update Path Preview Breadcrumbs
    const currentPreviewIndex = pathPreview.indexOf(node.data.label);
    if (currentPreviewIndex !== -1) {
      setPathPreview([...pathPreview.slice(0, currentPreviewIndex + 1)]);
    } else {
      setPathPreview([...pathPreview, node.data.label]);
    }

    // Generate new nodes dynamically to the right
    const newNodes = [];
    const newEdges = [];
    
    // Spacing configuration
    const X_OFFSET = 350; // Distance to the right
    const Y_SPACING = 120; // Vertical distance between siblings
    const startY = node.position.y - ((nodeData.options.length - 1) * Y_SPACING) / 2;

    nodeData.options.forEach((option, index) => {
      const optionData = careerGraph[option.id] || { label: option.label, desc: option.desc };
      
      const childId = `${node.id}-${option.id}`; // Unique ID to allow multiple explorations
      
      // Add Child Node
      newNodes.push({
        id: childId,
        type: 'customCard',
        position: { x: node.position.x + X_OFFSET, y: startY + (index * Y_SPACING) },
        data: { ...optionData, id: option.id } // Pass original ID in data to query graph later
      });

      // Add Edge (Connecting line)
      newEdges.push({
        id: `e-${node.id}-${childId}`,
        source: node.id,
        target: childId,
        type: 'smoothstep', // Gives that clean, engineered right-angle look
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 }
      });
    });

    // Append new branches to the canvas
    setNodes((nds) => [...nds, ...newNodes]);
    setEdges((eds) => [...eds, ...newEdges]);
  };

  const resetCanvas = () => {
    setHasStarted(false);
    setNodes([]);
    setEdges([]);
    setPathPreview([]);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 font-sans overflow-hidden">
      
      {/* --- HEADER & PATH PREVIEW --- */}
      <header className="bg-white border-b border-slate-200 py-3 px-6 flex flex-col sm:flex-row sm:items-center justify-between z-10 shrink-0 shadow-sm">
        <div className="flex items-center space-x-3 mb-2 sm:mb-0">
          <div className="p-1.5 bg-blue-50 rounded-lg">
            <Compass className="text-blue-600" size={20} />
          </div>
          <h1 className="text-base font-bold tracking-tight text-slate-900">Career Explorer</h1>
        </div>

        {/* The Path Preview (Breadcrumbs) */}
        {hasStarted && (
          <div className="flex flex-wrap items-center text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
            {pathPreview.map((step, idx) => (
              <React.Fragment key={idx}>
                <span className={idx === pathPreview.length - 1 ? 'text-blue-600 font-bold' : ''}>
                  {step}
                </span>
                {idx < pathPreview.length - 1 && <ChevronRight size={14} className="mx-1 text-slate-300" />}
              </React.Fragment>
            ))}
          </div>
        )}

        {hasStarted && (
          <button onClick={resetCanvas} className="flex items-center space-x-1 text-xs font-bold text-slate-400 hover:text-slate-900 mt-2 sm:mt-0">
            <ArrowLeft size={14} /> <span>Reset</span>
          </button>
        )}
      </header>

      {/* --- WORKSPACE --- */}
      <main className="flex-1 relative">
        
        {/* Welcome Screen (Overlay) */}
        {!hasStarted && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-50">
            <div className="text-center max-w-lg mx-auto p-6 animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Milestone size={32} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4">Design your path.</h2>
              <p className="text-slate-600 mb-8">Click a starting point to generate your interactive roadmap.</p>
              
              <div className="grid grid-cols-1 gap-3">
                <button onClick={() => startJourney('class_10')} className="flex items-center p-4 border border-slate-200 bg-white rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left">
                  <GraduationCap size={20} className="text-slate-400 mr-4" />
                  <div>
                    <div className="font-bold text-slate-900">Class 10 Student</div>
                    <div className="text-xs text-slate-500">Explore subject streams</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* React Flow Canvas */}
        {hasStarted && (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.5}
            className="bg-slate-50"
          >
            <Background color="#cbd5e1" gap={24} size={2} />
            <Controls className="bg-white border-slate-200 shadow-sm rounded-lg overflow-hidden" />
          </ReactFlow>
        )}

      </main>
    </div>
  );
};

export default CareerExplorer;