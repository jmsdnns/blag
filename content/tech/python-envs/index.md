---
title: How To Venv Without Losing Your Mind
date: 2024-03-14
# image: images/tech/
draft: false
description: >
    i want chicken i want liver i was meow mix meow meow meow meow
tags:
   - python
   - venv
---

Python environments have a reputation for being a mess. I don't claim they're perfect, but the reputation is much worse than Python deserves. For whatever reason, I have never had any of the issues with Python envs that others have had, so I spent some time trying to work out why... And I believe I have some good answers. Good enough to share anyway.

Here is the gist:

* I never use Conda
* I avoid having a single directory named _venv_, and I don't keep it in my project directory
* I begin every project with the proper machinery in place to create a specific environment
* I am disciplined about maintaining the list of dependencies either in `requirements.txt` or `setup.py`

Or another way:

* I decouple environments from the project
* I am careful about tracking every dependency, as I install them
* I make it easy to quickly rebuild equivalent environments


# Thinking About Environments

The typical story for Python hackers starts with creating a directory called `venv`, and from there we push considering the environment down below our conscious self, becoming an abstract concept of a box where stuff goes. There are many projects that attempt to make it easier to manage environments that begin by creating a `.venv`, to do the same thing while hiding the directory from view.

In my opinion, relying on "_venv_" as the name for a single dir installs a tendency in users to believe they always have to use that name. The command itself says "_venv_" twice, which looks more like syntax than what it actually is, which is a python module name + a directory name.

The typical command:

```shell
$ python -mvenv venv
```

But it could also be:

```shell
$ python -mvenv my-venv-for-doing-whatever-i-want
```

We'd have to add that weird name to our `.gitignore` too. Unless, the venv wasn't stored inside the project.

After all, our venv path could be in a directory that contains all of your venvs, each with unique names, like ["pallets"](https://github.com/jmsdnns/pallets) or "pallets-test".

```shell
$ python -mvenv ~/.multivenv/pallets
```

I like this approach enough that I built a tool, called [MultiVenv](https://github.com/jmsdnns/multivenv), that makes it easy to keep virtualenvs stored neatly outside your projects. We'll see that later.

```shell
$ mkvenv pallets
```

There are also other ways to manage Python environments. Many folks like [Poetry](https://python-poetry.org/) lately, and it seems pretty rad, but I don't yet have experience with it.


## What Activating A Venv Actually Does

The thing that makes python virtual environments work is that they function using traditional techniques, with paths and environment variables.

Let's say I have enabled a venv called _relephant_. I would also have these environment variables.

```shell
$ mkvenv relephant
(relephant) $ env | grep VIRTUAL
VIRTUAL_ENV=/home/jmsdnns/.multivenv/relephant
VIRTUAL_ENV_PROMPT=(relephant)
```

And my path would have the venv's bin directory in front.

```shell
(relephant) $ echo $PATH
/home/jmsdnns/.multivenv/relephant/bin:/usr/local/bin:/usr/bin:/usr/local/sbin
```

Here is where we find `python` when a venv is enabled.

```shell
(relephant) $ which python
/home/jmsdnns/.multivenv/relephant/bin/python
```

True for pip too.

```shell
(relephant) $ which pip
/home/jmsdnns/.multivenv/relephant/bin/pip
```

The first line of our venv's pip command contains a subtle, but crucial bit of context: the absolute path to our virtualenv's python.

```shell
(relephant) $ head -1 /home/jmsdnns/.multivenv/relephant/bin/pip
#!/home/jmsdnns/.multivenv/relephant/bin/python3
```

Let's see what that path for `python3` actually means.

```shell
(relephant) $ ls -l /home/jmsdnns/.multivenv/relephant/bin/python3
lrwxrwxrwx 1 jmsdnns jmsdnns   16 Dec 23 22:50 python3 -> /usr/bin/python3*
```

In our venv, the command `python3` is a symlink to an external python, which is the python you used to create the venv. For me, that meant `/usr/bin/python3`. Deactivate the virtualenv to see which python your system uses by default.

```shell
(relephant) $ deactivate
$ which python
/usr/bin/python
```

{{< notice note  >}}
If you use any version of Python that is not the system's Python, like with Homebrew, then you need to be mindful that your virtualenvs will have a path to Python that will change. Running `brew upgrade` will cause virtualenvs to break anytime homebrew upgrades Python, causing paths to change. The approach I describe here will help you feel comfortable deleting the old env and recreating it with the new path. Yes, it's possible pip could be smarter somehow, but for now it is a detail that must be managed.
{{< /notice >}}


## What Deactivating Actually Does

Let's say relephant is enabled, and we're going to deactivate it again. The environment variables we saw above, `VIRTUAL_ENV` and `VIRTUAL_ENV_PROMPT` are no longer set.

```shell
(relephant) $ deactivate
$ env | grep VIRTUAL
```

And your shell's `$PATH` no longer has the venv's bin directory in it.

```shell
$ echo $PATH
/usr/local/bin:/usr/bin:/usr/local/sbin
```

## Using MultiVenv

I took using multivenv for granted above because it greatly simplifies storing venvs neatly outside all of your project directories. Let's take a moment to see what it does more specifically and then we'll just use it for the rest of the post.

Here is an easy way to install it.

```shell
$ curl -O https://raw.githubusercontent.com/jmsdnns/multivenv/main/multivenv.sh ~/.multivenv.sh
$ echo "source $HOME/.multivenv.sh" >> ~/.bashrc
$ source .multivenv.sh
```

From here on, we can create a venv with `mkvenv`, enable one with `usevenv`, or list all our venvs with `lsvenvs`. You get the idea.


## Installing Modules

Activating a venv will modify our shell environment to point to some directory that pretends to be a python install. It _pretends_, because it actually symlinks to a real python install. The value of a venv comes from being a place where all dependencies are installed, safely isolated from other projects.

The typical approach to venvs falls short because it creates a single venv, called "_venv_", in the project directory. It starts to feel cluttered if we have multiple venvs in a project directory, and that's only if we see the value from venv names being arbitrary, eg. they dont have to be "_venv_". By decoupling where venvs are stored from the project, it becomes possible to have a stable venv and a test env for the same project. You can easily validate upgrading dependencies in separate environments too, without wrecking the one that works.

Enable relephant and then install pytorch

```shell
$ usevenv relephant
(relephant) $ pip install torch
Collecting torch
  Downloading torch-2.2.1-cp311-cp311-manylinux1_x86_64.whl.metadata (26 kB)
Collecting filelock (from torch)
  Using cached filelock-3.13.1-py3-none-any.whl.metadata (2.8 kB)
...
Successfully installed filelock-3.13.1 torch-2.2.1 ...
```

You just enable the venv and use pip.


## Transient Venvs

For funsies, destroy the relephant venv and make it again. This will reinforce the idea that envs are easy to create and destory as you need them.

```shell
(relephant) $ stopvenv  # same thing as deactiate
$ rmvenv relephant
Are you sure? [y/N] y
```

Now we'll make it again.

```shell
$ mkvenv relephant
(relephant) $ pip install torch
Collecting torch
  Downloading torch-2.2.1-cp311-cp311-manylinux1_x86_64.whl.metadata (26 kB)
Collecting filelock (from torch)
  Using cached filelock-3.13.1-py3-none-any.whl.metadata (2.8 kB)
...
Successfully installed filelock-3.13.1 torch-2.2.1 ...
$ stopvenv
```

That's it. Want a test env?

```shell
$ mkvenv relephant-test
(relephant-test) $ pip install torch
...
```

Now you have both your regular env and a test env, but we don't need the test, so remove it.

```shell
$ stopvenv
$ rmvenv relephant-test
```


# Tracking Dependencies

There are two main ways. One way is to list everything in a file called `requirements.txt`. The other is to add them to the module's install scripts, such as `setup.py`. The former is easier for small projects, and the latter is more appropriate for modules stored on pypi. We'll explore how to use both.

