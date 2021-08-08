const debug: boolean = true;

export default {
  log: (...args: any[]) => !debug || console.log(...args),
  error: (...args: any[]) => !debug || console.error(...args)
}