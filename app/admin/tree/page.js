"use client";
import { useEffect, useState, useRef } from "react";
import { getReferralTree, manualLinkUser, unlinkUser } from "../../../lib/referralUtils";
import { ArrowLeft, Network, List, Move, X, Check, Unlink, ZoomIn, ZoomOut, Maximize, ChevronDown, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

// --- HELPER: Count Total Descendants (Recursive) ---
const countDescendants = (node) => {
    if (!node.children || node.children.length === 0) return 0;
    return node.children.reduce((acc, child) => acc + 1 + countDescendants(child), 0);
};

// --- HELPER: Mobile-Ready Zoomable Canvas ---
const ZoomableCanvas = ({ children }) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    
    // Mouse State
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    // Touch State (Pinch Zoom)
    const [lastTouchDistance, setLastTouchDistance] = useState(null);
    const containerRef = useRef(null);

    // --- MOUSE CONTROLS (Desktop) ---
    const handleWheel = (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            setScale(s => Math.min(Math.max(0.2, s * delta), 3));
        }
    };

    const handleMouseDown = (e) => {
        if (e.target === containerRef.current || e.target.classList.contains('canvas-bg')) {
            setIsDragging(true);
            setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
            containerRef.current.style.cursor = 'grabbing';
        }
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setPosition({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        if (containerRef.current) containerRef.current.style.cursor = 'grab';
    };

    // --- TOUCH CONTROLS (Mobile) ---
    const getTouchDistance = (touches) => {
        return Math.hypot(
            touches[0].clientX - touches[1].clientX,
            touches[0].clientY - touches[1].clientY
        );
    };

    const handleTouchStart = (e) => {
        if (e.touches.length === 1) {
            // Single finger: Start Panning
            setIsDragging(true);
            setStartPos({ 
                x: e.touches[0].clientX - position.x, 
                y: e.touches[0].clientY - position.y 
            });
        } else if (e.touches.length === 2) {
            // Two fingers: Start Pinching
            setIsDragging(false); // Stop panning
            setLastTouchDistance(getTouchDistance(e.touches));
        }
    };

    const handleTouchMove = (e) => {
        // Prevent page scrolling while interacting with canvas
        if(e.cancelable) e.preventDefault(); 

        if (e.touches.length === 1 && isDragging) {
            // Pan Logic
            setPosition({ 
                x: e.touches[0].clientX - startPos.x, 
                y: e.touches[0].clientY - startPos.y 
            });
        } else if (e.touches.length === 2) {
            // Pinch Zoom Logic
            const currentDistance = getTouchDistance(e.touches);
            if (lastTouchDistance) {
                const ratio = currentDistance / lastTouchDistance;
                // Limit zoom speed and bounds
                const newScale = Math.min(Math.max(0.2, scale * ratio), 3);
                setScale(newScale);
            }
            setLastTouchDistance(currentDistance);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        setLastTouchDistance(null);
    };

    return (
        <div 
            ref={containerRef}
            className="w-full h-[70vh] bg-gray-100 rounded-3xl overflow-hidden relative cursor-grab border border-gray-200 shadow-inner canvas-bg touch-none" // touch-none prevents browser gestures
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Zoom Buttons (Still useful on mobile for quick access) */}
            <div className="absolute bottom-4 right-4 flex gap-2 bg-white p-2 rounded-xl shadow-lg z-10">
                <button onClick={() => setScale(s => Math.max(0.2, s - 0.2))} className="p-2 hover:bg-gray-100 rounded-lg"><ZoomOut size={20}/></button>
                <button onClick={() => { setScale(1); setPosition({x:0, y:0}); }} className="p-2 hover:bg-gray-100 rounded-lg"><Maximize size={20}/></button>
                <button onClick={() => setScale(s => Math.min(3, s + 0.2))} className="p-2 hover:bg-gray-100 rounded-lg"><ZoomIn size={20}/></button>
            </div>

            <div 
                style={{ 
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transformOrigin: "0 0",
                    transition: (isDragging || lastTouchDistance) ? "none" : "transform 0.1s ease-out"
                }}
                className="w-full h-full p-10 origin-top-left"
            >
                {children}
            </div>
        </div>
    );
};

export default function AdminTreePage() {
    const router = useRouter();
    const [treeData, setTreeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("list"); // 'list' or 'tree'
    const [moveMode, setMoveMode] = useState(false);
    const [selectedChild, setSelectedChild] = useState(null);

    const loadData = async () => {
        setLoading(true);
        const data = await getReferralTree();
        setTreeData(data);
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    // --- LOGIC (Reparenting & Unlinking) ---
    const handleNodeClick = async (user) => {
        if (!moveMode) return; 
        if (!selectedChild) {
            // Select Child
            if (user.children && user.children.length > 0) {
                 if(!confirm(`Move ${user.name} and their ${countDescendants(user)} team members?`)) return;
            }
            setSelectedChild(user);
        } else {
            // Select Parent
            if (user.id === selectedChild.id) { setSelectedChild(null); return; }
            if (confirm(`Move "${selectedChild.name}" to be under "${user.name}"?`)) {
                const res = await manualLinkUser(selectedChild.email, user.referralCode);
                if (res.success) { alert("Moved!"); setSelectedChild(null); setMoveMode(false); loadData(); }
                else alert("Error: " + res.error);
            }
        }
    };

    const handleMakeRoot = async () => {
        if (!selectedChild) return;
        if (confirm(`Unlink "${selectedChild.name}" from their parent?`)) {
            const res = await unlinkUser(selectedChild.email);
            if (res.success) { alert("Unlinked!"); setSelectedChild(null); setMoveMode(false); loadData(); }
            else alert("Error: " + res.error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 mb-2 hover:text-black transition font-bold text-sm">
                        <ArrowLeft size={18}/> Back
                    </button>
                    <h1 className="text-2xl font-black text-gray-900">Referral Hierarchy 🌳</h1>
                    <p className="text-sm text-gray-500">{moveMode ? "Select User to Move → Select New Parent" : "Visualize your team structure."}</p>
                </div>
                
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm z-20 relative">
                    {!moveMode && (
                        <>
                            <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg ${viewMode === 'list' ? "bg-black text-white" : "text-gray-400"}`}><List size={20}/></button>
                            <button onClick={() => setViewMode("tree")} className={`p-2 rounded-lg ${viewMode === 'tree' ? "bg-black text-white" : "text-gray-400"}`}><Network size={20}/></button>
                            <div className="w-px bg-gray-200 mx-1 h-6"></div>
                        </>
                    )}
                    {moveMode && selectedChild && (
                        <button onClick={handleMakeRoot} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold bg-red-100 text-red-600 border border-red-200"><Unlink size={16}/> Unlink</button>
                    )}
                    <button 
                        onClick={() => { setMoveMode(!moveMode); setSelectedChild(null); }} 
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition ${moveMode ? "bg-gray-800 text-white" : "bg-white hover:bg-gray-50 text-gray-700"}`}
                    >
                        {moveMode ? <><X size={16}/> Cancel</> : <><Move size={16}/> Edit Tree</>}
                    </button>
                </div>
            </div>

            {loading ? <div className="text-center py-20 text-gray-400">Loading...</div> : (
                <>
                    {viewMode === 'list' && (
                        <div className="max-w-3xl mx-auto space-y-2 pb-20">
                            {treeData.map(root => <ListNode key={root.id} node={root} moveMode={moveMode} selectedId={selectedChild?.id} onNodeClick={handleNodeClick} />)}
                        </div>
                    )}

                    {viewMode === 'tree' && (
                        <ZoomableCanvas>
                             <div className="flex justify-center items-start gap-12 min-w-max">
                                {treeData.map(root => <VisualNode key={root.id} node={root} moveMode={moveMode} selectedId={selectedChild?.id} onNodeClick={handleNodeClick} />)}
                             </div>
                        </ZoomableCanvas>
                    )}
                </>
            )}
        </div>
    );
}

// --- LIST NODE (Math Fixed) ---
const ListNode = ({ node, level = 0, moveMode, selectedId, onNodeClick }) => {
    const [isOpen, setIsOpen] = useState(true);
    const hasChildren = node.children && node.children.length > 0;
    const totalDownline = countDescendants(node); // Correct calculation
    const isSelected = selectedId === node.id;

    return (
        <div className="animate-fade-in select-none">
            <div 
                onClick={() => moveMode ? onNodeClick(node) : setIsOpen(!isOpen)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer relative ${isSelected ? "bg-blue-50 border-blue-500" : "bg-white border-gray-100 hover:border-gray-300"}`}
                style={{ marginLeft: `${level * 24}px` }}
            >
                {moveMode && <div className="absolute -left-3 top-1/2 -translate-y-1/2">{isSelected ? <Check size={14} className="text-blue-600"/> : <div className="w-2 h-2 rounded-full bg-gray-200"></div>}</div>}
                
                {hasChildren ? (isOpen ? <ChevronDown size={14} className="text-gray-400"/> : <ChevronRight size={14} className="text-gray-400"/>) : <div className="w-3.5" />}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${level === 0 ? "bg-black text-white" : "bg-gray-100 text-gray-600"}`}>{node.name?.[0]?.toUpperCase()}</div>
                <div>
                    <div className="flex items-center gap-2"><p className="text-sm font-bold text-gray-900">{node.name}</p></div>
                    <p className="text-[10px] text-gray-500">Total Team: <b>{totalDownline}</b> • Code: {node.referralCode}</p>
                </div>
            </div>
            {isOpen && hasChildren && <div className="border-l-2 border-gray-100 ml-6 pl-2 mt-2 space-y-2">{node.children.map(child => <ListNode key={child.id} node={child} level={level + 1} moveMode={moveMode} selectedId={selectedId} onNodeClick={onNodeClick} />)}</div>}
        </div>
    );
};

// --- VISUAL NODE (Math Fixed) ---
const VisualNode = ({ node, moveMode, selectedId, onNodeClick }) => {
    const hasChildren = node.children && node.children.length > 0;
    const totalDownline = countDescendants(node); // Correct calculation
    const isSelected = selectedId === node.id;

    return (
        <div className="flex flex-col items-center">
            <div 
                onClick={() => moveMode && onNodeClick(node)}
                className={`relative p-4 rounded-2xl border bg-white shadow-sm min-w-[160px] text-center mb-8 cursor-pointer transition-all ${isSelected ? "border-blue-500 ring-4 ring-blue-100 scale-105" : "border-gray-200 hover:shadow-lg hover:-translate-y-1"}`}
            >
                <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 flex items-center justify-center font-black text-base mb-3 border-2 border-white shadow-sm">{node.name?.[0]?.toUpperCase()}</div>
                <p className="font-bold text-sm text-gray-900 truncate max-w-[140px] mx-auto">{node.name}</p>
                <div className="mt-2 inline-block bg-blue-50 px-3 py-1 rounded-full text-[10px] text-blue-600 font-black tracking-wide uppercase">Team: {totalDownline}</div>
                
                {/* Connector Line Down */}
                {hasChildren && <div className="absolute -bottom-8 left-1/2 w-0.5 h-8 bg-gray-300"></div>}
            </div>

            {hasChildren && (
                <div className="flex items-start gap-8 pt-4 border-t-2 border-gray-300 relative">
                    {/* The horizontal bar logic is simplified here; strict CSS trees need detailed pseudo-elements */}
                    {node.children.map(child => <VisualNode key={child.id} node={child} moveMode={moveMode} selectedId={selectedId} onNodeClick={onNodeClick} />)}
                </div>
            )}
        </div>
    );
};