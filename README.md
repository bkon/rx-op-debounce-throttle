# Description

A hybrid debounce + throttle operator for RxJS

```
debounceThrottle(windowSize, scheduler)
```

Emits  the first  item  from the  source  observable, then  suppresses
emissions for `windowSize` duration, then emits the last item from the
source observable (if any) in the window.

# Use case

When implementing UI animation (in particular, using
ReactTransitionGroup in React), you're typically dealing with
effects with fixed duration.

Let's say you have a list of elements rendered using some data from
applicatio state and you're applying some animated effect when an
element is moved to a new position.  Your frontend cannot make any
assumptions on how often this data is updated, so it's technically
possible that element position is updated several times in a quick
succession.  Without throttling this would result in a interrupted and
re-started animation.

If you apply debounce operator, you might end delaying animation
indefinitely, if state changes often enough.

If you apply throttle operator, you might end up losing and never
displaying the last state.

This  hybrid operator  allows  you to  start  the effect  immediately,
guarantees that animation  will have enough time to  complete and that
the last state will be eventually properly rendered to the user.

# Marble diagram

```
IN:  a----b----c---|
OUT: a----b----c---|
```

```
IN:  abc---de-f----|
OUT: a---c---e---f-|
```

```
IN:  abc------def--|
OUT: a---c----d---f|
```

# Installation

Use `npm` or `yarn`

```
npm install --save rx-op-throttle-debounce
yarn add rx-op-throttle-debounce
```

# Usage

```
import { throttleDebounceLet, throttleDebounceOp } from "rx-op-throttle-debounce";

out$ = in$.let(throttleDebounceLet(100));
out$ = in$::throttleDebounceOp(100);
```

or, if you're feeling lucky:

```
Observable.prototype.throttleDebounce = throttleDebounceOp;
out$ = in$.throttleDebounce(100);
```
