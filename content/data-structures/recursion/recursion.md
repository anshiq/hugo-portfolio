---
title: "Recursion: The Art of Thinking Small"
date: 2025-12-30T12:00:00+00:00
author: "Anshik"
description: "Understanding recursion through practical examples - base cases and recursive cases."
---

### What Recursion Actually Means

Recursion is when a function calls itself. Simple definition, but the mental model is what matters.

Instead of solving a big problem directly, solve a smaller version of the same problem. Then use that solution to build up to the big problem.

### The Two Essential Parts

Every recursive function needs:

1. **Base Case**: When to stop. The smallest version of the problem where the answer is obvious.
2. **Recursive Case**: How to break the problem down and call itself with smaller input.

```javascript
function countDown(n) {
    // Base case: when n reaches 0, stop
    if (n === 0) {
        console.log("Done!");
        return;
    }
    
    // Recursive case: do something, then call with smaller n
    console.log(n);
    countDown(n - 1);
}

countDown(5);
// Output: 5, 4, 3, 2, 1, Done!
```

Without a base case, you'd have infinite recursion (and a stack overflow).

### A Simple Example: Factorial

5! = 5 × 4 × 3 × 2 × 1 = 120

```javascript
function factorial(n) {
    // Base case
    if (n <= 1) return 1;
    
    // Recursive case
    return n * factorial(n - 1);
}
```

What happens?
- factorial(5) = 5 * factorial(4)
- factorial(4) = 4 * factorial(3)
- factorial(3) = 3 * factorial(2)
- factorial(2) = 2 * factorial(1)
- factorial(1) = 1 (base case!)

Then it unwinds: 1 → 2 → 6 → 24 → 120

### Sum of Array - Two Ways

```javascript
// Recursive way
function sumArray(arr, index = 0) {
    // Base case: empty array
    if (index >= arr.length) return 0;
    
    // Add current element + sum of rest
    return arr[index] + sumArray(arr, index + 1);
}

// Iterative way (for comparison)
function sumArrayIterative(arr) {
    let sum = 0;
    for (let num of arr) {
        sum += num;
    }
    return sum;
}
```

### Reverse a String Recursively

This is a fun one:

```javascript
function reverseString(str) {
    // Base case
    if (str === "") return "";
    
    // Recursive case: last character + reverse of rest
    return str[str.length - 1] + reverseString(str.substring(0, str.length - 1));
}
```

### When Recursion Actually Shines

Recursion isn't always the answer, but it's beautiful in certain scenarios:

**1. Tree Traversals**
```javascript
// DFS in a tree
function traverse(node) {
    if (node === null) return;
    
    traverse(node.left);   // Process left subtree
    console.log(node.val); // Process current node
    traverse(node.right);  // Process right subtree
}
```

**2. Permutations/Combinations**
```javascript
// Generate all permutations of a string
function permute(str, result = "") {
    if (str.length === 0) {
        console.log(result);
        return;
    }
    
    for (let i = 0; i < str.length; i++) {
        permute(str.slice(0, i) + str.slice(i + 1), result + str[i]);
    }
}
```

**3. Divide and Conquer**
```javascript
// Binary search recursively
function binarySearch(arr, target, left = 0, right = arr.length - 1) {
    if (left > right) return -1;
    
    let mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) {
        return binarySearch(arr, target, mid + 1, right);
    }
    return binarySearch(arr, target, left, mid - 1);
}
```

### The Call Stack

Here's something they don't explain well in textbooks. Every recursive call adds a new frame to the call stack. It keeps track of:
- The function's parameters
- Its local variables
- Where to return to when done

The problem? Stack space is limited. Too many recursive calls = stack overflow.

Tail recursion is an optimization where the recursive call is the last thing the function does. Some languages (not JavaScript) optimize this to reuse the stack frame.

### When to Use Recursion

**Yes:**
- Tree/graph traversal
- Problems that naturally break into subproblems
- When the solution is cleaner recursively

**No:**
- When iteration is simpler (factorial, sum)
- When stack overflow is a risk
- When you need maximum performance

### The Takeaway

Recursion is a way of thinking more than a technique to memorize. The key is:
1. Figure out the base case (when do I stop?)
2. Figure out the recursive case (how do I make the problem smaller?)
3. Trust that the recursive call does its job

That's really all there is to it.