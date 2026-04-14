---
title: "Dynamic Programming: Not as Scary as It Sounds"
date: 2025-12-30T12:00:00+00:00
author: "Anshik"
description: "Understanding DP through memoization and tabulation - with examples that make sense."
---

### The Big Misconception

Everyone says dynamic programming is hard. And honestly, I get it. The formal definition talks about "optimal substructure" and "overlapping subproblems" and your eyes glaze over.

But here's the truth: DP is just smart recursion. That's it.

### The Core Idea

Let me explain with a simple problem:

**Problem:** Calculate Fibonacci. F(n) = F(n-1) + F(n-2)

Here's the recursive way:

```javascript
function fib(n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}
```

This works, but it's incredibly slow. For fib(40), it recalculates the same values millions of times.

**The fix?** Save what you've already calculated. Don't recompute.

### Memoization - Top-Down Approach

Add a cache. Before computing anything, check if you already know the answer:

```javascript
function fibMemo(n, memo = {}) {
    if (n in memo) return memo[n];
    if (n <= 1) return n;
    
    memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
    return memo[n];
}
```

This changes the time complexity from exponential to O(n). That's massive.

### Tabulation - Bottom-Up Approach

Instead of starting from the big problem and breaking it down, start from the small problems and build up:

```javascript
function fibTab(n) {
    if (n <= 1) return n;
    
    let dp = [0, 1];
    
    for (let i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    
    return dp[n];
}
```

Even better, you can optimize to use only two variables since you only need the previous two values:

```javascript
function fibOptimized(n) {
    if (n <= 1) return n;
    
    let prev2 = 0;
    let prev1 = 1;
    
    for (let i = 2; i <= n; i++) {
        let current = prev1 + prev2;
        prev2 = prev1;
        prev1 = current;
    }
    
    return prev1;
}
```

### A Classic DP Problem: Climbing Stairs

You're at the bottom of stairs with n steps. You can climb 1 or 2 steps at a time. How many distinct ways to reach the top?

Think about it: to reach step n, you either came from n-1 (taking 1 step) or n-2 (taking 2 steps).

```javascript
function climbStairs(n) {
    if (n <= 2) return n;
    
    let prev2 = 1;  // ways to reach step 1
    let prev1 = 2;  // ways to reach step 2
    
    for (let i = 3; i <= n; i++) {
        let current = prev1 + prev2;
        prev2 = prev1;
        prev1 = current;
    }
    
    return prev1;
}
```

See the pattern? We're building up from smaller subproblems.

### The DP Framework

When you see a problem that might need DP, ask yourself:

1. **Can it be broken into subproblems?** 
   - "What's the answer for n? It depends on answers for smaller n"

2. **Do the same subproblems get solved multiple times?**
   - If yes, DP might help

3. **What's the relationship?**
   - Find the recurrence relation

### House Robber - A Real Interview Question

You can't rob two adjacent houses. What's the max you can rob?

```javascript
function rob(nums) {
    if (nums.length === 0) return 0;
    if (nums.length === 1) return nums[0];
    
    let prev2 = 0;
    let prev1 = nums[0];
    
    for (let i = 1; i < nums.length; i++) {
        let current = Math.max(prev1, prev2 + nums[i]);
        prev2 = prev1;
        prev1 = current;
    }
    
    return prev1;
}
```

The logic: at each house, choose between skipping it (keep prev1) or robbing it (add current value to what you had two houses back).

### The Honest Take

DP problems in interviews often look intimidating because:
1. The recurrence relation isn't obvious
2. There are many ways to implement it

But here's the thing - there are only a handful of classic DP patterns. Once you've seen enough of them, you start recognizing the shape.

My advice? Don't try to memorize. Try to understand. Work through the problems, and the patterns will click.