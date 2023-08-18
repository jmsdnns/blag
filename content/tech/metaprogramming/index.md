---
title: Getting meta with Python
date: 2023-04-01
image: images/tech/metaprogramming.jpg
description: "We will take a walk through one of the more controversial sides of framework design in Python, metaprogramming."
tags:
   - python
   - metaprogramming
---

Metaprogramming is powerful way to have a huge impact with a small amount of code.

This post will explain metaprogramming by building a simple data validation system, similar to Schematics or Pydantic. We will start with a basic Python class and build upwards, solving one problem after another, until we have a data validation framework.

Hold on to your butts cuz it's about to get nneeerrrddyyyy!

# Preview

We want to make someting like the following code work.

```python
class Person(BaseModel):
    name = StringField()
    age = IntField()

    def __init__(self, *a, **kw):
        super(Person, self).__init__(*a, **kw)


# valid field data shouldn't throw errors
p = Person()
p.name = "James"
p.age = 23
p.validate()

# invalid data should
p.age = "mdklfjadf"
try:
    p.validate()
except:
    print("Validation failed")
```

The key ideas here are that we have a _model_, some _typed fields_, and we can validate every field by validating a single model.


# Classes Alone Aren't Enough

Let's start with a basic class.

```python
class SomeModel:
    def __init__(self, x):
        self.x = x


sm = SomeModel(5)
print(sm.x)  # prints 5

sm.x = "meow"
print(sm.x)  # prints meow
```

First consideration: Python is dynamically typed. `sm.x` can be set to anything. Let's try creating a field and set `sm.x` to our field.

```python
class SomeField:
    def __init__(self, value):
        self.value = value
    def validate(self):
        pass  # not yet


sm = SomeModel(SomeField(5))
print(sm.x)           # prints <__main__.SomeField object at 0x112233445566>
print(sm.x.value)     # prints 5
print(sm.x.validate)  # prints <bound method SomeField.validate ...
```

Seems good so far!

```python
sm.x = "meow"
print(sm.x)        # prints meow
print(sm.x.value)  # throws AttributeError!
```

Alas, Python is still dynamically typed...


# Validating Fields

Let's build a simple set of fields with rudimentary validation functions. One for strings and one for integers.


```python
class BaseField:
    pass  # doesn't do anything yet


class StringField(BaseField):
    def validate(self, value):
        if not isinstance(value, str):
            raise Exception("not a string!")


class IntField(BaseField):
    def validate(self, value):
        if not isinstance(value, int):
            raise Exception("not an int!")
```

Using the fields is straight forward enough.

```
>>> sf = StringField()
>>> # VALID DATA
>>> sf.validate("foo")
>>> # INVALID DATA
>>> sf.validate(1)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "<stdin>", line 4, in validate
Exception: not a string!
```

And a simple model, using the fields we just made.

```python
class BaseModel:
    pass  # doesn't do anything yet


class Person(BaseModel):
    name = StringField()
    age = IntField()


p = Person()
```

Validation works, but each field must be called manually to use it.

```python
# StringField
p.name.validate("James")
try:
    p.name.validate(1232)  # fails
except:
    print("we expected that")

# IntField
p.age.validate(23)
try:
    p.age.validate("not a number")  # fails
except:
    print("we expected that")
```

We can see some structure coming together for validating data, but watch what happens when we try to set the name field to "James". We overwrite the value with a string and no longer have a validate method!

``` 
>>> p.name.validate  
<bound method StringField.validate of <__main__.StringField object at 0x7f90bdbe6140>>
>>> 
>>> p.name = "James"  # <--- Overwrites StringField with "James"
>>> 
>>> p.name.validate
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
AttributeError: 'str' object has no attribute 'validate'
```

# Descriptors

We want to prevent our field classes, which have the validation methods, from being overwritten when we set field values. We can do this using Python Descriptors.

From the [Python Guide](https://docs.python.org/3/howto/descriptor.html):
> Descriptors let objects customize attribute lookup, storage, and deletion.

We will turn the fields we wrote earlier into descriptors, and storing the values in a way that doesn't overwrite our field classes. People familiar with object oriented design principles may understand this as implementing getter and setter methods, except the getters and setters are not on the model, they're on the fields themselves.

Descriptors assume we want to store data on the model, though it isn't required, so the descriptor methods receive the model as the first argument. We will use `model._values` to store our field data. Each field instance will also have an attribute, `field_name`, set by the model that maps to values in `model._values`.

```python
class BaseField:
    def __init__(self, field_name):
        self.field_name = field_name

    def __get__(self, model, objtype=None):
        return model._values.get(self.field_name, None)

    def __set__(self, model, value):
        model._values[self.field_name] = value

    def validate(self, value):
        pass
```

We can also improve error reporting by adding the field name.

```python
class StringField(BaseField):
    def validate(self, value):
        if not isinstance(value, str):
            raise Exception(f"{self.field_name} not a string!")


class IntField(BaseField):
    def validate(self, value):
        if not isinstance(value, int):
            raise Exception(f"{self.field_name} not an int!")
```

And finally we'll update the init method for `Person` to create the values dict. Each field is updated to set the field name too.

```python
class Person(BaseModel):
    name = StringField(field_name='name')
    age = IntField(field_name='age')

    def __init__(self):
        self._values = dict()
```

To recap, we have turned our fields into descriptors and used them to implement a different way to get and set values.

```python
>>> p = Person()
>>> p.name = "JmsDnns"
>>> print(p.name)
'JmsDnns'
>>> print(p._values)
{'name': 'JmsDnns'}
```

However, we don't have a way to reach our validate methods anymore

```python
>>> p.name.validate
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
AttributeError: 'str' object has no attribute 'validate'
```

# Field Tracking

We implemented descriptors above by adding a values dict to the model. To access the methods on a field, we will add a fields dict.

```python
class Person(BaseModel):
    name = StringField(field_name="name")
    age = IntField(field_name="age")
    _fields = {
        "name": name,
        "age": age
    }
    def __init__(self):
        self._values = dict()
```

Now we can access the validate method through our fields dict.

```python
>>> p = Person()
>>> print(p._fields['name'].validate)
<bound method StringField.validate of <__main__.StringField object at 0x7f47ed5e6fe0>>
```

And we can validate field data.

```python
>>> p.name = "James"
>>> p._fields['name'].validate(p.name)
```

This works, but it's awkward. Hardcoding `_fields` seems like a bad idea too.


# Metaclasses

Metaprogramming offers a way to clean all of that up and make it automatic. Let's take a look at metaclasses in isolation before using them in our validation system.

Metaclasses subclass `type`, so one way to see them is that you are creating new types. In practice, this means you want some code to run when a class definition is first processed. Not when a class is instantiated, but when Python itself first reads the file _defining_ your classes.

In short, you can run code when someone defines a class, which lets you inspect how that class is defined and prepare meta data about the class, all before someone tries to instantiate it.

That all sounds kind of abstract, doesn't it... Let's use code to make better sense of it.

```python
class BaseMeta(type):
    def __new__(metaclass, name, bases, attrs):
        print("BaseMeta.__new__")
        print("- metaclass:", metaclass)
        print("- name:", name)
        print("- bases:", bases)
        print("- attrs:", attrs)
        return super().__new__(metaclass, name, bases, attrs)


print("--- about to *define* a class")

class Person(metaclass=BaseMeta):
    name = "James"
    age = "23"
    def __init__(self):
        print("Person.__init__")

print("--- class has been defined")

print("--- about to instantiate a class")
p = Person()
print("--- class instantiated")
```

Here is the output from running this code.

```
--- about to *define* a class
BaseMeta.__new__
- metaclass: <class '__main__.BaseMeta'>
- name: Person
- bases: ()
- attrs: {'__module__': '__main__', '__qualname__': 'Person', 'name': 'James', 'age': '23', '__init__': <function Person.__init__ at 0x7fd63938a200>}
--- class has been defined
--- about to instantiate a class
Person.__init__
--- class instantiated
```

Notice that parsing the code that defines Person is what caused `__new__` to execute. We have not instantiated a Person yet.

Metaprogramming in Python is an opportunity to run code when the class is defined, which is awesome if you're building a framework for other programmers. It is popular with frameworks like ORMs precisely because a metaclass can find what fields are defined on a model and map that to SQL column types or generate SQL.


# Typed Fields

OK, back to our data validation system. We'll prepare our fields for using a metaclass.

```python
class BaseField:
    def __get__(self, instance, owner):
        return instance._values.get(self.field_name, None)

    def __set__(self, instance, value):
        instance._values[self.field_name] = value

    def validate(self, value):
        pass


class StringField(BaseField):
    def validate(self, value):
        if isinstance(value, str):
            return True
        raise Exception("not a string!")


class IntField(BaseField):
    def validate(self, value):
        if isinstance(value, int):
            return True
        raise Exception("not an int!")
```

This is almost the same we saw earlier, except fields return True if validation succeeds or they throw an exception if validation fails.

We can see that `__get__` checks instance._values to see if a value exists, or it returns `None`. We can also see that `__set__` just tries to put a value in `instance._values`


```python
class BaseModel:
    def __init__(self, *a, **kw):
        self._values = {}
```

Our base model also creates `self._values` during __init__. Subclasses will have to call super to work properly.

```python
class Person(BaseModel):
    name = StringField()  # notice that field_name is removed
    age = IntField()

    def __init__(self, *a, **kw):
        super(Person, self).__init__(*a, **kw)
```

We also want our code to be neat and clean. To get there, we will have a metaclass that looks at every attribute in our class and it will collect all subclasses of BaseField in `_fields` on the class definition.

The metaclass to do this looks like this:

```python
class BaseMeta(type):
    def __new__(metaclass, name, bases, attrs):
        klass = type.__new__(metaclass, name, bases, attrs)

        klass._fields = {}
        for field_name, field_type in attrs.items():
            if isinstance(field_type, BaseField):
                field_type.field_name = field_name
                klass._fields[field_name] = field_type

        return klass
```

The steps are:
1. create instance of class definition
2. add `_fields` attribute to class definition
3. loop around all attributes looking for instances of `BaseField`
4. for each instance, store the field's name on the field and put it in `_fields`

And here is how a Python classes uses a metaclass.

```python
class BaseModel(metaclass=BaseMeta):
    def __init__(self, *a, **kw):
        self._values = {}


class Person(BaseModel):
    name = StringField()
    age = IntField()

    def __init__(self, *a, **kw):
        super(Person, self).__init__(*a, **kw)
```

Here is the same code we used earlier to define a Person, but now we see that `_fields` is populated automatically.

```python
>>> Person._fields
{
    'name': <__main__.StringField object at 0x7f9ccc6cccc0>,
    'age': <__main__.IntField object at 0x7f9ccc6e9bc0>
}
```

With that in place, we can set values for fields and reach their validate methods.

```python
>>> p = Person()
>>> p.name = "James"
>>> p._fields['name'].validate(p.name)
True
```


# Model Validation

The code above used the validate methods on each field. Our next step is to use the meta values stores in `_fields` and `_values` to make a validate method on the model that validates every field, with cleaner syntax too.

```python
class BaseModel(metaclass=BaseMeta):
    def __init__(self, *a, **kw):
        self._values = {}

    def validate(self):
        for field_name, field_type in self._fields.items():
            if field_name in self._values:
                value = self._values[field_name]
                field_type.validate(value)
        return True
```

We'll need to reinterpret our `Person` definition to use this new base class.

```python
class Person(BaseModel):
    name = StringField()
    age = IntField()

    def __init__(self, *a, **kw):
        super(Person, self).__init__(*a, **kw)
```

And validation now works with a single function on the mdoel.

```python
>>> p = Person()
>>> p.name = "James"
>>> p.age = 23
>>> p.validate()
```


# Conclusion

We have the basis for a whole framework now. We'll put the fields stuff in `fields.py` and the models stuff in `models.py`.

## `fields.py`

```python
class BaseField:
    def __get__(self, instance, owner):
        return instance._values.get(self.field_name, None)

    def __set__(self, instance, value):
        instance._values[self.field_name] = value

    def validate(self, value):
        pass


class StringField(BaseField):
    def validate(self, value):
        if isinstance(value, str):
            return True
        raise Exception(f"StringField ({self.field_name}) not a string: {value}")


class IntField(BaseField):
    def validate(self, value):
        if isinstance(value, int):
            return True
        raise Exception(f"IntField ({self.field_name}) not an int: {value}")
```

## `models.py`

```python
from fields import BaseField

class BaseMeta(type):
    def __new__(metaclass, name, bases, attrs):
        klass = type.__new__(metaclass, name, bases, attrs)
        klass._fields = {}

        for field_name, field_type in attrs.items():
            if isinstance(field_type, BaseField):
                field_type.field_name = field_name
                klass._fields[field_name] = field_type

        return klass


class BaseModel(metaclass=BaseMeta):
    def __init__(self, *a, **kw):
        self._values = {}

    def validate(self):
        for field_name, field_type in self._fields.items():
            if field_name in self._values:
                value = self._values[field_name]
                field_type.validate(value)
        return True
```

## Using It

Remember that code we had at the beginning of that post? We're going to write that now and show that it works.

```python
from fields import StringField, IntField
from models import BaseModel


class Person(BaseModel):
    name = StringField()
    age = IntField()

    def __init__(self, *a, **kw):
        super(Person, self).__init__(*a, **kw)


p = Person()
p.name = "James"
p.age = 23


print("VALID DATA")
print(f"Is valid? {p.validate()}") 


print("INVALID DATA")
try:
    p.age = "mdklfjadf"
    print(f"Is valid? {p.validate()}") 
except Exception as e:
    print(f"Is valid? False. {e}")
```

Here is the output.

```
VALID DATA
Is valid? True
INVALID DATA
Is valid? False. IntField (age) not an int: mdklfjadf
```
