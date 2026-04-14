---
title: "Graphs: Connecting the Dots"
date: '2026-04-07T12:49:24+05:30'
author: "Anshik"
description: "Understanding graph representations, BFS, DFS, and when graphs are the right tool."
---

### What Are Graphs Actually?

After trees, graphs are the next big thing. And honestly, they're everywhere.

Your Facebook friends? That's a graph. Cities connected by roads? Graph. The internet? Massive graph. Even the molecules in your body - yep, graphs.

The key difference from trees? Graphs can have cycles. You can go from A to B to C and somehow loop back to A.

### Graph Terminology (Keep It Simple)

- **Vertex/Node**: A point in the graph (the circle)
- **Edge**: The line connecting vertices
- **Degree**: How many edges connected to a vertex
- **Path**: A sequence of vertices you can travel
- **Cycle**: A path that returns to where you started

### How Do You Actually Represent These?

There are two main ways, and both show up in interviews:

```javascript
// 1. Adjacency List - More common, saves space
// For a graph: A connected to B and C, B connected to A and D

let adjacencyList = {
    'A': ['B', 'C'],
    'B': ['A', 'D'],
    'C': ['A'],
    'D': ['B']
};

// 2. Adjacency Matrix - Good for dense graphs
// 0 means no connection, 1 means connected
let matrix = [
    [0, 1, 1, 0],  // A: connects to B(1), C(2)
    [1, 0, 0, 1],  // B: connects to A(0), D(3)
    [1, 0, 0, 0],  // C: connects to A(0)
    [0, 1, 0, 0]   // D: connects to B(1)
];
```

### BFS - Breadth-First Search

This is like checking all your immediate friends first, then friends of friends. Level by level:

```javascript
function bfs(graph, start) {
    let visited = new Set();
    let queue = [start];
    visited.add(start);
    
    while (queue.length > 0) {
        let vertex = queue.shift();
        console.log(vertex); // Do something with this vertex
        
        for (let neighbor of graph[vertex]) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }
}
```

**When to use BFS:**
- Shortest path in unweighted graphs
- Finding if path exists
- Level-order traversal

### DFS - Depth-First Search

This is like exploring a cave. You go as deep as possible before backtracking:

```javascript
// Recursive approach
function dfs(graph, start, visited = new Set()) {
    visited.add(start);
    console.log(start); // Do something
    
    for (let neighbor of graph[start]) {
        if (!visited.has(neighbor)) {
            dfs(graph, neighbor, visited);
        }
    }
}

// Iterative approach (using stack)
function dfsIterative(graph, start) {
    let visited = new Set();
    let stack = [start];
    
    while (stack.length > 0) {
        let vertex = stack.pop();
        
        if (!visited.has(vertex)) {
            visited.add(vertex);
            console.log(vertex);
            
            // Add neighbors in reverse for consistent order
            graph[vertex].forEach(neighbor => {
                if (!visited.has(neighbor)) {
                    stack.push(neighbor);
                }
            });
        }
    }
}
```

**When to use DFS:**
- Detecting cycles
- Topological sorting
- Solving puzzles with only one solution
- Finding strongly connected components

### The Honest Truth

Graph problems can get intimidating real fast. But here's what I've noticed - most graph interview questions are really just:
- Know how to represent the graph
- Apply BFS or DFS correctly
- Maybe modify the traversal slightly

The key is understanding when to use which traversal. That's 80% of graph problems right there.