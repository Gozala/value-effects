# value-effects [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]

A library for managing side-effects performed via [Tasks][value-task]. It provides all the tools necessary to create modular components that manage their own effects.

## API

### Basic Effects

#### `Effects<a>`

Represents some kind of effect. Right now this library supports tasks for arbitrary effects and clock ticks for animations.

#### `none:Effects<any>`

The simplest effect of them all: don’t do anything! This is useful when some branches of your update function request effects and others do not.

#### `task(task:Task<Never, a>) => Effects<a>`

Turn a [Task][value-task] into an `Effects` that results in an `a` value.

Normally a `Task` has a `error` type and a `success` type. In this case the `error` type is `Never` meaning that **you must provide a task that never fails**. Lots of tasks can fail (like HTTP requests), so you will want to deal with potential errors explicitly at the task level, before passing them to `task`

#### `tick(f:(time:number) => a) => Effects<a>`


Request an animation frame. This function takes a function to turn the current time into an `a` value that can be handled by the relevant component.


### Combining Effects

#### `map(f:(a:a) => b, Effects<a>) => Effects<b>`

Transform the return type of Effects. This is primarily useful for adding tags to route Actions to the right place in component hierarchy.

#### `batch(effects:Array<Effects<a>) => Effects<a>`

Create a batch of effects. The following example requests two tasks: one for the user’s picture and one for their age. You could put a bunch more stuff in that batch if you wanted!

```js
const init =
  userID =>
    [ { id: userID
      , picture: null
      , age: null
      ]
    , Effects.batch
      ( [ Effects.task(getUserPicture(userID)).map(GotUserPicture)
        , Effects.task(getUserAge(userID)).map(GotUserAge)
        ]
      )
    ]
```

### Helpers

There are some common patterns that will show up in code a lot, so there are some helper functions.

#### `toTask(address:Address<Array<a>>, Effects<a>) => Task<Never, void>`

## Install

    npm install value-effects

## Prior art

- [Effects][elm-effects] in [Elm][].

[flow]:http://flowtype.org
[Elm]:http://elm-lang.org
[Rust]:http://rust-lang.org
[elm-effects]:http://package.elm-lang.org/packages/evancz/elm-effects/latest
[value-task]:https://github.com/Gozala/value-task

[npm-url]: https://npmjs.org/package/value-effects
[npm-image]: https://img.shields.io/npm/v/value-effects.svg?style=flat

[travis-url]: https://travis-ci.org/Gozala/value-effects
[travis-image]: https://img.shields.io/travis/Gozala/value-effects.svg?style=flat
