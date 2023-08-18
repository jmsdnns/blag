---
title: MultiVenv
date: 2023-08-04
image: images/tech/multivenv.jpg
description: "I replaced virtualenvwrapper with 100 lines of bash"
tags:
   - python
---

I replaced virtualenvwrapper with 100 lines of bash, simplifying the core experience into something you can drop on any box without installing anything.


# A VirtualEnv Wrapper

I was a fan of [virtualenvwrapper](https://github.com/python-virtualenvwrapper/virtualenvwrapper/) (_VEW_) for years. I attribute having an unusually smooth experience with Python to always using VEW for development. VEW made it easy to have virtualenvs (_venvs_) that were unobtrusive.

My favorite aspect of the project is that it would store every venv together in a common directory, making it easy to manage or search them separately from a project. That may seem like a small detail, but I loved the freedom I got to ensure text searches in the project wouldn't include whatever it found in the venvs. Keeping env directories outside my project directory meant that, by default, I didn't have to use any cli flags to ignore a directory, or configure VSCode to ignore some directory, etc.

The project was started at a time when venvs themselves were also a new idea, and not yet included in a standard Python install. It feels unnecessarily heavy today, so I wanted to see if I could build something that gives me roughly the same experience, but using pure bash. I want to be able to drop this on any system, without installing anything, and get unobtrusive venv management.

## Too Heavy

Since Python 3.3, released in 2012, this has been the simplest way to create a venv.

```bash
$ python3 -mvenv venv
```

I started actually creating venvs that way around Python 3.7, when I finally stopped using Python 2. I also stopped using VEW. It felt dirty to use a tool built for python 2, with all its cruft, instead of somehow using the latest stuff.

Installing VEW today will install a `virtualenv` module, even though Python ships with one. Anytime I see that, I interpret it as saying VEW has gone stale, and it still carries legacy cruft around, causing me to change my mind about using it.

```bash
$ python -mvenv venv
$ source venv/bin/activate
$ pip install virtualenvwrapper
...
Successfully built virtualenvwrapper
Installing collected packages: distlib, virtualenv-clone, platformdirs, pbr, filelock, virtualenv, stevedore, virtualenvwrapper
...
```

I am sure there are valid reasons for this, but I'm not going to use it. I don't see why installing anything more than a shell script should be required.

_There's got to be a better way!_


# Something Simple

I finally decided it would be much easier to deal with if I had something like VEW to stash my venvs in a single place. I did that thing where a programmer asks themselves, "_how hard could it be?_"

## Design Considerations

The core stuff I wanted from this new tool:

* simple commands for unobtrusive venvs
* written in as few lines of shell as possible
* tab completion, for venv names

## Commands

Whenever I build a system, I like to imagine what it should be like to use the system. I then implement what's required to get there.

Here is how I imagine the new tool working:

```bash
$ mkvenv <name>   # make new venv
$ rmenv <name>    # delete a venv
$ usevenv <name>  # activate a venv
$ stopvenv        # deactivate venv
$ lsvenvs          # list your venvs
$ cdvenv <name>   # go to root directory for venv
```

## Working Prototype

With 120 lines of bash, I have a working prototype that does everything I described above, including tab completion.

Creating a new venv:

```bash
$ mkdir new_project && cd new_project

$ mkvenv proj_env     # Automatically activates venv

(proj_env)$ pip install numpy pandas matplotlib jupyter
Successfully installed ...

(proj_env)$ which jupyter
/home/jmsdnns/.multivenv/proj_env/bin/jupyter
```

Using an existing venv:

```bash
$ usevenv proj_env    # Activate venv

(proj_env)$ python your_script.py


(proj_env)$ stopvenv  # Deactivate venv

$
```

Managing your venvs:

```bash
$ lsvenvs
maestral
mathhomework
proj_env

$ cdvenv proj_env

$ pwd
/home/jmsdnns/.multivenv/proj_env

$ rmvenv proj_env
Are you sure? [y/N] y

$ lsvenvs
maestral
mathhomework
```

I've been using it for a week and it's been seamless so far. Even better, it seems to work properly with the other tools I use, like VSCode.

# Project

The code is on Github.

## [Repo](https://github.com/jmsdnns/multivenv)

And the README will tell you how to use it, repeating some of what you just read.

## [Readme](https://github.com/jmsdnns/multivenv/blob/main/README.md)
