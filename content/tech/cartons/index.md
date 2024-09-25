---
title: "Cartons"
date: 2024-09-25
image: images/tech/cartons.png
description: >
    About two months ago I decided I would immerse myself in Rust and build small project after small project, each based on familiar ideas, until I reached a point where I felt like the language made good sense. It's one thing to read about a language and something quite different to actually use it, after all. All of those projects are contained in a repo I call "Cartons", with a nod and a wink to Rust's concept of a "Crate".
tags:
   - rust
---

I've learned to use many programming languages over the years. Most of them could reasonably described as ordinary, but every now and then I come across something unlike anything else I've seen before. After all these years programming, it's also just been a long time since I felt a language offered a genuinely new idea to the world. And yet, Rust actually is like no other language I've seen before and with some genuinely new ideas too.

As I mentioned back when I wrote [this post]({{< ref "/tech/eyes" >}} "Eyes") on my first Rust program, I read the official [Rust book](https://doc.rust-lang.org/stable/book/) earlier this year. I had to stop thinking about Rust to focus on work at AI work at Penn, but around two months ago my time freed up enough to immerse myself in Rust again.

I didn't have a specific project in mind but I wanted to write Rust code anyway, so I decided to build a bunch of smaller versions of things I have built before in other languages. Rust refers to libraries as _crates_, so I decided to call my projects _cartons_, since they're standalone works but not robust enough to be entire crates. As of this writing there are 14 main projects! Most are simple, though some turned out to be quite robust, and each has a README explaining what to expect.

I started with a simple project to explore some of Rust's core features. It is a common pattern in Rust to convert from one type to another, so there is a file focused on just that. It is also a common pattern to iterate across sequences but implementing an iterator takes more work than I expected, so there is a file focused on just that too. Other core features are explored too. I then moved on to seeing how Rust handles reading and writing different formats, like dates and times, JSON, and TOML. Next, I built some command line interfaces, both simple and with elaborate subcommands.

At this point, I started to feel like I had experienced most of the basics and that I was ready to explore the weirder side of the language. In the spirit of my [Micro Army](https://github.com/jmsdnns/microarmy) project, I decided to do pools of asynchronous SSH connections. I ran several local VMs while building this. The idea is simple, you run the same command on every machine at the same time and gather the outputs from each. That's roughly what Micro Army did too. Rust has a gnarly reputation for async being difficult but this project showed me it can be awesome too.

One of my previous projects, [Schematics](https://github.com/schematics/schematics), was based on metaprogramming. I put a lot of love and work into that library, so metaprogramming is something I understand very well. Rust also supports metaprogramming, though it is done quite differently from Python, so I had to explore that next. It seems to be a rite of passage to implement Rust's `vec!` macro, so I did some of that. I then got it in mind that I should build a basic ORM, a problem well suited for metaprogramming. I didn't yet know how to use databases in Rust, so I built a carton that uses Postgres with async querying and database migrations. After getting the hang of using databases with Rust I built the ORM, called MiniORM. The postgres project is robust towards databases, but the point of the ORM was to explore using macros to generate code so it uses SQLite and skips all the migrations stuff.

Up next was to build a couple servers. I wanted to explore auth with at least one of them, so I built a carton that does async password hashing, to put the CPU intensive stuff in a background thread, and a carton for exploring how to build JWT tokens. And after that I built a whole REST API, backed by Postgres with database migrations, that uses auth managed by JWT tokens, and allows users to create and login to accounts with an endpoint that requires auth for access. This is the usual stuff found in a REST API and I can now say I've built at least one full REST API. After that I built two gRPC servers, one very basic and one more complex with multiple endpoints and support for different types of streaming.

I had a total blast and I genuinely love working with Rust. It's gotten to the point where I'm trying to convince my friends to check it out, so watch out or I'll get you too!

The code is available here: [github.com/jmsdnns/cartons](https://github.com/jmsdnns/cartons).

