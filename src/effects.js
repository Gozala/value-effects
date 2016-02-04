/* @flow */


import {succeed, perform, task} from "./task"

/*::
import type {Effects, Address, To, Never, Time} from "./effects"
import type {Task} from "./task"
export type {Effects, Never, Time}
*/

// The simplest effect of them all: don’t do anything! This is useful when
// some branches of your update function request effects and others do not.
class None /*::<a>*/ {
  /*::
  type: "Effects";
  */
  map/*::<b>*/(f/*:To<a, b>*/)/*:Effects<b>*/ {
    return none
  }
  toTask(address/*:Address<a>*/)/*:Task<Never, void>*/ {
    return succeed(void(0))
  }
}
None.prototype.type = "Effects"

export const none/*:Effects<any>*/ = new None()

class Job /*::<a>*/ {
  /*::
  type: "Effects";
  task: Task<Never, a>;
  */
  constructor(task/*:Task<Never, a>*/) {
    this.task = task
  }
  map/*::<b>*/(f/*:To<a, b>*/)/*:Effects<b>*/ {
    return new Job(this.task.map(f))
  }
  toTask(address/*:Address<a>*/)/*:Task<Never, void>*/ {
    return task((succeed, fail) => {
      this.task.fork
      ( value => address(value)
      // Flow fails to infer that `error` passed to fail is of the `Never`
      // type there for we trick it into beleiving it.
      , (fail/*::, (error:Never) => fail(error)*/)
      )

      succeed(void(0))
    })
  }
}
Job.prototype.type = "Effects"

class Batch /*::<a>*/ {
  /*::
  type: "Effects";
  effects: Array<Effects<a>>;
  */
  constructor(effects/*:Array<Effects<a>>*/) {
    this.effects = effects
  }
  map/*::<b>*/(f/*:To<a, b>*/)/*:Effects<b>*/ {
    return new Batch(this.effects.map(fx => fx.map(f)))
  }
  toTask(address/*:Address<a>*/)/*:Task<Never, void>*/ {
    return task((succeed, fail) => {
      this
      .effects
      .map(fx => fx.toTask(address))
      .forEach(perform)

      succeed(void(0))
    })
  }
}
Batch.prototype.type = "Effects"

const ignore = x => void(x)

const toTaskArray = /*::<a>*/
  ( address: Address<a>
  , effect: Effects<a>
  , task: Task<Never, void>
  , tickers: Array<To<Time, a>>
  ):[Task<Never, void>, Array<To<Time, a>>] => {
    if (effect instanceof Job) {
      const reporter =
        effect.task.chain(answer => Signal.send(address, [answer]))

      const result =
        [ task.then(_ => Task.spawn(reporter).map(ignore))
        , tickers
        ]

      return result
    }
    else if (effect instanceof Tick) {

    }
    else if (effect instanceof Batch) {

    }
    else if (effect instanceof None) {

    }
  }

export const job = /*::<a>*/
  (task/*:Task<Never, a>*/)/*:Effects<a>*/ =>
  new Job(task)

// Request a clock tick for animations. This function takes a function to turn
// the current time into an `a` value that can be handled by the relevant
// component.
export const tick = /*::<a>*/
  (stamp/*:(time:Time) => a*/)/*:Effects<a>*/ =>
  new Job(task((fail, succeed) => {
    window.requestAnimationFrame(succeed)
  }).map(stamp))

export const receive = /*::<a>*/
  (action/*:a*/)/*:Effects<a>*/ =>
  new Job(succeed(action))

// Create a batch of effects. The following example requests two tasks: one
// for the user’s picture and one for their age. You could put a bunch more
// stuff in that batch if you wanted!
//
//  const init = (userID) => [
//    {id: userID, picture: null, age: null},
//    batch([getPicture(userID), getAge(userID)])
//  ]
//
export const batch = /*::<a>*/
 (effects/*:Array<Effects<a>>*/)/*:Effects<a>*/ =>
 new Batch(effects)


export const nofx = /*::<model, action>*/
  (model/*:model*/)/*:[model, Effects<action>]*/ =>
  [model, none];
