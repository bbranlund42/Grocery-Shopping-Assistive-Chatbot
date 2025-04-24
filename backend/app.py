from flask import Flask, request, jsonify
from flask_cors import CORS
import networkx as nx
import matplotlib.pyplot as plt

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

def initialize_graph():
    # Create the graph structure from your notebook
    g = nx.Graph()

    g.add_nodes_from(["EX",
                  "Z1", "A1", "A2", "A3", "A4", "A5", "Z7",
                  "Z2", "B1", "B2", "B3", "B4", "B5", "Z8",
                  "Z3", "C1", "C2", "C3", "C4", "C5", "Z9",
                  "Z4", "D1", "D2", "D3", "D4", "D5", "Z0",
                  "Z5", "E1", "E2", "E3", "E4", "E5", "Y1",
                  "Z6", "F1", "F2", "F3", "F4", "F5", "Y2"])

    g.add_edges_from([("EX", "Z1"), ("Z1", "Z2"), ("Z2", "Z3"), ("Z3", "Z4"),
                  ("Z4", "Z5"), ("Z5", "Z6"),
                  ("Z7", "Z8"), ("Z8", "Z9"), ("Z9", "Z0"), ("Z0", "Y1"),
                  ("Y1", "Y2"),

                  ("Z1", "A1"), ("Z2", "B1"), ("Z3", "C1"), ("Z4", "D1"),
                  ("Z5", "E1"), ("Z6", "F1"), ("Z7", "A5"), ("Z8", "B5"),
                  ("Z9", "C5"), ("Z0", "D5"), ("Y1", "E5"), ("Y2", "F5"),
                  
                  ("A1", "A2"), ("A2", "A3"), ("A3", "A4"), ("A4", "A5"), 
                  ("B1", "B2"), ("B2", "B3"), ("B3", "B4"), ("B4", "B5"), 
                  ("C1", "C2"), ("C2", "C3"), ("C3", "C4"), ("C4", "C5"),
                  ("D1", "D2"), ("D2", "D3"), ("D3", "D4"), ("D4", "D5"),
                  ("E1", "E2"), ("E2", "E3"), ("E3", "E4"), ("E4", "E5"),
                  ("F1", "F2"), ("F2", "F3"), ("F3", "F4"), ("F4", "F5")
                  ])
    
    # Define positions for visualization
    pos = {
    "EX": (-1, -1),
    "Z1": (-1, 0),
    "Z2": (-1, 1),
    "Z3": (-1, 2),
    "Z4": (-1, 3),
    "Z5": (-1, 4),
    "Z6": (-1, 5),
    "Z7": (5, 0),
    "Z8": (5, 1),
    "Z9": (5, 2),
    "Z0": (5, 3),
    "Y1": (5, 4),
    "Y2": (5, 5),

    "A1": (0, 0),
    "A2": (1, 0),
    "A3": (2, 0),
    "A4": (3, 0),
    "A5": (4, 0),

    "B1": (0, 1),
    "B2": (1, 1),
    "B3": (2, 1),
    "B4": (3, 1),
    "B5": (4, 1),

    "C1": (0, 2),
    "C2": (1, 2),
    "C3": (2, 2),
    "C4": (3, 2),
    "C5": (4, 2),

    "D1": (0, 3),
    "D2": (1, 3),
    "D3": (2, 3),
    "D4": (3, 3),
    "D5": (4, 3),

    "E1": (0, 4),
    "E2": (1, 4),
    "E3": (2, 4),
    "E4": (3, 4),
    "E5": (4, 4),

    "F1": (0, 5),
    "F2": (1, 5),
    "F3": (2, 5),
    "F4": (3, 5),
    "F5": (4, 5)
}
    
    # Add positions as node attributes
    nx.set_node_attributes(g, {node: {'pos': position} for node, position in pos.items()})
    
    return g, pos

# Initialize graph when the server starts
G, pos_dict = initialize_graph()

@app.route('/find_path', methods=['POST'])
def find_path():
    """Find path between two locations in the store"""
    data = request.json
    
    # Get source and target nodes
    start_node = data.get('startNode', 'EX')
    end_node = data.get('endNode', 'EX')
    
    # If coordinates are provided, find closest nodes
    if 'startX' in data and 'startY' in data:
        start_node = find_closest_node(data['startX'], data['startY'])
    
    if 'endX' in data and 'endY' in data:
        end_node = find_closest_node(data['endX'], data['endY'])
    
    try:
        # Find the shortest path
        node_path = nx.shortest_path(G, start_node, end_node)
        
        # Convert to coordinates for frontend visualization
        coord_path = [{'x': pos_dict[node][0], 'y': pos_dict[node][1], 'node': node} 
                     for node in node_path]
        
        return jsonify({
            "path": coord_path,
            "nodes": node_path,
            "startNode": start_node,
            "endNode": end_node
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 404

@app.route('/find_optimized_route', methods=['POST'])
def find_optimized_route():
    try:
        data = request.json
        items = data.get('items', [])
        
        if not items:
            return jsonify({'error': 'No items provided'}), 400
        
        # Start from entrance node or the first item
        start_node = 'EX' if 'EX' in G.nodes() else items[0]
        
        # Initialize path with the starting node
        path = []
        current_node = start_node
        
        # Get position of starting node
        if current_node in G.nodes():
            pos = G.nodes[current_node]['pos']
            path.append({
                'node': current_node, 
                'x': pos[0], 
                'y': pos[1]
            })
        
        # For each item in the sequence
        for i in range(len(items)):
            target = items[i]
            
            # Skip if we're already at this node
            if current_node == target:
                continue
            
            # Find shortest path to the next item
            try:
                shortest = nx.shortest_path(G, source=current_node, target=target)
                
                # Add each node in the shortest path (skipping the first one)
                for j in range(1, len(shortest)):
                    node = shortest[j]
                    pos = G.nodes[node]['pos']
                    path.append({
                        'node': node, 
                        'x': pos[0], 
                        'y': pos[1]
                    })
                
                # Update current node
                current_node = target
                
            except nx.NetworkXNoPath:
                return jsonify({'error': f'No path found from {current_node} to {target}'}), 400
        
        return jsonify({'path': path})
        
    except Exception as e:
        print(f"Error in find_optimized_route: {str(e)}")
        return jsonify({'error': str(e)}), 500

def find_closest_node(x, y):
    """Find the closest node to the given coordinates"""
    min_dist = float('inf')
    closest_node = None
    
    for node, pos in pos_dict.items():
        dist = (pos[0] - x)**2 + (pos[1] - y)**2
        if dist < min_dist:
            min_dist = dist
            closest_node = node
    
    return closest_node

@app.route('/get_nodes', methods=['GET'])
def get_nodes():
    """Return all nodes with their positions"""
    nodes_data = []
    for node in G.nodes():
        x, y = pos_dict[node]
        nodes_data.append({
            "id": node,
            "x": x,
            "y": y
        })
    return jsonify({"nodes": nodes_data})

@app.route('/get_edges', methods=['GET'])
def get_edges():
    """Return all edges for visualization"""
    edges_data = []
    for u, v in G.edges():
        edges_data.append({
            "source": u,
            "target": v,
            "sourceX": pos_dict[u][0],
            "sourceY": pos_dict[u][1],
            "targetX": pos_dict[v][0],
            "targetY": pos_dict[v][1]
        })
    return jsonify({"edges": edges_data})

@app.route('/get_position_scale', methods=['GET'])
def get_position_scale():
    """Return the min/max coordinates to help scale the frontend display"""
    min_x = min(pos[0] for pos in pos_dict.values())
    max_x = max(pos[0] for pos in pos_dict.values())
    min_y = min(pos[1] for pos in pos_dict.values())
    max_y = max(pos[1] for pos in pos_dict.values())
    
    return jsonify({
        "minX": min_x,
        "maxX": max_x,
        "minY": min_y,
        "maxY": max_y,
        "width": max_x - min_x,
        "height": max_y - min_y
    })

@app.route('/find_sequential_path', methods=['POST'])
def find_sequential_path():
    try:
        data = request.json
        items = data.get('items', [])
        
        if not items:
            return jsonify({'error': 'No items provided'}), 400
        
        # Sort items for processing
        sorted_items = items.copy()
        
        # Add entrance/exit points
        sorted_items.insert(0, "EX")
        sorted_items.append("EX")
        
        path = []
        path.append(sorted_items[0])
        
        # Find path through the sequence
        for x in range(len(sorted_items)):
            if x < (len(sorted_items) - 1):
                shortest = nx.shortest_path(G, source=sorted_items[x], target=sorted_items[x + 1])
                print(f"""Shortest path between {sorted_items[x]} and {sorted_items[x + 1]}:
                      {shortest}""")
                
                for i in range(len(shortest)):
                    if i > 0:
                        path.append(shortest[i])
        
        print(f"\nComplete Path:\n{path}")
        
        # Convert path to include coordinates
        full_path = []
        for node in path:
            pos = G.nodes[node]['pos']
            full_path.append({'node': node, 'x': pos[0], 'y': pos[1]})
        
        return jsonify({'path': full_path})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print(f"Graph has {len(G.nodes())} nodes and {len(G.edges())} edges")
    app.run(debug=True, host='0.0.0.0', port=5001)