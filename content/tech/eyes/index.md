---
title: Eyes
date: 2024-02-16
image: images/tech/the_eyes.gif
draft: true
description: "I have been dabbling with writing Rust code. I tell the story of using Rust to build a small project; a non-blocking, asynchronous port scanner called Eyes."
tags:
   - rust
   - netsec
---

Rust appears to be taking over a mindshare that has long been considered unwaccessible to anything other than C++. The language makes some fascinating security guarantees at time when it seems like the C++ community is just so tired of struggling with the language to build secure systems. Stuff built with Rust can often be faster than C++ too, so there is a perception that just using it makes things both more secure and faster.

Amusingly, there had been a lot of debate, before I started Eyes, about the experience of writing asynchronous code in Rust. This gives me flashbacks to the days of debating Twisted, Tornado, and gevent with the Python community. _I was in the gevent camp and created a (now defunct) web framework called "[Brubeck](https://github.com/j2labs/brubeck)" with gevent at its core._ I felt at home immediately inside the context of async & Rust.

A port scanner makes a nice first project when dabbling with network APIs because all you have to do is try opening a port and then reporting whether or not that worked. Nothing complicated about a for loop over some list of ports. And, I should be able to do all the network calls with async code. 

# Learning Rust

<img src="Studying.gif">

I began by reading / studying [The Rust Book](https://doc.rust-lang.org/stable/book/). This book was mostly great, but it felt casual with some ideas that I thought might deserve some more hand holding, for anyone not already intimately familiar with types and memory management.

The section on [_References and Borrowing_](https://doc.rust-lang.org/stable/book/ch04-02-references-and-borrowing.html) genuinely blew my mind. I've been writing code a long time and I don't come across to many new ideas anymore, but the way Rust manages memory is like nothing I've seen before. I'm super into it.

After reaching a point where I had read most of the book, I watched a bunch of Rust videos by [Trevor Sullivan](https://www.youtube.com/@TrevorSullivan), and figured its time to see if I can put together a familiar idea using what I understood so far of Rust. I wanted to try async too and got the [impression from Trevor](https://www.youtube.com/watch?v=PabDPIrt9fk), which was supported by my buddy [Zeeshan](https://types.pl/@zeeshanlakhani), that the [Tokio](https://tokio.rs/) library is the best way right now. That may change in the future, because it seems there are lots of asynchronous models for Rust, which it calls _runtimes_. I didn't have any opinions yet, so I figured I'd go for it and learn what I can along the way.

# App Structure

The rough flow of the app would be to parse some command line args into a structure that configures a single scan operation. If the CLI args parse properly, the config would be passed to the scanning code which would then report results after a successful scan.

## Scan Config

Rust's data structures are either types or a composite of types called a `struct`. This would be ideal for storing a scan config. At its core, the scan config should have a target and a list of ports to scan.

```rust
use std::net::IpAddr

struct ScanConfig {
    target_ip: IpAddr,
    ports: Vec<u16>,
}
```

_Rust allows us to associate functions with structs, but that won't be necessary for this project._

## CLI Structure

One of Trevor's videos covers how to [parse CLI args](https://www.youtube.com/watch?v=Ot3qCA3Iv_8) using the [Clap](https://docs.rs/clap/latest/clap/) library. Seemed straight forward enough, so I went for it.

Clap felt a lot like other CLI parsing libraries I've used. Python's argparse is quite similar, for example. You give a name to the flag, set some params about how it behaves, and then give it a function that modifies a scan config based on how the flag is used. They all do this, so I spent 30 minutes reading about it and had the basics together soon after.

```rust
let cli = Command::new("eyes")
    // <target>
    .arg(
        Arg::new("target")
            .help("The IP to scan")
            .required(true)
            .index(1),
    )
    // --ports <arg>
    .arg(
        Arg::new("ports")
            .help("List of ports to scan")
            .long("ports")
            .short('p')
            .default_value("1-1024"),
    )
    ...
```

I had ideas for a few more parameters, but needed more of the scanner to be implemented before they were worth thinking about. All I need for a bare minimum port scanner is the target and a ports list.

## CLI Parsing

This part was fun to implement. It allowed me to kick the tires on some of Rust's more exotic syntax.

First, let's check the `target` param.

```rust
let target = args.get_one::<String>("target").expect("required");
```

Easy enough.

Next, ports. In the snippet below, we check if there is a single value for the `ports` param. If so, parse it. If not, parse a default value, eg. a string that resembles what a user might type on the cli: `1-1024`.

```rust
let ports = match args.get_one::<String>("ports") {
    Some(p) => parse_ports(String::from(p)),
    _ => parse_ports(String::from("1-1024"))
};
```

Notice the `match` syntax here. We also see `Some` as one of the patterns being matched. This syntax will look strange to folks who haven't used an [Option type](https://en.wikipedia.org/wiki/Option_type) before. It's an old concept that essentially uses type theory to force the callers of a function to handle multiple specific results from calling the function. More specifically, a function can require that its caller handles both the success and error case, which proponents of type systems tend to love. _Rust is both strongly typed & statically typed._ In this case, we match when _some value is present_ or when something else happens, eg. no value is present.

## Parse Ports

The venerable nmap has had syntax for decades that allows you to succinctly describe complex lists of ports. I figured I'd follow the same tradition.

Ports can be expressed as a list of numbers:

```
eyes <target> -p 22,80,1336
```

A range of numbers:

```
eyes <target> -p 22-80
```

A mix of both:

```
eyes <target> -p 22,80,8000-8099,443,8443,3000-3443
```

Let's start with the easiest case: _no port args!_ We'll set the list of ports to the default ports and return that.

```rust
fn parse_ports(ports_arg: String) -> Vec<u16> {
    let mut ports: Vec<u16> = Vec::new();

    // Default to range of ports: `1-1024`
    ports.extend(1..=1024);

    ports
}
```

We'll add support for a single port.

```rust
fn parse_ports(ports_arg: String) -> Vec<u16> {
    let mut ports: Vec<u16> = Vec::new();

    if let Ok(p) = ports_arg.parse::<u16>() {
        ports.push(p);
    }
    else {
        ports.extend(1..=1024);
    }  

    ports
}
```

A port range is next. To do this, we will check for a hyphen and if we find one, generate a list of numbers from the left side to the right side. When expresse this idea in Rust, we finally start to see some of the weirder syntax that is common in Rust.

Here is the code that splits a string into two numbers. The call to `.parse::<u16>` does the type conversion, and whether or not that succeeded is expressed as an _Option type_, so we _unwrap_ the option to get the value, and then collect both of them into a vector.

```rust
ports_arg.split('-').map(|x: &str| x.parse::<u16>().unwrap()).collect();
```

It starts to look normal very quickly, especially as the use of option types proves itself over time. Anyway, when we add it to our growing `parse_ports` function, we now have:

```rust
fn parse_ports(ports_arg: String) -> Vec<u16> {
    let mut ports: Vec<u16> = Vec::new();

    // Range of ports found: `x-z`
    if ports_arg.contains("-") {
        let range: Vec<u16> = ports_arg.split('-').map(|x: &str| x.parse::<u16>().unwrap()).collect();
        ports.extend(range[0]..=range[1]);
    }
    // Single port found: `x`
    else if let Ok(p) = ports_arg.parse::<u16>() {
        ports.push(p);
    }
    // Default to range of ports: `1-1024`
    else {
        ports.extend(1..=1024);
    }  

    ports
}
```

The craziest part comes next because it handles strings that might be lists of things, which includes individual ports or port ranges. To do that, we'll split on commas and iterate across whatever we find there: either individual ports or port ranges.

Once we split on commas, the logic is basically the same as what we already wrote for ranges or single ports. We could copy it over (_for the sake of simplicity in our first app_) and perhaps we're done.

The completed function, with list handling at the top:

```rust
fn parse_ports(ports_arg: String) -> Vec<u16> {
    let mut ports: Vec<u16> = Vec::new();

    // List of ports found: `x,y,z`
    if ports_arg.contains(",") {
        let ps = ports_arg.split(",");
        for p in ps {
            // List item is port range: `x-z`
            if p.contains("-") {
                let range: Vec<u16> = p.split('-').map(|x: &str| x.parse::<u16>().unwrap()).collect();
                ports.extend(range[0]..=range[1]);
            }
            // List item is single port: `x`
            else {
                if let Ok(p) = p.parse::<u16>() {
                    ports.push(p);
                }
            }
        }
    }
    // Range of ports found: `x-z`
    else if ports_arg.contains("-") {
        let range: Vec<u16> = ports_arg.split('-').map(|x: &str| x.parse::<u16>().unwrap()).collect();
        ports.extend(range[0]..=range[1]);
    }
    // Single port found: `x`
    else if let Ok(p) = ports_arg.parse::<u16>() {
        ports.push(p);
    }
    // Default to range of ports: `1-1024`
    else {
        ports.extend(1..=1024);
    }    

    ports
}
```

## Scan 1 Port

At this point, the code can parse the command line and create a data structure that stores the results. Next, we'll write a function to scan a single port. This is where the network code finally begins.

Those familiar with asynchronous programming will recognize a few things. Namely, `async / await` syntax.


```rust
async fn open_port(c: &ScanConfig, port: u16) {
    let timeout = Duration::from_secs(3);
    let socket_address = SocketAddr::new(c.target_ip.clone(), port);

    match tokio::time::timeout(timeout, TcpStream::connect(&socket_address)).await {
        Ok(Ok(_)) => println!("{}: open", port),
        _ => println!("{}: closed", port)
    }
}
```

To start, we'll use a 3 second timeout and convert the target IP to a proper Rust type, `SocketAddr`.

This match statement is pretty neat. It shows that you can match the internal structures of things by matching `Ok(Ok(...))`. This allows the code to say TcpStream::connect return an `Ok`, which was wrapped in the timeout also returning an `Ok`. If the TCP connect is _ok_ the function will reports the port as open, if anything else happens the port is reported as closed.

## Scan N Ports

The system is asynchronous, so we convert the list of ports in the scan config to a stream that can be iterated asynchronously, and we spawn a single coroutine for each port in the list.

The steps necessary to convert the list of ports to an async stream are not obvious. We clone the list, store it somewhere, create an iterator for it, and then generate the stream from that iterator.

We then spawn a coroutine that scans each port in the stream.


```rust
async fn scan(sc: &ScanConfig) {
    let port_stream = stream::iter(Box::new(sc.ports.clone()).into_iter());
    port_stream
        .for_each_concurrent(5, |port| open_port(sc, port))  // 5 scans at once
        .await;
    println!("[eyes] Finished scan");
}
```

Code like this can seem unwieldy when you first encounter it, but knowing your code won't from type mismanagement is worth all the extra work. You'll see.


# Project

The actual code for Eyes is more robust than what's explained here. I also used this project to experiment with Rust's commenting conventions, so there are plenty of comments in it too.

## [Repo](https://github.com/jmsdnns/eyes)

And the README will tell you how to use it, repeating some of what you just read.

## [Readme](https://github.com/jmsdnns/eyes/blob/main/README.md)
