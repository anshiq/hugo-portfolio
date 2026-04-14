---
title: "Sorting Algorithms: More Than Just .sort()"
date: 2025-12-30T12:00:00+00:00
author: "Anshik"
description: "Understanding how sorting actually works - from bubble sort to quicksort."
---

### Let's Be Honest

Most of the time, you just call `.sort()` and call it a day. That's completely fine for real-world work.

But here's the thing - understanding sorting algorithms makes you a better developer. It teaches you about trade-offs, optimization, and algorithmic thinking. Plus, it comes up in interviews.

So let's break down the big ones.

### Bubble Sort - The Intuitive One

This is how most people would sort things if they had to do it manually. Compare adjacent elements, swap if needed, repeat:

```javascript
function bubbleSort(arr) {
    let n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                // Swap
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
    return arr;
}
```

Time complexity: O(n²) worst/average case.

Yes, it's slow. But it's easy to understand, and it does tell you something about how sorting works.

### Selection Sort - Find the Minimum

Instead of comparing everything, find the smallest element and put it first. Then find the next smallest:

```javascript
function selectionSort(arr) {
    let n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        
        for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        
        // Swap
        let temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
    }
    return arr;
}
```

Time complexity: Always O(n²). But it does fewer swaps than bubble sort.

### Insertion Sort - Like Sorting Playing Cards

If you've ever sorted playing cards in your hand, you already know this algorithm. Take each element and insert it in the right position among the sorted elements:

```javascript
function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        let key = arr[i];
        let j = i - 1;
        
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        
        arr[j + 1] = key;
    }
    return arr;
}
```

Time complexity: O(n²) worst case, but O(n) best case (already sorted!).

**Why this matters:** This is actually what JavaScript's `.sort()` uses under the hood for small arrays. It's great for nearly sorted data.

### Merge Sort - Divide and Conquer

This is where things get interesting. Split the array in half, sort each half, merge them back together:

```javascript
function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    
    let mid = Math.floor(arr.length / 2);
    let left = mergeSort(arr.slice(0, mid));
    let right = mergeSort(arr.slice(mid));
    
    return merge(left, right);
}

function merge(left, right) {
    let result = [];
    let i = 0, j = 0;
    
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i]);
            i++;
        } else {
            result.push(right[j]);
            j++;
        }
    }
    
    return result.concat(left.slice(i)).concat(right.slice(j));
}
```

Time complexity: Always O(n log n). The downside? It needs extra space.

### Quick Sort - The Industry Favorite

This is what most libraries use. Pick a pivot, partition around it, recursively sort the partitions:

```javascript
function quickSort(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        let pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
    return arr;
}

function partition(arr, low, high) {
    let pivot = arr[high];
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
}
```

Time complexity: O(n log n) average, O(n²) worst case (but rarely happens with good pivot selection).

**In-place** - doesn't need extra space like merge sort.

### What Should You Actually Use?

In JavaScript: Just use `.sort()`. It's implemented as TimSort (a hybrid of merge and insertion sort) and handles edge cases well.

For interviews: Understand the trade-offs. QuickSort is popular because it's in-place. MergeSort is stable and great for linked lists. InsertionSort is perfect for small or nearly-sorted arrays.

The point isn't to memorize these. It's to understand when each one makes sense.