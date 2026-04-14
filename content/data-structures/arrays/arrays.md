---
title: "Array Basics: The Foundation of DSA"
date: 2025-12-30T12:00:00+00:00
author: "Anshik"
description: "Understanding arrays from scratch - why they matter and how to use them effectively."
---

### What's the Big Deal About Arrays?

Alright, let's talk about arrays. If you're starting your DSA journey, arrays are literally where it all begins. They're the bread and butter of programming - simple, fast, and everywhere.

An array is basically a container that holds multiple values of the same type. Think of it like a row of lockers, each with a number. You know exactly where everything is.

```javascript
// This is how you create an array
let numbers = [1, 2, 3, 4, 5];
console.log(numbers[0]); // 1 - the first element
console.log(numbers[4]); // 5 - the last element
```

### Why Arrays Matter

Here's the thing about arrays that makes them special - they're stored in contiguous memory. What does that mean? Well, imagine a long hallway with rooms next to each other. When your computer needs to access any element, it can calculate exactly where it is in memory. No searching needed.

This is why array access is O(1) - constant time. Pretty sweet, right?

### Common Array Operations

Let me walk you through some basic operations you'll use all the time:

```javascript
// Adding elements
numbers.push(6);        // adds to end - O(1)
numbers.unshift(0);     // adds to start - O(n) - shifts everything!

// Removing elements
numbers.pop();          // removes from end - O(1)
numbers.shift();        // removes from start - O(n)

// Finding stuff
numbers.indexOf(3);     // returns 2, or -1 if not found
numbers.includes(3);    // returns true/false
```

### The Two Pointer Technique

This is one of those patterns you'll use constantly. The idea is simple - use two pointers starting at different positions and move them toward each other.

```javascript
// Reverse an array in place
function reverseArray(arr) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left < right) {
        // Swap elements
        let temp = arr[left];
        arr[left] = arr[right];
        arr[right] = temp;
        
        left++;
        right--;
    }
    return arr;
}
```

### When Arrays Aren't Enough

Here's an honest truth - arrays are great, but they have limitations. Adding something to the beginning is slow (O(n)). The size is fixed in many languages.

But don't worry about that yet. Master arrays first. Once you really understand how they work, everything else builds on top of this knowledge.

The key takeaway? Arrays give you lightning-fast access by index, but come with the cost of being static in size. Know when to use them, and you'll be golden.