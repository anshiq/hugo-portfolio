---
title: "Stacks and Queues: LIFO and FIFO Explained"
date: 2025-12-30T12:00:00+00:00
author: "Anshik"
description: "Understanding the mental models behind stacks and queues - simpler than you think."
---

### The Basic Idea

Alright, let's get into two of the most intuitive data structures you're gonna meet - stacks and queues.

Think about stacking plates at a buffet. You put plates on top, and when you need one, you take from the top. Last one in, first one out. That's a stack.

Now think about a line at a movie theater. First person in line gets the ticket first. First in, first out. That's a queue.

Simple, right?

### Stack - Last In First Out (LIFO)

```javascript
class Stack {
    constructor() {
        this.items = [];
    }
    
    push(element) {
        this.items.push(element);
    }
    
    pop() {
        return this.items.pop();
    }
    
    peek() {
        return this.items[this.items.length - 1];
    }
    
    isEmpty() {
        return this.items.length === 0;
    }
}

// Usage
let stack = new Stack();
stack.push(1);
stack.push(2);
stack.push(3);
console.log(stack.pop()); // 3 - last one we added!
console.log(stack.peek()); // 2 - can look without removing
```

### Queue - First In First Out (FIFO)

```javascript
class Queue {
    constructor() {
        this.items = [];
    }
    
    enqueue(element) {
        this.items.push(element);
    }
    
    dequeue() {
        return this.items.shift();
    }
    
    front() {
        return this.items[0];
    }
    
    isEmpty() {
        return this.items.length === 0;
    }
}

// Usage
let queue = new Queue();
queue.enqueue(1);
queue.enqueue(2);
queue.enqueue(3);
console.log(queue.dequeue()); // 1 - first one we added!
```

### Real-World Applications

Where do you actually see these?

**Stacks:**
- Undo functionality in editors
- Browser history (back button)
- Function call stack in programming
- Expression evaluation

**Queues:**
- Print job spooling
- Task scheduling
- BFS (Breadth-First Search) in graphs
- Handling requests in web servers

### Using Stacks to Check Balanced Parentheses

This is a classic interview question, and it makes perfect sense once you see it:

```javascript
function isBalanced(str) {
    let stack = [];
    let pairs = {')': '(', '}': '{', ']': '['};
    
    for (let char of str) {
        if (char === '(' || char === '{' || char === '[') {
            stack.push(char);
        } else if (char === ')' || char === '}' || char === ']') {
            if (stack.length === 0 || stack.pop() !== pairs[char]) {
                return false;
            }
        }
    }
    return stack.length === 0;
}

console.log(isBalanced("({[]})")); // true
console.log(isBalanced("({)}"));  // false
```

### The Beautiful Thing About These

Both can be implemented with arrays (just with different access patterns), or with linked lists for better performance. But here's what matters - they're not about fancy operations. They're about enforcing a specific access order.

Sometimes you need LIFO. Sometimes you need FIFO. The data structure makes your intention clear.

And that clarity? That's worth more than any optimization.