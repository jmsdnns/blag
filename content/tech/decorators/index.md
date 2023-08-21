---
title: Decorators 101
draft: true
image: images/tech/decorators.jpg
date: 2023-08-21
description: "Python decorators are initially a mystery, but they're basically middleware with weird syntax."
tags:
   - python
---

It is underappreciated that Python decorators are syntactic sugar for function wrappers. People new to Python usually encounter them first by writing `@something` above a function and observing that the function does more than it used to, with little explanation for how that `@something` does what it does. We will demystify what's taking place in this post.

This post will explain will explain what they are and how to make them.


# First Class Objects

First, let's consider Python functions as [_first class objects_](https://en.wikipedia.org/wiki/First-class_function). This means they can be passed around like variables and given as arguments to function calls.

```python
def take5():
    return "take five"

def greet(name, greet_func):
    greeting = greet_func()
    return f"{name}, {greeting}"
```

We pass the `take5` function as an argument when we call `greet`, which looks like this.

```python
>>> greet("james", take5)
james, take five
```

# Wrapping A Function

Let's say we want to understand how long two functions `fac` and `meow` take to run. We could write a function that checks the time, calls `fac` or `meow`, and checks the time again when they're done to print how long the function took to run.

First, `fac` and `meow`. Two functions that take some time to run.

```python
def fac(n):
    return n * fac(n-1) if n > 0 else 1

def meow(n):
    return "meow" * n
```

And a function that times how long other functions take.

```python
from datetime import datetime

def time_it(func, *args):
    start = datetime.now()  # record time before calling func
    output = func(*args)    # call func and store output
    end = datetime.now()    # record time after calling func
    print(end - start)      # print the difference
    return output           # give the output from func to caller
```

Let's time `fac(100)`

```python
>>> result = time_it(fac, 100)
0:00:00.000073
>>> result
93326215443944152681699238856266700490715968264381621468592963895217599993229915608941463976156518286253697920827223758251185210916864000000000000000000000000
```

And let's time `meow(100)`

```python
>>> result = time_it(meow, 100)
0:00:00.000012
>>> result
'meowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeow'
>>>
```

# Working With Wrappers

To _wrap_ a function is to call the function you want by calling some intermediary that adds logic and calls the function you want. We can do this in Python with code that looks similar to the snippet below.

```python
def outer(func):
    def wrapper(func, arg):
        # ...
        # some code that runs before func
        # ...
        
        output = func(arg)
        
        # ...
        # some code that runs after func
        # ...

        # return whatever we got when we called func
        return output

    # return the wrapped function
    return wrapper
```

Let's convert `time_it` into a wrapper.

```python
def time_it(func):
    def wrapper(args):
        start = datetime.now()  # record time before func
        output = func(args)
        end = datetime.now()    # record time after func
        print(end - start)      # print the difference
        return output
    return wrapper
```

Now we can make `timed_fac` and `timed_meow` and simplify what it means to call them each time.

```python
>>> timed_fac = time_it(fac)
>>> timed_meow = time_it(meow)
>>> result = timed_fac(100)
0:00:00.000075
>>> result
93326215443944152681699238856266700490715968264381621468592963895217599993229915608941463976156518286253697920827223758251185210916864000000000000000000000000
>>> result = timed_meow(100)
0:00:00.000012
>>> result
'meowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeow'
```

## Awkward

We're almost at a clean system. The model we've described so far would require code changes, from `meow` to `timed_meow`, to enable/disable the wrapper.

Pretend there's an infomercial.gif here.<br>
_There's got to be a better way!_

We can keep things simple by overwriting the `meow` function _with_ the wrapped `meow` function. Callers wouldn't know the difference, because they call a function named `meow` if the wrapper is on or if it's off.

Here is the function before wrapping it.

```python
>>> def meow(n):
>>>     return "meow" * n
>>>
>>> result = meow(100)
>>> result
'meowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeow'
```

Now we'll wrap it and call the exact same way.

```python
>>> meow = time_it(meow)
>>> result = meow(100)
0:00:00.000014
>>> result
'meowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeow'
```

# Decorator Syntax

Here is the `meow` funciton again, with the wrapper applied immediately after definition.

```python
def meow(n):
    return "meow" * n

meow = time_it(meow)
```

Believe it or not, we have already done all the work necessary to use decorator syntax, eg `@time_it`.

```python
@time_it
def meow(n):
    return "meow" * n
```

To implement a decorator you write a callable that returns a callable, and then you use decorator syntax to apply it.

That's it.

You can stack them too. This approach to implementing software allows decorators to function nicely as syntax for middleware.

```python
@time_it
@is_authenticated
@return_500_on_error
def some_web_handler(request, context):
    ...
```

I hope you feel that some of the mystery of decorators is removed and that you already have ideas for using them in your work.
