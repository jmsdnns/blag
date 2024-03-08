---
title: Eyes
date: 2024-03-08
image: images/tech/the_eyes.gif
draft: true
description: "I have been dabbling with writing Rust code. I tell the story of using Rust to build a small project; a non-blocking, asynchronous port scanner called Eyes."
tags:
   - rust
   - netsec
---

Rust appears to be taking over a mindshare that has long been considered unaccessible to anything other than C++. The language makes some fascinating security guarantees at a time when it seems like the C++ community is tired of struggling with using the language to build secure systems, and when younger generations are choosing not to take on that pain. Stuff built with Rust can often be faster than C++ too. From what I can tell, there is a perception that just choosing to use Rust makes software both more secure and faster.

There had been a lot of debate, before I started Eyes, about the experience of writing asynchronous code in Rust. This is amusing for me, as it gives me flashbacks of debating the merits of Twisted, Tornado, and gevent with the Python community. Around 12 years ago I was in the gevent camp and created a (_now defunct_) web framework called "[Brubeck](https://github.com/j2labs/brubeck)", which had gevent at its core. What Rust has in common with the Python from years ago, is that the asynchronous programming details are done at the library level. This approach leaves a lot of the implementation details up to whomever implements a library, which allows a lot of creativity but risks dividing the rust community around frameworks. Python eventually took a position and now asych is available at the language layer, though libraries still exist. I expect Rust to do something similar, but it isn't there yet, so I want to explore one of the libraries somehow.

For a simple first project, I thought a port scanner would be great for a first experience checking out async network APIs. All you have to do is try opening the port and then report if that worked or not. Intuitively, the gist is to try opening each port from a list of ports requested by the user, and using an async library will let us open a ton of ports at the same time.

A port scanner also needs a simple command line interface. There are many CLI tools written in Rust, so I went in assuming there would be great libraries for this, and I wasn't disappointed. The experience felt similar to what `argparse` does for the Python community.

My goal for this post is to explain the basics of building a Rust program in such a way that people who have not tried Rust before see familiar ideas laid out in a new language and give it a shot. If I can't convince you, maybe [The White House can](https://www.whitehouse.gov/wp-content/uploads/2024/02/Final-ONCD-Technical-Report.pdf). Or [NSA](https://media.defense.gov/2022/Nov/10/2003112742/-1/-1/0/CSI_SOFTWARE_MEMORY_SAFETY.PDF).

But first, let me share the gist of how I first approached learning some Rust.


# Learning Rust

![Anime style animation of someone studying heroically.](Studying.gif)

I began by reading / studying [The Rust Book](https://doc.rust-lang.org/stable/book/). This book was mostly great, but it felt casual with some ideas that I thought might deserve some more hand holding. For example, some of Rust's best ideas won't land with anyone not already familiar with types and memory management.

The section on [_References and Borrowing_](https://doc.rust-lang.org/stable/book/ch04-02-references-and-borrowing.html) genuinely blew my mind. I've been writing code a long time and I don't come across to many new ideas anymore, but the way Rust manages memory is like nothing I've seen before. I'm super into it.

Understanding _borrowing_ is necessary for writing Rust. It will produce compilation errors for code that does not use it properly, so there are no short-cuts here. I spent time writing little programs that tested the edge cases for memory handling, as I understood them, and built some confidence from seeing how Rust actually behaves. I eventually reached a point where I had read most of the book, so I thought I'd switch to finding the Rust community online and learning about whatever cool stuff Rust hackers have built.

[Trevor Sullivan](https://www.youtube.com/@TrevorSullivan) has made a bunch of excellent videos that quickly cover how to do things in Rust. I treated his archive as a cookbook and learned a lot quickly. I loved the videos on [using Tokio for async](https://www.youtube.com/watch?v=PabDPIrt9fk) and [using Clap for parsing CLI args](https://www.youtube.com/watch?v=Ot3qCA3Iv_8).

After perusing youtube I found a vibrant community of people who post to the [#rustlang](https://mastodon.social/tags/rustlang) tag on Mastodon. I'm sure the community is present on other networks too.


# The Design

The rough flow of the way I see the app starts with parsing command line args. If the CLI args parse properly, we'll run the scan. If not, we'll print a help menu.

## UX

Using it should be easy. The only argument we need is who to scan, eg. the target.

```shell
$ eyes 127.0.0.1
```

Here is what I want the cli to look like when ports are specified. If no ports argument is given, Eyes will scan ports 1-1024.

```shell
$ eyes --ports 80,443,8080,8443 127.0.0.1
```

A simple help menu would tell the user a target is required and that they can, but don't have to, choose which ports to scan. And of course, that there is a help menu.

```shell
$ eyes 
Usage: eyes [OPTIONS] <target>

Arguments:
  <target>  The IP to scan

Options:
  -p, --ports <ports>              List of ports to scan [default: 1-1024]
  -h, --help    
```

Now that we have a sense of what we want the experience to be like, we can consider the structure of the program itself.


## Scan Config

The simple model described above can be represented in a a single data structure with two fields: the target and which ports to scan. We'll call this structure a `ScanConfig`. Later, when we implement the functions that do the port scanning, we'll implement them such that they receive this structure as input.

The scan config should be everything a scanning function needs to perform a scan. If DNS is required to convert a host's name to an IP address, that should be done during CLI parsing so that the target is only tracked by IP in the scan config.

One of the criticisms of Rust is that it has a lot of types that are represented more simply in other languages. Rust wants code that is very specific, which is a good thing in the world of typed languages, but it can seem cumbersome for folks used to languages like Javascript or Python. For us, this means we'll get the concept of a list of ports by implementing a vector of 16-bit unsigned integers, written as `Vec<u16>`. Port numbers themselves are implemented as 16-bit unsigned integers, after all.


```rust
use std::net::IpAddr

struct ScanConfig {
    target_ip: IpAddr,
    ports: Vec<u16>,
}
```

Rust allows us to [associate functions with structs](https://doc.rust-lang.org/book/ch05-03-method-syntax.html#associated-functions) too, but that won't be necessary for this project.


## CLI Structure

One of Trevor's videos covers how to [parse CLI args](https://www.youtube.com/watch?v=Ot3qCA3Iv_8) using the [Clap](https://docs.rs/clap/latest/clap/) library. Seemed straight forward enough, so I went for it.

Clap felt a lot like other CLI parsing libraries I've used. Python's argparse is quite similar, for example. You give a name to the flag, set some params about how it behaves, and a function that verifies if the input can be converted from a string to some other type, like a boolean or number.

Clap supports two methods of defining CLI args. There is the approach I used below, which will look more familiar to people who don't yet write Rust. The other, briefer approach is [based on macros](https://docs.rs/clap/latest/clap/_derive/_cookbook/typed_derive/index.html), which I don't want to use until I've studied them more.

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

Notice the `--ports` flag can be shortened to `-p`.


## CLI Parsing

This part was fun to implement. It allowed me to kick the tires on some of Rust's more interesting syntax.

This next snippet checks for the target parameter and throws an error if it is not present. It also makes uses of Rust's _Turbofish Operator_, which looks like `::<Type>`. This is syntax for providing type information in contexts where the types can't be automatically inferred. In this context, we tell clap that the target parameter should be a `String`.

```rust
let target = args.get_one::<String>("target").expect("required");
```

Up next, we either gets ports from the user or we go with a default value, which is then passed to `parse_ports` to convert it into a `Vec<u16>`, the same structure we used in the `ScanConfig`.

```rust
let ports = match args.get_one::<String>("ports") {
    Some(p) => parse_ports(String::from(p)),
    _ => parse_ports(String::from("1-1024"))
};
```

Notice the `match` syntax here. The pattern we match first is a thing called `Some`. This syntax will look strange to folks who unfamiliar with [Option types](https://en.wikipedia.org/wiki/Option_type). In our context, the basic idea is that when a user uses the ports flag, they are giving us _some value_ as input. If they don't use the ports flag, then we did not get _some value_, so the pattern doesn't match and we fall back to using a default value.

In a more general context, the idea is that a function can return a type that forces the caller of the function to explicitly handle both the success case and the error case. Contrast this with exceptions, where the programmer does not need to catch every exception, and thus can crash their program with unexpected exceptions. Also contrast this with how Go does this, where code must check if a function returned nil for the error output over and over again. To me, option types are a clean and reliable way to handle errors precisely because of the way a function can force behavior on its caller.

Later we will see syntax that has `.unpack` in it. This is one of the ways we extract the actual data out of the Option type.


## Parse Ports

The venerable [nmap](https://nmap.org/) has had syntax for decades that allows you to succinctly describe complex lists of ports. I figured I'd follow in nmap's footsteps and do the same thing.

Ports expressed as a list of numbers:

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

Let's start with the easiest case: no ports specified by user.


### No Input

We can use Rust syntax for a range to build a list of numbers between 1 and 1024: `1..=1024`.

```rust
fn parse_ports(ports_arg: String) -> Vec<u16> {
    let mut ports: Vec<u16> = Vec::new();

    // Default to range of ports: `1-1024`
    ports.extend(1..=1024);

    ports
}
```


### Single Port

Next step is to check if the ports arg contains a string that can be converted to a 16-bit number. This is done using [if let syntax](https://doc.rust-lang.org/rust-by-example/flow_control/if_let.html).

```rust
if let Ok(p) = some_function() {
    // p has a value here
    println!(p);
}
else {
    // p is undefined here
    println!("function didn't work");
}
```

If `some_function` returns `Ok`, we can do something with `p` in the block below. This syntax makes it very succinct to work with type based control flow. For our context, we'll use the syntax to check if we got a single number for the ports flag. If so, our ports list will have a single item in it.


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


### Port Range

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

### List of Ports (and Port Ranges)

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
