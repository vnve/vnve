export class FrameTicker<ITickCtx> {
  public tickCtx: ITickCtx;
  public interceptor: {
    _beforeAllList: Array<(ickCtx: ITickCtx) => Promise<void>>;
    _afterAllList: Array<(tickCtx: ITickCtx) => Promise<void>>;
    _beforeList: Array<(timestamp: number, tickCtx: ITickCtx) => Promise<void>>;
    _afterList: Array<(timestamp: number, tickCtx: ITickCtx) => Promise<void>>;
    beforeAll: (
      beforeAllCallback: (tickCtx: ITickCtx) => Promise<void>,
    ) => void;
    afterAll: (afterAllCallback: (tickCtx: ITickCtx) => Promise<void>) => void;
    before: (
      beforeCallback: (timestamp: number, tickCtx: ITickCtx) => Promise<void>,
    ) => void;
    after: (
      afterCallback: (timestamp: number, tickCtx: ITickCtx) => Promise<void>,
    ) => void;
  };
  private listeners: Array<{
    tick: (timestamp: number, tickCtx: ITickCtx) => Promise<void>;
    context: unknown;
    priority: number;
  }>;
  private running: boolean;

  constructor(tickCtx: ITickCtx) {
    this.tickCtx = tickCtx;
    this.interceptor = {
      _beforeAllList: [],
      _afterAllList: [],
      _beforeList: [],
      _afterList: [],
      beforeAll: (cb) => {
        this.interceptor._beforeAllList.push(cb);
      },
      afterAll: (cb) => {
        this.interceptor._afterAllList.push(cb);
      },
      before: (cb) => {
        this.interceptor._beforeList.push(cb);
      },
      after: (cb) => {
        this.interceptor._afterList.push(cb);
      },
    };
    this.listeners = [];
    this.running = false;
  }

  public add(
    tick: (timestamp: number, tickCtx: ITickCtx) => Promise<void>,
    context: unknown = null,
    priority = 0,
  ) {
    this.listeners.push({
      tick,
      context,
      priority,
    });
  }

  public async run(duration: number, fps: number) {
    this.running = true;
    const frameCount = Math.ceil((duration / 1000) * fps);

    for (const beforeAll of this.interceptor._beforeAllList) {
      await beforeAll.call(null, this.tickCtx).catch((e) => {
        this.running = false;
        throw e;
      });
    }

    for (let i = 0; i <= frameCount; i++) {
      const frameDuration = 1000 / fps;
      const timestamp = i * frameDuration;

      if (!this.running) {
        throw new Error("stop");
      }

      await this.tick(timestamp).catch((e) => {
        this.running = false;
        throw e;
      });
    }

    for (const afterAll of this.interceptor._afterAllList) {
      await afterAll.call(null, this.tickCtx).catch((e) => {
        this.running = false;
        throw e;
      });
    }

    this.running = false;
  }

  public stop() {
    this.running = false;
  }

  public async tick(timestamp: number) {
    const tickCtx = this.tickCtx;
    const listeners = this.listeners;

    for (const before of this.interceptor._beforeList) {
      await before.call(null, timestamp, tickCtx);
    }

    for (const listener of listeners) {
      await listener.tick.call(listener.context, timestamp, tickCtx);
    }

    for (const after of this.interceptor._afterList) {
      await after.call(null, timestamp, tickCtx);
    }
  }

  public remove(tick: (timestamp: number, tickCtx: ITickCtx) => Promise<void>) {
    this.listeners = this.listeners.filter(
      (listener) => listener.tick !== tick,
    );
  }

  public removeAll() {
    this.listeners = [];
  }

  public reset() {
    this.interceptor._beforeAllList = [];
    this.interceptor._afterAllList = [];
    this.interceptor._beforeList = [];
    this.interceptor._afterList = [];
    this.listeners = [];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.tickCtx = {};
  }
}
