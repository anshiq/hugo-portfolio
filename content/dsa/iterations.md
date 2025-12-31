---
title: "Array Iterations Types to get different outputs"
date: 2025-12-30T12:00:00+00:00
author: "Anshik"
description: "Array Iterations Types to get different outputs."
---

### 1. To merge some contiguous sequence

```javascript
intervals = [[1,3],[2,6],[8,10],[15,18]]
// how to iterate so we can merge the interval of intersection
// take a prev 
prev = [1,3]
ans = [[]]
// iterate over it
for( let i = 1 ; i< intervals.length; i++){
      if(intervals[i][0]<=prev[1]){ // merge over condition
            if(intervals[i][1]>prev[1]){
                prev[1]=intervals[i][1];
            } // OR choose end of both comparing elements 
        } else { // else if can't be merged then do the thing
            ans = append(ans,prev);
            prev = intervals[i];
        }
}
ans = append(ans,prev); // prev has value but not pushed 

```