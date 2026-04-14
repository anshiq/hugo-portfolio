---
title: "Trees: The Hierarchical Data Structure"
date: 2025-12-30T12:00:00+00:00
author: "Anshik"
description: "Understanding trees - from binary trees to BST operations."
---

### What Even Is a Tree?

Before we dive in, let's clear up what a tree isn't - it's not the data structure with data in rows.

A tree is hierarchical. Think of an org chart. You have a boss at the top, managers below them, employees below those. One person reports to exactly one manager (usually), but manages multiple people.

That's a tree structure.

### Tree Terminology - Keep It Simple

- **Root**: The top node (the big boss)
- **Children**: Nodes below a parent
- **Leaf**: A node with no children
- **Height**: How many levels down it goes
- **Depth**: How far from the root

```javascript
// Visual representation:
        root
       /    \
     A       B    <- level 1
    / \     / \
   C   D   E   F  <- level 2 (leaves)
```

### Binary Trees - Each Node Has At Most 2 Children

This is the most common tree you'll work with:

```javascript
class TreeNode {
    constructor(val) {
        this.val = val;
        this.left = null;
        this.right = null;
    }
}

// Building a small tree:
//       1
//      / \
//     2   3

let root = new TreeNode(1);
root.left = new TreeNode(2);
root.right = new TreeNode(3);
```

### Traversing Trees - Three Ways

This is where people get confused, but it's actually straightforward:

```javascript
// 1. DFS - Depth First Search (go deep before wide)

// Pre-order: Root -> Left -> Right
function preOrder(node) {
    if (node === null) return;
    console.log(node.val);
    preOrder(node.left);
    preOrder(node.right);
}

// In-order: Left -> Root -> Right
function inOrder(node) {
    if (node === null) return;
    inOrder(node.left);
    console.log(node.val);
    inOrder(node.right);
}

// Post-order: Left -> Right -> Root
function postOrder(node) {
    if (node === null) return;
    postOrder(node.left);
    postOrder(node.right);
    console.log(node.val);
}

// 2. BFS - Breadth First Search (level by level)
function levelOrder(root) {
    if (!root) return;
    
    let queue = [root];
    while (queue.length > 0) {
        let node = queue.shift();
        console.log(node.val);
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
    }
}
```

### Binary Search Tree (BST) - The Organized One

Here's where trees actually become useful. In a BST:
- Left child is smaller than parent
- Right child is larger than parent

This makes searching fast:

```javascript
class BST {
    constructor() {
        this.root = null;
    }
    
    insert(val) {
        let newNode = new TreeNode(val);
        if (!this.root) {
            this.root = newNode;
            return;
        }
        
        let current = this.root;
        while (true) {
            if (val < current.val) {
                if (!current.left) {
                    current.left = newNode;
                    return;
                }
                current = current.left;
            } else {
                if (!current.right) {
                    current.right = newNode;
                    return;
                }
                current = current.right;
            }
        }
    }
    
    search(val) {
        let current = this.root;
        while (current) {
            if (val === current.val) return true;
            if (val < current.val) {
                current = current.left;
            } else {
                current = current.right;
            }
        }
        return false;
    }
}
```

### Why BSTs Are Cool

In a balanced BST, search is O(log n). That's because you cut half the tree with each step. Compare that to a linked list where you'd have to check every element.

The catch? You need to keep the tree balanced, otherwise it degrades to O(n). That's why things like AVL trees and Red-Black trees exist - they self-balance.

But for now? Understanding BST operations is your foundation. Build from there.