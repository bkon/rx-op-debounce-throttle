import { Observable, Scheduler, Subscription } from "rxjs";
import { IScheduler } from "rxjs/Scheduler";

function throttleDebounceOp<T>(
  size: number,
  scheduler: IScheduler
) {
  scheduler = scheduler || Scheduler.async;

  return new Observable((observer) => {
    let done: boolean = false;
    let lastItem: T;
    let nextAllowedEmission: number = 0;

    const group = new Subscription();

    const emit = (value: T) => {
      observer.next(value);

      lastItem = undefined;
      nextAllowedEmission = scheduler.now() + size;
      scheduler.schedule(endWindow, size);
    };

    const endWindow = () => {
      if (lastItem !== undefined) {
        emit(lastItem);
      }

      if (done) {
        observer.complete();
      }
    };

    group.add(this.subscribe(
      (value: T) => {
        if (nextAllowedEmission > scheduler.now()) {
          lastItem = value;
          return;
        }

        emit(value);
      },
      observer.error.bind(observer),
      () => {
        done = true;
        if (nextAllowedEmission < scheduler.now() || lastItem === undefined) {
          observer.complete();
        }
      }
    ));

    return group;
  });
}

const throttleDebounceLet = <T>(
  size: number,
  scheduler: IScheduler
) => (
  source: Observable<T>
): Observable<T> => {
  return throttleDebounceOp.call(source, size, scheduler);
};

export { throttleDebounceOp, throttleDebounceLet };
