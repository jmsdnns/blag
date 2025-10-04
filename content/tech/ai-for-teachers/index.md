---
title: "AI For History Teachers"
date: 2025-09-07
image: images/tech/ai-for-teachers.jpg
description: >
    Teachers are being told they must use AI and must help students learn how to use AI, but no one has told them how to use AI. I'm here to help!
tags:
   - teachers
   - ai
---

AI has been a whole thing for several years now and it's been hyped beyond belief. One of the ways we notice how excessive the hype has been is how many people are sure AI is going to change everything, yet they can't quite describe _how_ anyone should use it. They're just convinced it's the future and that we're all going to lose our jobs.

Between working for UPenn and being part of the [History Matters community](https://ncheteach.org/history-matters/) with Dr Joanne Freeman (shown above) and Annie Evans, I have heard a many teachers discuss AI. They've been scared. They've been confused. Even the AI professors at UPenn have had existential panics. Above all, when teachers finally get around to using it, they quickly experience AI's notorious hallucinations, causing them to think the stuff doesn't even work.

Education seems like it should be a win for AI. Kids can be taught to use the new tools early on, teachers can save time, and so on. But instead, AI is being forced on teachers who are being told they have to start using the new tools, and teach kids how to use them, right away which is creating a lot of tension and anxiety for everyone involved.

I hear about this all the time from the history matters community in particular. The story is roughly that the people running the schools are scared of not getting the most out of the shiny, new tech, which is supposedly changing everything, and thus they mandate its use to avoid being left behind. The thing that is particularly maddening about this is that teachers are told they have to use AI and almost no one shows them _how_. They just wave their hands in the air and say, "_This is going to change everything! It's the future!_", and then they act surprised when teachers say, "_but I tried it and it kept saying incorrect stuff_".

I empathize with the teachers on this one. I want to help.

My plan for this essay is to use plain language to describe how AI works so my teaching friends gain a lot of intuition. I'm then going to describe some of non-obvious prompting techniques that consistently generate high quality outputs. And finally, some general rules of thumb to keep in mind as you use the new tools.


# Quick Overview

When people say _AI_ today, they usually mean _LLMs_, or _Large Language Models_. AI as a concept has been around since the early days of computing. Alan Turing, the father of computing, knew Claude Shannon, the father of information theory. Shannon's 1948 paper, [A Mathematical Theory of Communication](https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf) lays the theoretical groundwork for modern AI, especially neural networks.

Amusingly, AI is so old that it has been overhyped enough for everyone to get sick of it many, many times. The term ["AI Winter"](https://en.wikipedia.org/wiki/AI_winter) was first coined way back in 1984 to capture the way people stop caring about AI after one of these phases of excessive hype. If you feel sick of hearing people say ludicrous things about AI, you aren't alone. You are actually part of a decades-long tradition of folks who get sick of AI hype.

With that said, LLMs actually do represent a massive leap forward in terms of how well AI performs. They aren't _just_ hype.

The key things that LLMs did to push the field forward are:

1. **Learning from huge amounts of text**. They get better as you give them more data and you can give them seemingly endless data. As the size of the training data grows, they become more likely to produce accurate and coherent responses. This is why AI companies are so aggressive about collecting as much data. Being able to build such gigantic models using as much data as can be collected is new.
2. **Understanding context.** LLMs can understand text of any size, allowing them to consider not just the individual words, but the context of entire documents or conversations. Prior models were significantly more limited in scope, focused on smaller portions of documents like phrases or sentences.
3. **They have an "Attention Mechanism".** LLMs can _pay attention_ to the most relevant parts of a document to figure out what other parts of the document mean. As an analogy, consider how the meaning of "apple" would change if it was used in a sentence with "kitchen" or with "technology".
4. **Generating human-like text**. They can write, chat, and respond in ways that _feel_ like a real conversation with a person. If we put aside their notorious tendency to hallucinate, the quality of their text outputs is the best the AI industry has ever achieved.

Once all of the model training is done, you can think of LLMs as essentially being a big mapping of how words are arranged when humans use them to communicate. One word leads to another word, which leads to another word, and so on. This is why they're called _language models_. They attempt to model the flow of language.

Knowledge is stored somewhat indirectly in LLMs. Knowledge is expressed through the construction of sentences. If the model is good, it will have knowledge stored inside it via its tendency to think particular sets of words should flow together. It can then construct new sentences that arrange words in the right way to express that knowledge. Knowledge, for LLMs, is a consequence of being able to arrange words, and so it is considered an _emergent property_ of LLMs, and not something directly encoded.

_One of the critiques of LLMs, by experts such as [Yann LeCunn of Meta](https://wonderfulengineering.com/yann-lecun-says-nobody-in-their-right-mind-will-use-llms-and-genai-within-5-years/), is exactly that they do not intentionally encode knowledge. He believes better models are necessary._

LLMs are not alive. They don't think. They're not going to escape and kill humanity. They won't launch nuclear missiles and cause WW3. They're just software, like any other software you've used. The main difference from regular software is that using the same prompt multiple times will produce different results almost every time, and we're really not used to that. Perhaps you've heard that the definition of insanity is to do the same thing twice and expect a different outcome each time. That's exactly what happens with LLMs, so it's ok to feel like they're making you go insane.

![A picture of a stuffed monkey animal that looks like it just had its mind blown](insane.gif)

# Approaches To Prompting

When you enter a prompt, the LLM looks at every word in the prompt and then it attempts to use the word mapping to predict what a good next word would be. It generates complete responses one word at a time. It reads your prompt, guesses the next word, then it reads your prompt and the new word to guess a second word. It then reads all of that text, including the new words, and it guesses yet another word. Eventually, it has put together enough new words that a full response is created and it sends that to the user. A key takeaway here is that all of the words in some chat highly influence all of the words that come later.

You can think of the prompt as setting the direction for the word generator. Using a short, unspecific prompt, similar to what you'd put into Google, will likely yield poor results, but using a prompt with a lot of text and specific details will yield much better results. The longer prompt influenced all the words that came after it, after all, giving the LLM a lot of direction about what kind of response you want.

BTW, I will have links in each section that open chatgpt with the prompt ready to go. Just look for the link that says [ try it ]


## More Is More

Here are two prompts that attempt to get information about my boy, Sam Adams. He is a fun example because "Sam Adams" is better known to a typical person as a brand of beer than as the wild, revolutionary founder whom I admire.


Prompt 1: `what is the public perception of sam adams` [[ try it ]](https://chatgpt.com/?prompt=what%20is%20the%20public%20perception%20of%20sam%20adams)

Prompt 2: `i want to learn about the revolutionary founder of the US, Samuel Adams. what are the most important things to understand about him? how did his enemies feel about him? what is he most known for?` [[ try it ]](https://chatgpt.com/?prompt=i%20want%20to%20learn%20about%20the%20revolutionary%20founder%20of%20the%20US,%20Samuel%20Adams.%20what%20are%20the%20most%20important%20things%20to%20understand%20about%20him?%20how%20did%20his%20enemies%20feel%20about%20him?%20what%20is%20he%20most%20known%20for?)

Each time I try prompt 1, I get information about the beer brand. It simply wasn't specific enough, so I got the wrong stuff. Prompt 2, however, nails it and provides great answers for all of my questions. That is why _more is more_ for AI, even though we're used to _less is more_ with search engines.


## Role Based Prompting

One of the more interesting aspects of prompting is the way you can tell an LLM to behave like a particular kind of person. This is surprisingly simple but it has enormous effect on the quality of the output. It is also easy to create different types of personalities whenever we need them.

Below is a prompt that describes a detail oriented historian. Use it as your first prompt and then enter a second prompt that asks the LLM some historical questions and let the drastic improvement in quality wash over you.

Role Based Prompt: `you are an expert in American History, specializing in the revolutionary war, with over 30 years of experience researching original texts from the time period. your reputation depends on factual accuracy and the depth at which you draw connections across disparate events.` [[ try it ]](https://chatgpt.com/?prompt=you%20are%20an%20expert%20in%20American%20History%2C%20specializing%20in%20the%20revolutionary%20war%2C%20with%20over%2030%20years%20of%20experience%20researching%20original%20texts%20from%20the%20time%20period.%20our%20reputation%20depends%20on%20factual%20accuracy%20and%20the%20depth%20at%20which%20you%20draw%20connections%20across%20disparate%20events.)


## Structured Prompts

This next prompt shows how well LLMs respond to things that go beyond questions. If we provide detailed structure about what we want, the LLM will act accordingly. For example, this will generate new song lyrics every time, yet they will be consistent in structure every time too.

```
Generate lyrics for the following song description.

Title: Karalee's History Class
Genre: Rock
Mood: Fun
Themes/Keywords:
- History
- The US
- US Constitution
- Washington
- Hamilton
- Grant
- Lincoln
Rhyme Scheme: Verse (ABAB), Chorus (AABB)
Tone of Voice: Excited
Narrative Point of View: First Person

[Verse]
4 lines
introduce Karalee's class and how fun it is

[Chorus]
4 lines
catchy and welcoming
tell the listeners why they should care about history

[Verse]
4 lines
introduce some of the themes covered in class

[Chorus]
4 lines
catchy and funny
talk about the joy of learning history
```
[[ try it ]](https://chatgpt.com/?prompt=Generate%20lyrics%20for%20the%20following%20song%20description.%0A%0ATitle%3A%20Karalee%27s%20History%20Class%0AGenre%3A%20Rock%0AMood%3A%20Fun%0AThemes/Keywords%3A%0A-%20History%0A-%20The%20US%0A-%20US%20Constitution%0A-%20Washington%0A-%20Hamilton%0A-%20Grant%0A-%20Lincoln%0ARhyme%20Scheme%3A%20Verse%20%28ABAB%29%2C%20Chorus%20%28AABB%29%0ATone%20of%20Voice%3A%20Excited%0ANarrative%20Point%20of%20View%3A%20First%20Person%0A%0A%5BVerse%5D%0A4%20lines%0Aintroduce%20Karalee%27s%20class%20and%20how%20fun%20it%20is%0A%0A%5BChorus%5D%0A4%20lines%0Acatchy%20and%20welcoming%0Atell%20the%20listeners%20why%20they%20should%20care%20about%20history%0A%0A%5BVerse%5D%0A4%20lines%0Aintroduce%20some%20of%20the%20themes%20covered%20in%20class%0A%0A%5BChorus%5D%0A4%20lines%0Acatchy%20and%20funny%0Atalk%20about%20the%20joy%20of%20learning%20history)


## Prompts to Generate Prompts

LLMs are surprisingly good at telling us how to use them. The simplest way to see this is to ask them what kind of prompts we should use to learn about things.

Prompt: `generate some excellent prompts for learning about ulysses grant`
[[ try it ]](https://chatgpt.com/?prompt=generate%20some%20excellent%20prompts%20for%20learning%20about%20ulysses%20grant)

You'll see a list of suggestions after trying this. Follow up by asking it to generate text based on the first 3 prompts and you'll see it generates some excellent information about my boy, Ulysses Grant.


## Multi-Turn Prompts

The idea with multi-turn prompts is to prompt the LLM in such a way that it fills the conversation with helpful information before we enter a final prompt that produces the information we actually want.

For this example, we want to have the prompt generate a lesson plan for teaching the American Revolution.

### Attempt 1

This attempt represents the weaker approach by using a single prompt to get a single output.

Prompt: `Generate a lesson plan for teaching the American Revolution` [[ try it ]](https://chatgpt.com/?prompt=Generate%20a%20lesson%20plan%20for%20teaching%20the%20American%20Revolution)

### Attempt 2

This attempt is significantly more elaborate that the previous attempt, so I cannot provide a clickable link that gets you through the whole process. Instead, head to [chatgpt.com](https://chatgpt.com) and copy each prompt over to see it work.

Prompt 1: `What are the key objectives for teaching a lesson on the American Revolution? Include both historical facts and the broader themes or concepts students should understand (e.g., causes, major battles, key figures, and the impact on society).`

Prompt 2: `What are some effective ways to engage high school students in this lesson about the American Revolution? Consider using interactive activities, multimedia, or student-driven discussions.`

Prompt 3: `What resources (e.g., primary sources, videos, maps) would be helpful for teaching the American Revolution? Include a mix of digital and traditional materials.`

Prompt 4: `How should students be assessed on their understanding of the American Revolution? Consider quizzes, projects, group work, or presentations. What types of assessments would allow students to demonstrate critical thinking?`

Our prompting so far has caused the LLM to write a lot of text about what excellent lesson plans look like. All of that will now inform how the LLM responds to our final prompt, where we ask for the lesson plan itself.

Final Prompt: `Based on the objectives, engagement strategies, resources, and assessments, write a detailed lesson plan for teaching the American Revolution. Include an introduction, lesson activities, and the final assessment method.`

At this point you will have an exceptional lesson plan as the final output from the LLM.


## Style Transfer

This technique is very interesting in terms of making it possible for disconnected people to understand each other. It allows a single idea to be expressed in many different forms.

I first learned about this when someone told a story about how they were struggling to reach their daugher, who was struggling with depression. He tried sending his daughter to therapy. He tried going with her. He tried being as present as possible. He tried giving her space. In a moment of desperation, he tried asking an LLM to reframe his thoughts in a way that a 14 year old girl would understand and it was then that he started to form the bond he was looking for. It helped him understand what was missing in all his previous attempts. It also gave him different language that put his thoughts in her words.

_Replace the lorem ipsum below with your own personal story_

Prompt: `Frame the following text in such a way that it speaks directly to a 14 year old girl. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.` [[ try it ]](https://chatgpt.com/?prompt=Frame%20the%20following%20text%20in%20such%20a%20way%20that%20it%20speaks%20directly%20to%20a%2014%20year%20old%20girl.%20Lorem%20ipsum%20dolor%20sit%20amet%2C%20consectetur%20adipiscing%20elit%2C%20sed%20do%20eiusmod%20tempor%20incididunt%20ut%20labore%20et%20dolore%20magna%20aliqua)


This one is very interesting because it shows how arguments for some cause can be dressed up in the language of the cause's opponents, making it easier to reach them with familiar language. Perhaps this could be helpful if a student's parents believe you're teaching the _wrong_ history. :D

Prompt: `I am trying an experiment. Write 300 words supporting BLM, but using the language style of National Review. It should demonstrate how an author's voice can be used for opinions they arent known to have.` [[ try it ]](https://chatgpt.com/?prompt=I%20am%20trying%20an%20experiment.%20Write%20300%20words%20supporting%20BLM%2C%20but%20using%20the%20language%20style%20of%20National%20Review.%20It%20should%20demonstrate%20how%20an%20author%27s%20voice%20can%20be%20used%20for%20opinions%20they%20arent%20known%20to%20have.)


## Organizational Partner

I find it very helpful to have an LLM help me turn long term tasks into organized plans that are simple to follow over time.

This an example my brother used recently when he was studying for his drone operator's license, known as the FAA 107. The table of contents comes from [the official guide](https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/remote_pilot_study_guide.pdf).

I love this example because it was **very** helpful for my brother, who passed the exam with flying colors on his first try.

```
generate a 12 week study guide for me to get my FAA 107 drone operators license based on 
this table of contents from the official study guide. put the study guide in a simple table.

Introduction page 1
Chapter 1: Applicable Regulations  page 3
Chapter 2: Airspace Classification, Operating Requirements, and Flight Restrictions  page 5
Chapter 3a: Aviation Weather Sources  page 15
Chapter 3b: Effects of Weather on Small Unmanned Aircraft Performance  page 21
Chapter 4: Small Unmanned Aircraft Loading  page 29
Chapter 5: Emergency Procedures  page 35
Chapter 6: Crew Resource Management  page 37
Chapter 7: Radio Communication Procedures  page 39
Chapter 8: Determining the Performance of Small Unmanned Aircraft  page 43
Chapter 9: Physiological Factors (Including Drugs and Alcohol) Affecting Pilot Performance  page 45
Chapter 10: Aeronautical Decision-Making and Judgment  page 51
Chapter 11: Airport Operations  page 65
Chapter 12: Maintenance and Preflight Inspection Procedures  page 71
```

[[ try it ]](https://chatgpt.com/?prompt=generate%20a%2012%20week%20study%20guide%20for%20me%20to%20get%20my%20FAA%20107%20drone%20operators%20license%20based%20on%20this%20table%20of%20contents%20from%20the%20official%20study%20guide.%20put%20the%20study%20guide%20in%20a%20simple%20table.%0A%0AIntroduction%20page%201%0AChapter%201%3A%20Applicable%20Regulations%20%20page%203%0AChapter%202%3A%20Airspace%20Classification%2C%20Operating%20Requirements%2C%20and%20Flight%20Restrictions%20%20page%205%0AChapter%203a%3A%20Aviation%20Weather%20Sources%20%20page%2015%0AChapter%203b%3A%20Effects%20of%20Weather%20on%20Small%20Unmanned%20Aircraft%20Performance%20%20page%2021%0AChapter%204%3A%20Small%20Unmanned%20Aircraft%20Loading%20%20page%2029%0AChapter%205%3A%20Emergency%20Procedures%20%20page%2035%0AChapter%206%3A%20Crew%20Resource%20Management%20%20page%2037%0AChapter%207%3A%20Radio%20Communication%20Procedures%20%20page%2039%0AChapter%208%3A%20Determining%20the%20Performance%20of%20Small%20Unmanned%20Aircraft%20%20page%2043%0AChapter%209%3A%20Physiological%20Factors%20%28Including%20Drugs%20and%20Alcohol%29%20Affecting%20Pilot%20Performance%20%20page%2045%0AChapter%2010%3A%20Aeronautical%20Decision-Making%20and%20Judgment%20%20page%2051%0AChapter%2011%3A%20Airport%20Operations%20%20page%2065%0AChapter%2012%3A%20Maintenance%20and%20Preflight%20Inspection%20Procedures%20%20page%2071)


# General Rules of Thumb

**Rule of thumb:** Be clear and specific in your prompts.

Instead of saying "Tell me about space", you could say, "Explain the difference between dark matter and dark energy". See the _more is more_ prompting technique above.

**Rule of thumb:** If a chat starts to go sideways, close it and start a new one.

There are two main things that can cause a chat's quality to collapse: the complexity of what's being asked in a prompt, and how much context is must be included in the chat. You can improve things by breaking complex requests into smaller steps or by getting the LLM to emerge information that improves its quality, as shown with the multi-turn prompt technique described above.

**Rule of thumb:** Don't use LLMs for logic. Use them to explain logic.

LLMs are pattern oriented machines. They're good at putting words together that _seem_ correct, but they're not so good at things that require nuance. They can construct sentences, but cannot reason or do math or think things through logically. They can output correct math only if that math was in the training data, and they will fail otherwise. For example, if we ask them to count how many Rs there are in the word _blueberry_, they won't be able to do it because they don't know how to count. Instead, they will depend on whether or not that question was discussed in their training data. Ask yourself, how often have you ever discussed the number of Rs in _blueberry_ and you'll start to understand why LLMs struggled so much to answer that question when GPT-5 was released a month ago.

**Rule of thumb:** Ask an LLM to verify itself.

If you're unsure if the output from an LLM is correct, you can ask it to verify its own output. Often enough, it does a good job noticing when it made mistakes. LLMs don't think, but we can kind of fake it by generating text and then asking the LLM to audit what it just wrote. Put the ideas on paper, and then edit them.

**Rule of thumb**: Use them as a speed boost.

Being careful about how your prompt them provides a lot of control over the quality of their performance. Once you have the hang of that, being able to generate lots of text, tables, images, etc, becomes a huge time saver, all without sacrificing the quality of your involvement in the process. This is worth practicing for but it doesn't happen immediately. Practice the prompting techniques described above and you'll get the hang of it!


# Good Luck!

I hope this post has given you some understanding of both how LLMs work and how you can get them to be useful. It's true that they have issues that cause reliability problems, but those can be minimized with thoughtful prompting.

Being able to produce huge amounts of reliable text on demand can be a blessing or a curse, depending on how you do it. My hope is that all of my history teacher friends experience the blessing side a lot more often after reading this post.

Good luck!


