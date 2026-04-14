---
title: "Searching Algorithms: Finding Things Efficiently"
date: 2025-12-30T12:00:00+00:00
author: "Anshik"
description: "From linear search to binary search - understanding how to find things fast."
---

### The Search Problem

At its core, every search problem is simple: find the thing I'm looking for.

The question is: how fast can you do it? And that entirely depends on whether your data is sorted or not.

### Linear Search - The Obvious Way

Just look at everything one by one. Not elegant, but it works:

```javascript
function linearSearch(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) {
            return i;
        }
    }
    return -1;
}
```

Time complexity: O(n)

The honest truth? This is what you do most of the time in real code. Iterate through, check if it matches.

### Binary Search - The Game Changer

Here's the magic trick. If your data is sorted, you don't need to check every element. Just cut the search space in half each time:

```javascript
function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        
        if (arr[mid] === target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1;
}
```

Time complexity: O(log n)

**Wait - why does this work?** Because the array is sorted. If the middle element is bigger than what I'm looking for, I know everything to the right is also too big. Throw it away. Keep looking left.

### The Recursive Version

Sometimes recursion is cleaner to understand:

```javascript
function binarySearchRecursive(arr, target, left = 0, right = arr.length - 1) {
    if (left > right) return -1;
    
    let mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) {
        return binarySearchRecursive(arr, target, mid + 1, right);
    }
    return binarySearchRecursive(arr, target, left, mid - 1);
}
```

### Finding Insert Position

A common variation: instead of finding an exact match, find where the element should go:

```javascript
function searchInsertPosition(arr, target) {
    let left = 0;
    let right = arr.length;
    
    while (left < right) {
        let mid = Math.floor((left + right) / 2);
        
        if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    
    return left;
}
```

### Lower Bound and Upper Bound

Sometimes you need more than just "is it there?" You need to find the first occurrence or last occurrence:

```javascript
// First position where arr[i] >= target
function lowerBound(arr, target) {
    let left = 0, right = arr.length;
    
    while (left < right) {
        let mid = Math.floor((left + right) / 2);
        if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    return left;
}

// First position where arr[i] > target
function upperBound(arr, target) {
    let left = 0, right = arr.length;
    
    while (left < right) {
        let mid = Math.floor((left + right) / 2);
        if (arr[mid] <= target) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    return left;
}
```

### Two Sum with Binary Search

Here's a practical use case - finding two numbers that add up to a target:

```javascript
function twoSum(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        let complement = target - arr[i];
        
        // Binary search for the complement
        let result = binarySearch(arr, complement);
        
        if (result !== -1 && result !== i) {
            return [i, result];
        }
    }
    return [];
}
```

Time: O(n log n) - sort of a classic approach.

### When to Use What

- **Unsorted data?** Linear search is your only option (unless you sort first)
- **Sorted data?** Binary search all the way
- **Search needs to be super fast?** Consider a hash map instead

The key insight with binary search is this: it's not about the array, it's about the search space. As long as you can eliminate half the possibilities each step, you get O(log n).

That idea shows up in a lot more places than you'd expect.