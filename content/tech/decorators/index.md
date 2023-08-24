---
title: Decorators 101
draft: false
image: images/tech/decorators/decorators-101.jpg
date: 2023-08-21
description: "Python decorators are initially a mystery, but they're basically middleware with weird syntax."
tags:
   - python
---

It is underappreciated that Python decorators are syntactic sugar for function wrappers. People new to Python usually encounter them first by writing like `@foo` above a function `bar` and observing that `bar` behaves differently than it used to.

More tangibly, using the `@foo` decorator on `bar` looks like this.

```python
@foo
def bar():
    print("hello!")
```

To understand decorators is to understand function wrappers, but understanding those requires being comfortable with _first class objects_, so we'll start there. We will then explain function wrappers, using an example `time_it` that determines how long it takes for a function to complete. We then use decorator syntax to apply our wrapper in a clean, elegant way.


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

Using this, we can wrap `fac` and `meow` to make `timed_fac` and `timed_meow`.

```python
>>> timed_fac = time_it(fac)
>>> timed_meow = time_it(meow)
```

And calling them is the same as if they weren't wrapped.

```python
>>> result = timed_fac(100)
0:00:00.000075
>>> result
93326215443944152681699238856266700490715968264381621468592963895217599993229915608941463976156518286253697920827223758251185210916864000000000000000000000000
>>> result = timed_meow(100)
0:00:00.000012
>>> result
'meowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeow'
```

We're almost at a clean system. The model we've described so far would require code changes, from `meow` to `timed_meow` and versa vice to enable/disable the wrapper.

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

Next, we'll wrap it and see that it works the same way.

```python
>>> meow = time_it(meow)
>>> result = meow(100)
0:00:00.000014
>>> result
'meowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeowmeow'
```


# Decorator Syntax

Here is the `meow` function again, with the wrapper applied immediately after definition.

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

To implement a decorator you write a callable that returns a callable, and you choose to use decorator syntax to apply it. That's it.


## Stacking Decorators

You can stack them too. This approach uses decorators as syntax for middleware.

```python
@time_it
@is_authenticated
@return_500_on_error
def some_web_handler(request, context):
    ...
```

The order of the stack works bottom-up, so `return_500_on_error` would wrap the function, then `is_authenticated` wraps the wrapped function, etc.

Here is a more tangible example.

```python
>>> def A(func):
...     print("A is wrapping")
...     def wrapper():
...         print("A")
...         func()
...         print("A")
...     return wrapper
... 
>>> 
>>> def B(func):
...     print("B is wrapping")
...     def wrapper():
...         print("B")
...         func()
...         print("B")
...     return wrapper
... 
>>> 
>>> # Note that B is above A here
>>> @B
... @A
... def foo():
...     print("foo")
... 
A is wrapping
B is wrapping
>>> 
>>> foo()
B
A
foo
A
B
```

I hope you feel that some of the mystery of decorators has gone away and I hope that you already have ideas for using decorators in your work.
