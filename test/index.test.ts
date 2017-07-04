import "mocha";

import * as chai from "chai";
import { assert, expect } from "chai";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

import * as Rx from "rxjs";
import { IScheduler } from "rxjs/Scheduler";

import * as index from "../src/index";

chai.use(sinonChai);

let sandbox: sinon.SinonSandbox;

beforeEach(() => {
  sandbox = sinon.sandbox.create();
});

afterEach(() => {
  sandbox.restore();
});

describe("throttleDebounce", () => {
  context("when using default async scheduler", () => {
    const subject = (in$: Rx.Observable<number>) =>
      in$.let(index.throttleDebounceLet(400));

    it("still works as expected", (done) => {
      const result: number[] = [];

      subject(Rx.Observable.interval(101).take(10))
        .subscribe(
          (element: number) => {
            result.push(element);
          },
          () => null,
          () => {
            expect(result).to.deep.equal([0, 3, 7, 9]);
            done();
          }
        );
    });
  });

  context("when using a test scheduler", () => {
    let scheduler: Rx.TestScheduler;

    const subject = (in$: Rx.Observable<string>) =>
      in$.let(index.throttleDebounceLet(40, scheduler));

    beforeEach(() => {
      scheduler = new Rx.TestScheduler(assert.deepEqual);
    });

    it("terminates immediately is there's no items in the buffer", () => {
      //           0         1         2         3
      //           0123456789012345678901234567890123456789
      const IN  = "---|";
      const OUT = "---|";

      const in$ = scheduler.createHotObservable(IN);
      scheduler
        .expectObservable(subject(in$))
        .toBe(OUT);
      scheduler.flush();
    });

    it("simply repeats items separated by enough time", () => {
      //           0         1         2         3
      //           0123456789012345678901234567890123456789
      const IN  = "a----b----c---|";
      const OUT = "a----b----c---|";

      const in$ = scheduler.createHotObservable(IN);
      scheduler
        .expectObservable(subject(in$))
        .toBe(OUT);
      scheduler.flush();
    });

    it("throttles and emits last items in the window", () => {
      //           0         1         2         3
      //           0123456789012345678901234567890123456789
      const IN  = "abc---de-f----|";
      const OUT = "a---c---e---f-|";

      const in$ = scheduler.createHotObservable(IN);
      scheduler
        .expectObservable(subject(in$))
        .toBe(OUT);
      scheduler.flush();
    });

    it("returns to behavior of reemitting first item after window completes", () => {
      //           0         1         2         3
      //           0123456789012345678901234567890123456789
      const IN  = "abc------def--|";
      const OUT = "a---c----d---f|";

      const in$ = scheduler.createHotObservable(IN);
      scheduler
        .expectObservable(subject(in$))
        .toBe(OUT);
      scheduler.flush();
    });

    it("terminates after re-emitting the last item", () => {
      //           0         1         2         3
      //           0123456789012345678901234567890123456789
      const IN  = "ab|";
      const OUT = "a---(b|)";

      const in$ = scheduler.createHotObservable(IN);
      scheduler
        .expectObservable(subject(in$))
        .toBe(OUT);
      scheduler.flush();
    });
  });
});
