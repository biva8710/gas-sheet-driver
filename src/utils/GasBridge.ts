declare const globalThis: any;
declare const self: any;
declare const window: any;
declare const global: any;
declare const google: any;

/**
 * A bridge to call server-side GAS functions from the client-side.
 * Works in both GAS and local environments.
 *
 * In GAS environment, it wraps `google.script.run` in a Promise.
 * In local environment, it calls functions from the global scope (window or global).
 *
 * @example
 * ```typescript
 * GasBridge.run.someServerFunction(arg1, arg2)
 *   .then(result => console.log(result))
 *   .catch(err => console.error(err));
 * ```
 */
export const GasBridge = {
  run: new Proxy({} as any, {
    get(_, prop: string) {
      return (...args: any[]) => {
        // Access global scope safely
        const g: any =
          typeof globalThis !== 'undefined'
            ? globalThis
            : typeof self !== 'undefined'
            ? self
            : typeof (global as any) !== 'undefined'
            ? global
            : {};

        // 1. GAS Environment (Production)
        if (g.google && g.google.script && g.google.script.run) {
          return new Promise((resolve, reject) => {
            g.google.script.run
              .withSuccessHandler(resolve)
              .withFailureHandler(reject)[prop](...args);
          });
        }

        // 2. Local Environment (Development/Test)
        const fn = g[prop];
        if (typeof fn === 'function') {
          // Simulate async behavior of GAS
          return new Promise((resolve, reject) => {
            try {
              const result = fn(...args);
              setTimeout(() => resolve(result), 10);
            } catch (error) {
              setTimeout(() => reject(error), 10);
            }
          });
        }

        return Promise.reject(new Error(`Server function "${prop}" not found.`));
      };
    },
  }),
};
