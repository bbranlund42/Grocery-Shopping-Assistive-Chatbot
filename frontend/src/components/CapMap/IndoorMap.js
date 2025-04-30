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
  const [fullPath, setFullPath] = useState([]);
  const [displayPath, setDisplayPath] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [scale, setScale] = useState({ 
    minX: 0, maxX: 4, minY: -1, maxY: 5,
    width: 7, height: 7
  });
  const [showNodes, setShowNodes] = useState(true);
  //const [showEdges, setShowEdges] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [productSegments, setProductSegments] = useState([]);
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
  }, [mapLoaded, nodes, edges, displayPath, scale]);

  // Create product segments from path
  useEffect(() => {
    if (fullPath.length > 0 && selectedItems.length > 0) {
      // Find indices of selected items in path
      const productIndices = [];
      
      // Always start with the first node (entrance)
      productIndices.push(0);
      
      // Add indices of all selected products
      fullPath.forEach((point, index) => {
        if (selectedItems.includes(point.node)) {
          productIndices.push(index);
        }
      });
      
      // Create product segments
      const segments = [];
      for (let i = 0; i < productIndices.length; i++) {
        const startIdx = productIndices[i];
        const endIdx = i + 1 < productIndices.length ? productIndices[i + 1] : fullPath.length - 1;
        
        if (startIdx <= endIdx) {
          segments.push(fullPath.slice(startIdx, endIdx + 1));
        }
      }
      
      setProductSegments(segments);
      
      // Show first segment by default
      if (segments.length > 0) {
        setDisplayPath(segments[0]);
      }
    }
  }, [fullPath, selectedItems]);

  

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
      
      setFullPath(response.data.path);
      setShowingSequential(true);
      setCurrentProductIndex(0); // Start showing first segment
    } catch (err) {
      console.error('Error finding sequential path:', err);
      setError(err.response?.data?.error || 'Failed to calculate sequential path');
    } finally {
      setLoading(false);
    }
  };

  // Move to next product segment
  const showNextSegment = () => {
    if (currentProductIndex < productSegments.length - 1) {
      const nextIndex = currentProductIndex + 1;
      setCurrentProductIndex(nextIndex);
      setDisplayPath(productSegments[nextIndex]);
    }
  };

  // Move to previous product segment
  const showPreviousSegment = () => {
    if (currentProductIndex > 0) {
      const prevIndex = currentProductIndex - 1;
      setCurrentProductIndex(prevIndex);
      setDisplayPath(productSegments[prevIndex]);
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
    
    // Draw current display path
    if (displayPath && displayPath.length > 0) {
      // Draw the path
      ctx.strokeStyle = '#0066FF';  // Bright blue
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(toCanvasX(displayPath[0].x), toCanvasY(displayPath[0].y));
      
      for (let i = 1; i < displayPath.length; i++) {
        ctx.lineTo(toCanvasX(displayPath[i].x), toCanvasY(displayPath[i].y));
      }
      
      ctx.stroke();
      
      
      // Highlight start and end nodes of the current segment
      if (displayPath.length > 0) {
        // Start node
        const start = displayPath[0];
        ctx.fillStyle = '#FF5722'; // Orange for start
        ctx.beginPath();
        ctx.arc(
          toCanvasX(start.x), 
          toCanvasY(start.y), 
          nodeRadius + 5, 
          0, 
          2 * Math.PI
        );
        ctx.fill();
        
        // End node
        const end = displayPath[displayPath.length - 1];
        ctx.fillStyle = '#4CAF50'; // Green for end
        ctx.beginPath();
        ctx.arc(
          toCanvasX(end.x), 
          toCanvasY(end.y), 
          nodeRadius + 5, 
          0, 
          2 * Math.PI
        );
        ctx.fill();
        
        // Label nodes
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(start.node, toCanvasX(start.x), toCanvasY(start.y));
        ctx.fillText(end.node, toCanvasX(end.x), toCanvasY(end.y));
      }
    }

    // Draw nodes if enabled
    if (showNodes) {
      nodes.forEach(node => {       
        // Different style for selected items
        const isSelected = selectedItems.includes(node.id);
        const isEntrance = node.id === 'EX';
        
        // Set node style based on type
        if (isEntrance) {
          ctx.fillStyle = '#FF5722'; // Orange for entrance
        } else if (isSelected) {
          ctx.fillStyle = '#4CAF50'; // Green for selected items
        } 
        
        
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
    
    //console.log('Click at:', {canvasX, canvasY, graphX, graphY});
    
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
    setFullPath([]);
    setDisplayPath([]);
    setProductSegments([]);
    setError(null);
    setShowingSequential(false);
    setCurrentProductIndex(0);
  };

  // Get current navigation status text
  const getNavigationStatus = () => {
    if (!showingSequential || productSegments.length === 0) return "";
    
    const currentSegment = productSegments[currentProductIndex];
    if (!currentSegment || currentSegment.length === 0) return "";
    
    const from = currentSegment[0]?.node || "";
    const to = currentSegment[currentSegment.length - 1]?.node || "";
    
    if (currentProductIndex === 0 && from === 'EX') {
      return `Product ${currentProductIndex + 1} of ${productSegments.length}`;
    }
    
    if (currentProductIndex >= productSegments.length - 1) {
      return `Product ${currentProductIndex + 1} of ${productSegments.length}`;
    }
    
    return `Product ${currentProductIndex + 1} of ${productSegments.length}`;
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
            onClick={findSequentialPath}
            disabled={loading || selectedItems.length === 0}
            className={`px-4 py-2 rounded ${
              loading || selectedItems.length === 0 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {loading ? 'Calculating...' : 'Path'}
          </button>
          
          <button 
            onClick={resetMap}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Reset
          </button>
      
        </div>
        
        {/* Product navigation controls */}
        {showingSequential && productSegments.length > 0 && (
          <div className="mb-4 bg-blue-50 p-3 rounded border border-blue-200">
            <p className="font-bold text-blue-800 mb-2">{getNavigationStatus()}</p>
            <div className="flex gap-2">
              <button 
                onClick={showPreviousSegment}
                disabled={currentProductIndex <= 0}
                className={`px-4 py-2 rounded ${
                  currentProductIndex <= 0
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Previous Product
              </button>
              
              <button 
                onClick={showNextSegment}
                disabled={currentProductIndex >= productSegments.length - 1}
                className={`px-4 py-2 rounded ${
                  currentProductIndex >= productSegments.length - 1
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Next Product
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