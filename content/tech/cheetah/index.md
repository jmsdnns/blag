---
title: "Testing The Cheatability Of AI Homework At Penn"
date: 2025-07-24
image: images/tech/cheetah.jpg
draft: true
description: >
    Last year, I was on a team that worked on the class designs for UPenn's new AI degree programs. We were quite concerned about how well cheating with AI might work. There was a lot of speculation, but that ain't my style, so I rolled up my sleeves and got hacking until I had a tool, Cheetah, that could tell us just how cheatable the classes really were.
tags:
    - AI
    - Penn
    - Cheetah
---

The last couple years have been a wild ride for tech because of AI. While the optimists and the pessimists have been arguing about AI's future, universities have been changing their degree programs to point towards a future where AI has a prominent role in society. UPenn's approach has been to create new undergratuate and graduate degrees for AI. That's right, someone can major in AI now, just like computer science or history, etc. AI was simply an elective back when I was in undergrad.

My own feelings towards AI have been a wild ride too. I _want_ AI to be incredible, but my experiences have all told me it's not particularly useful unless you're doing simple things. Ironically, my opinions were mostly formed while I worked for UPenn, helping them build those new AI degree programs.

Overall, what I learned is that AI is only useful for small, simple tasks. It gets confused easily. It will spend your money on API calls while it goes around in circles. This is common knowledge now, but I learned it last year. This is the story of how I ended up in front of AI's hype and hate for a while.

# Working On Class Designs

I tell the story of my connection to UPenn in [this post]({{< ref "penn-ai" >}}) about attending Penn's first AI conference. I started working for UPenn shortly after writing that.

I made it clear to my buddy CCB that I wanted to work on a team that would give me access to all the course materials. I'm a lifelong autodidact and someone who can't stand a classroom, so I wanted a way of giving myself the same education without having to go to school. He graciously found me a role on one of the teams building the classes for their new degree programs. I was pumped! I went hard teaching myself the material. I wanted a foundation for understanding LLMs as soon as I could build it.

It was interesting to see how disorganized the classes actually were. So much of everything was stored in google drive with copies of directories that had dates in their names. It was clear this would be much easier if it was stored on github instead, so one of the first things I did was organize a class into a git repo.

I structured the repo around homeworks. The materials and relevant grading software were stored together in a directory for each assignment. That looked roughly like this:

```
cis-5210/
  homeworks/
    hw01/
      grading/
      materials/
    hw02/
    hw03/
    ...
```

# Considering Cheaters

After a couple weeks, we start wondering about how easily LLMs could solve student homeworks. During a meeting we tried a few easy problems and the LLM seemed to solve them. [N-Queens](https://en.wikipedia.org/wiki/Eight_queens_puzzle), for example.

There was a period of my life where I'd kick the tires on a new programming language by implementing Sudoku solvers, which use same algorithm as N-Queens, [backtracking](https://en.wikipedia.org/wiki/Backtracking), so I already knew the Internet was full of N-Queens implementations. That meant the training data was likely full of them too. Solving N-Queens felt like a parlor trick. I wanted to see how LLMs would handle something real.

We decided to split things up. Half the team would spend time trying to get an LLM to solve problems 1-5, the other half would work on problems 6-10. You can see the homeworks yourself on [artificial-intelligence-class.org](https://artificial-intelligence-class.org/). I joined the side doing problems 6-10, where the more challenging stuff was.

## Markov Decision Process

Problem 6, the first of the set I would look at, requires working with [Markov Decision Processes](https://en.wikipedia.org/wiki/Markov_decision_process). You can see the actual assignment [here](https://artificial-intelligence-class.org/homeworks/markov-decision-processes/markov-decision-processes.html). _Ignore the warning that the materials are out of date, it's the same thing each year._ The key thing to know about MDP is that it requires an agent to make a series of good decisions over time. Programming one requires tracking the state of the agent well, designing a good policy for evaluating both good and bad decisions, transitioning from one state to the next properly, and we can skip the rest of the list by saying a proper MDP requires nuance and care.

For my first attempt, I simply pasted the homework problem into the prompt along with any relevant source files, as the assignment provides skeletons that need to be filled out. I got code back for the first section of the assignment, but it didn't run. I sent the code back, along with the error message, and it returned something that ran, but didn't work.

Considering we were just doing an overview at this point, I thought that was good enough to say LLMs cannot solve homework problem 6.

## Q Learning

Problem 7 was based on Q learning. It solves a similar problem to MDP, except it does so without an MDP model. Instead of having rules and transitions defined, it just goes wild with trial and error and works its way towards an efficient solution. This doesn't require a human involvement the same way MDP does, so we'd expect an LLM to perform better at this.

The output for this didn't work either. It ran, but it didn't solve the problem.

_Amusingly, I am trying this again right now and I get the same result. Code that runs but does not solve the actual homework problem. It even tells me what the output should look like and then the code just doesn't do that._

## Reflecting

At this point, I stopped to consider what was happening. The LLM had no problem with N Queens, but it kept failing for both MDP and Q Learning.

![Stick figure drawing of a person in thought while rubbing their chin. The word "HMM" is written next to them](thonking.gif)

It _seemed_ as though the LLM could solve problems where the solution always looks the same. It also _seemed_ as though it could not solve problems where something in the solution required careful configuration based on the context of the problem, such as the parameters for MDP. I would need to somehow go bigger to get more information about which problems can be solved by an LLM and which cannot.

# Cheetah

As I thought about how to automate the process, it occurred to me I had already organized both the homework materials and grading software into a single repo. It shouldn't be that hard to build off that by uploading the homework materials to some LLM, asking it to solve the homework, run the output through the graders, and see how it did. I could even put it in a loop where I pass the grading output back to the LLM and ask it to improve its work, possibly evolving its way towards a passing grade. In theory, this could all happen very quickly.

Naming a project is one of my favorite parts of starting a project. "Hmm", I wondered, "what should I call a tool that automates cheating?" _Cheetah_, obviously.

The program was fairly straight forward, but it is connected to a moment in time when OpenAI had a thing called a _vstore_. It was a simple form of RAG. For folks not familiar with AI, it's a way to upload documents and images so that they can be referenced from a prompt. This would let me write a prompt that says, "solve homework problem 3 from assignment 6", and it could go get all the relevant data automatically. From there, I just had to loop across each problem in an assignment and grade the output using the software graders. Simple enough.

## Anxiety Among Staff

The morning I was going to show my prototype, I learned of a professor who would be joining our next meeting because they claimed to several other professors that LLMs _can_ solve all the homeworks. I already **knew** this wasn't true, and I had Cheetah to prove it, but I'm not an Ivy League professor.

The anxious vibes were flowing the moment this professor started talking. They were scared. They told us they couldn't sleep last night. I was sooo curious to understand how they did what they did, because my experiments simply did not support their claim. Turns out they tried the N Queens problem, got output, tried other problems, got output, and they started freaking out.

![](smashputer.gif)

Here's the thing, they never actually tried grading any of the work. This type of response is all too common. People see the LLMs generate stuff that looks like intelligence and they have a big reaction before actually checking the content. This sucks because LLMs are great bullshitters that sometimes deliver, which breaks everyone's brains. You can't write it off entirely and you definitely can't trust it.

I then told the team about Cheetah and that I _had_ actually tried grading all of the LLM output with the same graders that would check student homework and I told them how badly the LLMs actually performed. They weren't even close to getting passing grades for most of the problem sets. I cannot understate how much of a relief this was for everyone.

# Meow
