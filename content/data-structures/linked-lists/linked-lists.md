---
title: "Linked Lists: When Arrays Feel Too Restrictive"
date: 2025-12-30T12:00:00+00:00
author: "Anshik"
description: "Why linked lists exist and when you should actually use them instead of arrays."
---

### The Problem with Arrays

Remember how I said arrays are great? Well, they have one annoying limitation - fixed size. In languages like Java and C++, you need to declare the size upfront.

But what if you don't know how much data you'll have? What if you need to add stuff constantly?

This is exactly where linked lists save the day.

### Visualize It This Way

Imagine you're playing treasure hunt. Person A knows where Person B is hiding, Person B knows where Person C is hiding, and so on. You only need to know where A is, and you can find everyone.

That's a linked list. Each element (called a "node") contains:
- The actual data
- A pointer to the next node

```javascript
class ListNode {
    constructor(val) {
        this.val = val;
        this.next = null;
    }
}

// Creating a linked list: 1 -> 2 -> 3 -> null
let node1 = new ListNode(1);
let node2 = new ListNode(2);
let node3 = new ListNode(3);

node1.next = node2;
node2.next = node3;
// Now we have: 1 -> 2 -> 3 -> null
```

### The Trade-off

Here's the thing nobody tells you upfront:

**Arrays:**
- Fast random access (O(1))
- Slow insertions/deletions at the beginning (O(n))
- Fixed size (mostly)

**Linked Lists:**
- Slow random access (O(n)) - gotta walk through!
- Fast insertions/deletions anywhere (O(1))
- Dynamic size - grows as you add

### Traversing a Linked List

This is the bread and butter operation:

```javascript
function printList(head) {
    let current = head;
    while (current !== null) {
        console.log(current.val);
        current = current.next;
    }
}

// Using recursion (kinda cool)
function printListRecursive(node) {
    if (node === null) return;
    console.log(node.val);
    printListRecursive(node.next);
}
```

### Adding a Node at the Beginning

This is where linked lists absolutely shine:

```javascript
function prepend(head, val) {
    let newNode = new ListNode(val);
    newNode.next = head;
    return newNode; // new head
}
```

See that? O(1) - constant time, no matter how long the list is. Try doing that with an array!

### Deleting a Node

Here's a common pattern:

```javascript
function deleteNode(head, val) {
    // Handle if head needs to be deleted
    if (head.val === val) {
        return head.next;
    }
    
    let current = head;
    while (current.next !== null) {
        if (current.next.val === val) {
            current.next = current.next.next;
            return head;
        }
        current = current.next;
    }
    return head;
}
```

### When Should You Actually Use These?

Honestly? Less often than you'd think in real-world coding. But here are genuine use cases:

- When you need constant-time insertions at the beginning
- When you don't know the size upfront
- Implementing stacks and queues (we'll get there)
- In scenarios where memory is tight

The key insight? Linked lists give you flexibility at the cost of random access. Know this trade-off, and you'll make better decisions about which data structure to use.