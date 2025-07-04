---
title: "Hypeless AI"
date: 2025-06-09
image: images/tech/hypeless_ai.jpg
draft: true
description: >
    meow
tags:
    - AI
---

Artificial Intelligence is an old idea. The earliest known descriptions of _logical machines_ are from the late 1200's, several centuries before computers became a thing. Alan Turing talked about implementing artificial intelligence while he was creating the foundation for computation. He was at Bell Labs in 1943 in NYC and [discussed his idea for a "Universal Machine" with Claude Shannon](https://www.researchgate.net/publication/318756069_Life_in_Code_and_Digits_When_Shannon_Met_Turing), who would soon invent _Information Theory_, the foundation of modern AI.

As soon as AI became tangible, humans began worrying it will render humanity obsolete and take over. Well, Mary Shelley wrote about an AI called Frankenstein in the 1800's, so people worried about it before computers too. Einstein even worried about computers taking all the "thinking jobs" and he died in 1955.

AI was recognized as a field of research in 1956 at a workshop at Dartmouth. Folks who were there predicted that machines would be as intelligent as humans within a generation. Over time, hopes that AI would soon be as smart as humans came and went. It had so many ups and downs that by 1984 (_a while ago!_) folks started referring to the period of reduced interest as [AI Winters](https://en.wikipedia.org/wiki/AI_winter). The thinking jobs might be safe after all.

A gigantic amount of money has been thrown into AI recently. Investors and governments want to supercharge the industry. They believe an important milestone has been reached and now they won't stop trying to force it on us. Kissinger even wrote a book on it. On the other side are the haters. They have strong opinions and they are vocal about it. They worry about jobs being lost, copyright theft, energy demands, and more. Having conversations about what AI can actually do is very difficult when there are loud voices pulling at us to join them in the fight.

Lately, I have become convinced that any position someone takes on AI is not actually about AI. It's about who they are. Consider it like this. Proponents can safely assert that AI's potential is huge because they're saying they believe in the future. Being against them is like being against the future. Opponents can say AI doesn't work and they can easily demonstrate this. Being against them is like being against things working.

> The confidence people have in their beliefs is not a measure of the quality of evidence but of the coherence of the story the mind has managed to construct.<br/>
> **– Danny Kahneman**

I believe less hype will lead to less anger. Seeing LLMs for what the actually are allows us to see how drastic the conversation has truly become. I want the artists, the engineers, the scientists, the educators, and everyone to be able to talk in terms of what modern AI can actually do. I want to live in a world where everyone knows AI is just software. I want to live in a world where we everyone knows it's a bad idea to sacrifice our rights, our environment, our creative freedom, our autonomy, etc, just to use the buggiest, most unpredictable software ever created.

I want AI to be hypeless. I have some ideas on how we can do that.


# Foundations Of Realness

Over time, I found my thinking about this tech improved when I learned about the following patterns. They have been helpful to me for seeing both the potential and the problems in any attempt to use LLMs.

We also can use this list, or an improved one, as a filter for speculation that has gone awry. If some idea requires that one of these patterns is not true, it probably doesn't describe LLMs.


### non-deterministic

Being precise about what LLMs do is difficult. You get different outputs for the same input, which defies a fundamental part of how software usually behaves. There are ways of minimizing that, but it requires specialized knowledge. This is weird.

It goes against a core premise of computing, that they should respond the same way to the same input. [Context Free Grammars](https://en.wikipedia.org/wiki/Context-free_grammar) are used in computer code to ensure there is only one way to interpret a line of code. That makes it deterministic. LLMs, on the other hand, are better thought of as non-deterministic systems. They notoriously respond differently to the same input.


### shrinking performance gap

While at [Penn's first AI conference]({{< ref "/tech/penn-ai" >}}), I heard Dr Lilach Mollick make a point that stuck with me. She said that AI had a powerful ability to lift up people on the lower side of performance, like when someone is learning a new skill (_low experience_) or they're not that interested in the work (_low effort_). It had less of an effect on people who are highly skilled.

LLMs reduce the skill gap by elevating the bottom end more than the top.


### bias towards consensus

One of the other patterns I find interesting is the importance of strong signals in the data. It causes them to overlook novel findings when summarizing research papers. It causes them to lack detail on important historical figures that are not well known.

For programmers, it means mainstream coding opinions will perform better. This also means that nonconsensus programming opinions won't perform as well. Their patterns aren't as well established during model training.


### pattern matching vs thinking

I was on a team at UPenn that worked on the design of classes for their brand new AI degree programs. Teachers were concerned about the potential for students to cheat using LLMs so I thought I would try duct taping some things together to see how well LLMs actually performed. I used all of the actual homeworks a student would need to complete and I used the all of the actual software graders teachers used to evaluate the work.

I found LLMs can write a solution to the [N-Queens problem](https://en.wikipedia.org/wiki/Eight_queens_puzzle), but they breakdown when attempting to do anything more complex, such as picking parameters for a [Markov Decision Process](https://en.wikipedia.org/wiki/Markov_decision_process). Solutions to N-Queens generally have both the same structure and parameters each time. Solutions for MDP are different because they have similar structure, but different parameters, which causes pattern matching to break down. The variation found for parameters dissolves the patterns into noise, causing the LLM to roughly conclude that _numbers go there_ instead of something helpful.

I found it hard to be persuasive about the implications of what I saw until [Apple put out this wonderful paper](https://machinelearning.apple.com/research/illusion-of-thinking) that frames the performance of LLMs in terms of complexity. Their research shows that LLMs can do well at simple tasks, some prompt engineering lets them do OK at some medium tasks, but then they totally _collapse_ for complex tasks.


# How To Dehype AI

### LLMs, A Subset Of AI

Saying _AI_ when we should say something more specific to the current moment is a big problem. This old, old field of study has been hijacked by CEOs and investors who want to make big, hairy, audacious claims about what _they're_ building, as though their heroic deployment of capital is what brought us to the current moment instead of the slow process that took place over decades. Saying _AI_ allows people outside tech to believe we've achieved something far greater than what has actually happened. Saying _AI_ leads to wild imaginations eventually concluding that _AI will escape and kill us_, to which the other side says _no it wont_, and the general public, who have not studied AI, walk away believing both sides made good points. **UGH!**

This has to stop. AI is a branch of computing (abstract) and LLMs are the tool everyone is interacting with (tangible). Some form of AI has been generating algorithmic things for us for years now. Your Release Radar playlists on Spotify, your social media feeds, all of the NPCs and enemies in video games, etc.

We should intentionally dehype _AI_ by saying _LLMs_ instead.

### Music & EDM

Perhaps this is a spicy take, but I don't see AI as a tech revolution in itself. Instead, I think it might be how the information age finally comes to a close. Wouldn't it make sense for the logical conclusion of computing, after decades of humans tapping on keyboards and screens, to be that smart software takes over doing all the stuff we don't want to do? Whatever can be done today by a human using a computer can theoretically also be done by an AI using a computer. The limits of computation haven't actually changed. What has changed is how much can be done by a single person.

Consider the evolution of music. There were large bands where everyone played a single instrument, like an orchestra or brass band. Then there were smaller bands with only a few people, like a rock band. And eventually EDM came along and one person could do everything in a computer. If we take the analogy back to AI, we could imagine Ocaml & Rust hackers writing the majority of their code, like a rock band that plays its own instruments, and we could imagine Javascript hackers embracing the wild, wild west of new technology by using AI, like an EDM DJ using software for every instrument instead of a human. Music was still music, but what changed how much could be done by a single person. 

### Maximum Safe Autonomy

I found it amusing when Linus Torvalds referred to LLMs as fancy autocomplete. He was going for the hype's jugular with that one. It's funny because it isn't wrong, but because it is so matter of fact about how useful any of it is with no attempt at all to speculate about the future. Many folks took this as an insulting reduction of something they believe in. While I think Linus is literally right, I don't mean it as an insult to AI or LLMs. It's a literal statement about how much we can trust LLMs to work by themselves. We can use autocomplete safely for functions if we know how to describe functions. We can sometimes use it for bigger things, like all of the code in a single file or multiple files.

The maximum safe autonomy (MSA) for AI coding _right now_ might be autocomplete. Going beyond that means the performance increasingly uncertain. It would be cool for future MSA to represent an AI that builds and deploy software to resources we pay for, all without us ever feeling we need to check its code or login into a cloud console, but I don't think we're there yet, so that's outside the current MSA.

There is no such thing as general intelligence, let alone artificial general intelligence, but we haven't had good terminology to use instead either. We should use MSA to reframe that whole conversation to focus on how much we trust the software and leave questions about whether or not something is alive to philosophers.


### Determinizing Work



