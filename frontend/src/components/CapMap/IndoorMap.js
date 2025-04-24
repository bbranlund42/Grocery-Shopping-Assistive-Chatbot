import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Header from '../NewHomePage/Header/Header';

const IndoorMap = ({ 
  mapImageUrl, 
  apiBaseUrl = 'http://localhost:5001',
  nodeRadius = 15,
  canvasWidth = 600,  // Fixed canvas width
  canvasHeight = 600  // Fixed canvas height
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [path, setPath] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [scale, setScale] = useState({ 
    minX: 0, maxX: 4, minY: -1, maxY: 5,
    width: 7, height: 7
  });
  const [showNodes, setShowNodes] = useState(true);
  const [showEdges, setShowEdges] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [showingSequential, setShowingSequential] = useState(false);
  
  const canvasRef = useRef(null);
  const mapImageRef = useRef(null);

  // Constants for coordinate mapping
  const marginX = 50;
  const marginY = 50;

  // Convert graph coordinates to fixed-size canvas coordinates
  const toCanvasX = x => marginX + ((x - scale.minX) / scale.width) * (canvasWidth - 2 * marginX);
  const toCanvasY = y => marginY + ((scale.maxY - y) / scale.height) * (canvasHeight - 2 * marginY);

  // Inverse functions for click handling
  const toGraphX = canvasX => scale.minX + ((canvasX - marginX) / (canvasWidth - 2 * marginX)) * scale.width;
  const toGraphY = canvasY => scale.maxY - ((canvasY - marginY) / (canvasHeight - 2 * marginY)) * scale.height;

  // Load position scale for coordinate mapping
  useEffect(() => {
    axios.get(`${apiBaseUrl}/get_position_scale`)
      .then(response => {
        setScale(response.data);
      })
      .catch(err => {
        console.error('Error fetching position scale:', err);
        setError('Failed to load map scale. Is the server running?');
      });
  }, [apiBaseUrl]);

  // Load nodes and edges data
  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const nodesResponse = await axios.get(`${apiBaseUrl}/get_nodes`);
        const edgesResponse = await axios.get(`${apiBaseUrl}/get_edges`);
        
        setNodes(nodesResponse.data.nodes);
        setEdges(edgesResponse.data.edges);
      } catch (err) {
        console.error('Error fetching graph data:', err);
        setError('Failed to load map data. Is the server running?');
      }
    };
    
    fetchGraphData();
  }, [apiBaseUrl]);

  // Load the map image
  useEffect(() => {
    const image = new Image();
    image.src = mapImageUrl;
    image.onload = () => {
      mapImageRef.current = image;
      setMapLoaded(true);
    };
    image.onerror = () => {
      setError('Failed to load map image');
    };
  }, [mapImageUrl]);

  // Draw everything when dependencies change
  useEffect(() => {
    drawMap();
  }, [mapLoaded, nodes, edges, path, showNodes, showEdges, scale, currentPathIndex, showingSequential]);

  // Find optimized route through selected items
  const findOptimizedRoute = async () => {
    if (selectedItems.length === 0) {
      setError('Please select at least one item');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${apiBaseUrl}/find_optimized_route`, {
        items: selectedItems
      });
      
      setPath(response.data.path);
      // Reset sequential navigation
      setShowingSequential(false);
      setCurrentPathIndex(0);
    } catch (err) {
      console.error('Error finding route:', err);
      setError(err.response?.data?.error || 'Failed to calculate route');
    } finally {
      setLoading(false);
    }
  };

  // Find sequential path through selected items
  const findSequentialPath = async () => {
    if (selectedItems.length === 0) {
      setError('Please select at least one item');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${apiBaseUrl}/find_sequential_path`, {
        items: selectedItems
      });
      
      setPath(response.data.path);
      setShowingSequential(true);
      setCurrentPathIndex(1); // Start showing first segment
    } catch (err) {
      console.error('Error finding sequential path:', err);
      setError(err.response?.data?.error || 'Failed to calculate sequential path');
    } finally {
      setLoading(false);
    }
  };

  // Move to next segment in the path
  const showNextSegment = () => {
    if (currentPathIndex < path.length - 1) {
      setCurrentPathIndex(currentPathIndex + 1);
    }
  };

  // Move to previous segment in the path
  const showPreviousSegment = () => {
    if (currentPathIndex > 1) {
      setCurrentPathIndex(currentPathIndex - 1);
    }
  };

  // Draw the map and all elements
  const drawMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to fixed dimensions
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background color
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw map image if available - with fixed dimensions
    if (mapLoaded && mapImageRef.current) {
      ctx.drawImage(
        mapImageRef.current, 
        0, 0, 
        canvasWidth, 
        canvasHeight
      );
    }
    
    // Draw edges if enabled
    if (showEdges) {
      ctx.strokeStyle = '#888888';
      ctx.lineWidth = 1;
      
      edges.forEach(edge => {
        ctx.beginPath();
        ctx.moveTo(toCanvasX(edge.sourceX), toCanvasY(edge.sourceY));
        ctx.lineTo(toCanvasX(edge.targetX), toCanvasY(edge.targetY));
        ctx.stroke();
      });
    }
    
    // Draw path based on whether we're showing sequential or full path
    if (path.length > 0) {
      if (showingSequential) {
        // Draw only up to current index for sequential path
        ctx.strokeStyle = '#0066FF';  // Bright blue
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(toCanvasX(path[0].x), toCanvasY(path[0].y));
        
        for (let i = 1; i <= Math.min(currentPathIndex, path.length - 1); i++) {
          ctx.lineTo(toCanvasX(path[i].x), toCanvasY(path[i].y));
        }
        
        ctx.stroke();
        
        // Draw direction arrows only for current segment
        if (currentPathIndex > 0) {
          ctx.fillStyle = '#0066FF';
          const prev = path[currentPathIndex - 1];
          const curr = path[currentPathIndex];
          const dx = curr.x - prev.x;
          const dy = curr.y - prev.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          if (dist >= 0.1) {
            // Calculate arrow position (70% along the path segment)
            const arrowX = toCanvasX(prev.x + dx * 0.7);
            const arrowY = toCanvasY(prev.y + dy * 0.7);
            const angle = Math.atan2(dy, dx);
            
            // Draw arrow
            const arrowSize = 10;
            ctx.save();
            ctx.translate(arrowX, arrowY);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-arrowSize, -arrowSize/2);
            ctx.lineTo(-arrowSize, arrowSize/2);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
        }

        // Highlight current and next nodes
        if (currentPathIndex < path.length) {
          // Current node
          const current = path[currentPathIndex];
          ctx.fillStyle = '#FF5722'; // Orange for current position
          ctx.beginPath();
          ctx.arc(
            toCanvasX(current.x), 
            toCanvasY(current.y), 
            nodeRadius + 5, 
            0, 
            2 * Math.PI
          );
          ctx.fill();

          // Label for current node
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(current.node, toCanvasX(current.x), toCanvasY(current.y));
        }
      } else {
        // Draw full path
        ctx.strokeStyle = '#0066FF';  // Bright blue
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(toCanvasX(path[0].x), toCanvasY(path[0].y));
        
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(toCanvasX(path[i].x), toCanvasY(path[i].y));
        }
        
        ctx.stroke();
        
        // Draw direction arrows along the path
        ctx.fillStyle = '#0066FF';
        for (let i = 1; i < path.length; i++) {
          const prev = path[i-1];
          const curr = path[i];
          const dx = curr.x - prev.x;
          const dy = curr.y - prev.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          if (dist < 0.1) continue; // Skip if nodes are too close
          
          // Calculate arrow position (70% along the path segment)
          const arrowX = toCanvasX(prev.x + dx * 0.7);
          const arrowY = toCanvasY(prev.y + dy * 0.7);
          const angle = Math.atan2(dy, dx);
          
          // Draw arrow
          const arrowSize = 8;
          ctx.save();
          ctx.translate(arrowX, arrowY);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-arrowSize, -arrowSize/2);
          ctx.lineTo(-arrowSize, arrowSize/2);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }
    }

    // Draw nodes if enabled
    if (showNodes) {
      nodes.forEach(node => {
        // Check if this node is in the current path segment
        const isInCurrentPath = showingSequential && 
          path.some((p, idx) => p.node === node.id && idx <= currentPathIndex);
        
        // Different style for selected items and nodes in the path
        const isSelected = selectedItems.includes(node.id);
        const isEntrance = node.id === 'EX';
        const isPathNode = !showingSequential && path.some(p => p.node === node.id);
        
        // Skip if this node is the current position in sequential mode (already drawn)
        if (showingSequential && path[currentPathIndex]?.node === node.id) {
          return;
        }
        
        // Set node style based on type
        if (isEntrance) {
          ctx.fillStyle = '#FF5722'; // Orange for entrance
        } else if (isSelected) {
          ctx.fillStyle = '#4CAF50'; // Green for selected items
        } else if (isInCurrentPath) {
          ctx.fillStyle = '#2196F3'; // Blue for nodes in current path
        } else if (isPathNode) {
          ctx.fillStyle = '#2196F3'; // Blue for nodes in path
        } else {
          ctx.fillStyle = '#888888'; // Gray for regular nodes
        }
        
        // Draw node circle
        ctx.beginPath();
        ctx.arc(
          toCanvasX(node.x), 
          toCanvasY(node.y), 
          isSelected || isEntrance || isPathNode || isInCurrentPath ? nodeRadius + 2 : nodeRadius, 
          0, 
          2 * Math.PI
        );
        ctx.fill();
        
        // Draw node label
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.id, toCanvasX(node.x), toCanvasY(node.y));
        
        // Draw highlighting circle around selected items
        if (isSelected) {
          ctx.strokeStyle = '#4CAF50';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(
            toCanvasX(node.x), 
            toCanvasY(node.y), 
            nodeRadius + 5, 
            0, 
            2 * Math.PI
          );
          ctx.stroke();
        }
      });
    }
  };

  // Handle node click to select/deselect items
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    
    // Calculate the click position in canvas coordinates
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    
    // Convert canvas coordinates to graph coordinates
    const graphX = toGraphX(canvasX);
    const graphY = toGraphY(canvasY);
    
    console.log('Click at:', {canvasX, canvasY, graphX, graphY});
    
    // Find if a node was clicked
    const clickedNode = nodes.find(node => {
      const dx = node.x - graphX;
      const dy = node.y - graphY;
      const distance = Math.sqrt(dx*dx + dy*dy);
      
      // Use larger click radius for better usability
      return distance < (scale.width / (canvasWidth - 2 * marginX)) * nodeRadius * 2;
    });
    
    if (clickedNode) {
      console.log('Clicked node:', clickedNode);
      
      // Don't select the entrance
      if (clickedNode.id === 'EX') return;
      
      // Toggle node selection
      setSelectedItems(prev => {
        if (prev.includes(clickedNode.id)) {
          return prev.filter(id => id !== clickedNode.id);
        } else {
          return [...prev, clickedNode.id];
        }
      });
    }
  };

  // Reset the map selections and path
  const resetMap = () => {
    setSelectedItems([]);
    setPath([]);
    setError(null);
    setShowingSequential(false);
    setCurrentPathIndex(0);
  };

  // Get current navigation status text
  const getNavigationStatus = () => {
    if (!showingSequential || path.length === 0) return "";
    
    if (currentPathIndex === 0) {
      return "Starting point";
    }
    
    const from = path[currentPathIndex-1]?.node || "";
    const to = path[currentPathIndex]?.node || "";
    
    if (currentPathIndex >= path.length - 1) {
      return `Final step: ${from} to ${to}`;
    }
    
    return `Step ${currentPathIndex} of ${path.length-1}: ${from} to ${to}`;
  };

  return (
    <div className="indoor-map-container mx-auto p-4 flex flex-col items-center">
      <Header />
      <div className="mb-4">
        <p className="text-gray-600 mb-4">
          Click on nodes to select items, then choose a navigation mode.
        </p>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mb-4">
          <button 
            onClick={findOptimizedRoute}
            disabled={loading || selectedItems.length === 0}
            className={`px-4 py-2 rounded ${
              loading || selectedItems.length === 0 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {loading ? 'Calculating...' : 'Optimized Route'}
          </button>
          
          <button 
            onClick={findSequentialPath}
            disabled={loading || selectedItems.length === 0}
            className={`px-4 py-2 rounded ${
              loading || selectedItems.length === 0 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {loading ? 'Calculating...' : 'Sequential Path'}
          </button>
          
          <button 
            onClick={resetMap}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Reset
          </button>
          
          <button 
            onClick={() => setShowNodes(!showNodes)}
            className={`px-4 py-2 rounded ${showNodes ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          >
            {showNodes ? 'Hide Nodes' : 'Show Nodes'}
          </button>
          
          <button 
            onClick={() => setShowEdges(!showEdges)}
            className={`px-4 py-2 rounded ${showEdges ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          >
            {showEdges ? 'Hide Paths' : 'Show Paths'}
          </button>
        </div>
        
        {/* Sequential navigation controls */}
        {showingSequential && path.length > 0 && (
          <div className="mb-4 bg-blue-50 p-3 rounded border border-blue-200">
            <p className="font-bold text-blue-800 mb-2">{getNavigationStatus()}</p>
            <div className="flex gap-2">
              <button 
                onClick={showPreviousSegment}
                disabled={currentPathIndex <= 1}
                className={`px-4 py-2 rounded ${
                  currentPathIndex <= 1
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Previous
              </button>
              
              <button 
                onClick={showNextSegment}
                disabled={currentPathIndex >= path.length - 1}
                className={`px-4 py-2 rounded ${
                  currentPathIndex >= path.length - 1
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
        
        {selectedItems.length > 0 && (
          <div className="mb-4">
            <p className="font-bold">Selected Items ({selectedItems.length}):</p>
            <p className="text-gray-700">{selectedItems.join(', ')}</p>
          </div>
        )}
      </div>
      
      <div className="map-display border border-gray-300 overflow-auto">
        <canvas 
          ref={canvasRef} 
          onClick={handleCanvasClick}
          className="cursor-pointer"
          width={canvasWidth}
          height={canvasHeight}
        />
      </div>
    </div>
  );
};

export default IndoorMap;