import chalk from 'chalk'
import pkg from 'microtime'
const { now: microTime } = pkg

import { lodashPadCenter, lodashPadStart, lodashPadEnd, isAsyncFunction, isString, isNil, isFunction, isNumber } from './util.js'
// applyExtensions()

const DefaultBenchmarkOptions = {
    name: '',
    iters: 10000,
    warmup: 0,
    saveResults: false,
    writeLine: (msg, ...args) => console.log(`${this?.opts?.name ?? '[Bench]'}:${msg}`, ...args),
}

const manualMax = function (nums) {
    let max = -Infinity
    for (const num of nums) {
        if (num > max) max = num
    }

    return max
}

const manualMin = function (nums) {
    let min = Infinity
    for (const num of nums) {
        if (num < min) min = num
    }

    return min
}

const manualSum = function (nums) {
    let sum = 0
    for (const num of nums) {
        sum += num
    }

    return sum
}

/**
 * Aligns the given parts such that `l` is padded left by 25, `mid` is
 * padded center by 15, and `r` is padded right by 25.
 * @param {string} left The left side string.
 * @param {string} mid The middle part.
 * @param {string} right The right side.
 * @param {string?} [padChar=' '] The character to pad with.
 * @param {[number, number, number]?} [sizes=[25, 15, 25]] The sizes of each part.
 * @returns {[string, string, string]} The aligned parts.
 */
const lmr = function (left, mid, right, chars = ' ', sizes = [25, 15, 25]) {
    if (isNil(left)) {
        left = '<ERROR NULL>'
    }
    if (isNil(mid)) {
        mid = '<ERROR NULL>'
    }
    if (isNil(right)) {
        right = '<ERROR NULL>'
    }
    const ch = isString(chars) ? chars : ' '
    const [ls, ms, rs] = Array.isArray(sizes) && sizes.length === 3 ? sizes : [25, 15, 25]
    return [lodashPadStart(left, ls, ch), lodashPadCenter(mid, ms, ch), lodashPadEnd(right, rs, ch)]
}

export class BenchmarkResult {
    #isEmpty = false
    /**
     * The options with which the benchmark was run.
     * @type {BenchmarkOptions}
     */
    opts = {}
    /**
     * The times of each run (in microseconds).
     * @type {number[]}
     */
    results = []
    /**
     * The average time of all runs (in microseconds).
     * @type {number}
     */
    average = 0
    /**
     * The slowest time of all runs (in microseconds).
     * @type {number}
     */
    slowest = 0
    /**
     * The fastest time of all runs in microseconds.
     * @type {number}
     */
    fastest = 0
    /**
     * The number of executions that (presumably) failed. This is determined by comparing the 
     * expected iteration count and the actual number of the times array.
     * @type {number}
     */
    failures = 0
    /**
     * The total time of all results.
     * @type {number}
     */
    totalRuntime = 0

    /**
     * Create a new BenchmarkResult. The options are saved just in case, and the
     * `times` array is analyzed to determine the results. Call `prettyString()`
     * to get a pretty string to display.
     * @param {BenchmarkOptions} opts The options with which the benchmark was run.
     * @param {number[]} times The times in microseconds.
     */
    constructor(opts, times) {
        const hasIters = 'iters' in opts && isNumber(opts.iters) && opts.iters >= 0
        const hasTimes = 'length' in times && isNumber(times.length) && times.length > 0

        if (!hasTimes) {
            console.warn(`No times were passed to BenchmarkResult!`)
            this.#isEmpty = true
            return
        }

        if (hasIters && opts.iters !== times.length) {
            this.failures = opts.iters - times.length
        }

        this.opts = { ...opts }
        this.results = [...times]
        const total = times.reduce((a, b) => a + b, 0)
        this.totalRuntime = total / 1e+6
        this.average = times.length === 0 ? Number.NaN : total / times.length
        this.slowest = manualMax(times)
        this.fastest = manualMin(times)

    }

    /**
     * Generate a pretty string to display the contents of this result.
     * @returns {string} A pretty string displaying the results.
     */
    prettyString() {
        let lines = []
        lines.push(chalk.whiteBright(`Benchmark:`) + ' ' + chalk.yellow(this.opts.name))
        lines.push(chalk.grey(`\tRan ${chalk.green(this.opts.iters)} iterations${this.opts.warmup ? ` with ${chalk.cyan(this.opts.warmup)} warmup rounds.` : '.'}`))
        lines.push(chalk.grey(`\tAverage run time: ${chalk.yellow(this.average.toPrecision(5).padStart(20))}μs.`))
        lines.push(chalk.grey(`\tFastest run time: ${chalk.green(this.fastest.toString().padStart(20))}μs.`))
        lines.push(chalk.grey(`\tSlowest run time: ${chalk.red(this.slowest.toString().padStart(20))}μs.`))
        const percent = this.failPercent()
        const color = this.shadeFailureColor(percent)
        const failureCount = color(this.failures)
        const failurePercent = color(percent)
        lines.push(chalk.grey(`\tFailures: ${failureCount} / ${chalk.white(this.opts.iters)} (${failurePercent}%).`))
        lines.push(chalk.grey(`\tTotal Runtime ${chalk.bold('(in sec.)')}: ${chalk.yellow(this.totalRuntime.toPrecision(4).padStart(20))}s.`))

        return lines.join('\n')
    }

    /**
     * Generate a plain (uncolored) string to display the contents of this result.
     * @returns {string} A plain string displaying the results.
     */
    plainString() {
        let lines = []
        lines.push(`Benchmark: ${this.opts.name}`)
        lines.push(`\tRan ${this.opts.iters} iterations${this.opts.warmup ? ` with ${this.opts.warmup} warmup rounds.` : '.'}`)
        lines.push(`\tRan ${this.opts.iters} iterations${this.opts.warmup ? ` with ${this.opts.warmup} warmup rounds.` : '.'}`)
        lines.push(`\tAverage run time: ${this.average.toPrecision(5).padStart(20)}μs.`)
        lines.push(`\tFastest run time: ${this.fastest.toString().padStart(20)}μs.`)
        lines.push(`\tSlowest run time: ${this.slowest.toString().padStart(20)}μs.`)
        lines.push(`\tFailures: ${this.failures} / ${this.opts.iters} (${this.failPercent()}%).`)
        lines.push(`\tTotal Runtime (in sec.): ${this.totalRuntime.toPrecision(4).padStart(20)}s.`)

        return lines.join('\n')
    }

    /**
     * Generate a pretty string to display the contents of this result.
     * @returns {string} A pretty string displaying the results.
     */
    prettyPrint() {
        if (isFunction(this.opts.writeLine)) {
            this.opts.writeLine(this.prettyString())
        }
    }

    toString() { this.prettyString() }

    /**
     * Color codes the number of failures based on percentage.
     * @returns {string} The number of failures color coded based on failurePercentage.
     */
    shadeFailure(percent) {
        return this.shadeFailureColor(percent)(this.failures)
    }

    debugString() {
        return `<BenchmarkResult|Opts: ${JSON.stringify(this.opts)}|${this.results.length} Results|Runtime: ${this.totalRuntime}|Avg: ${this.average}|Fastest: ${this.fastest}|Slowest: ${this.slowest}|Failures: ${this.failures}>`
    }

    shadeFailureColor(percent) {
        const failurePercent = isNumber(percent) && !Number.isNaN(percent) && (percent >= 0 && percent <= 100) ? percent : this.failPercent()

        return Number.isNaN(failurePercent) || failurePercent < 0 || failurePercent > 100 ? // Invalid percent
            chalk.bgGreen.magentaBright.bold.underline : failurePercent < 1 ? // 0%
                chalk.greenBright.underline.bold : failurePercent > 0 && failurePercent <= 20 ? // 1-20%
                    chalk.rgb(167, 255, 0) : failurePercent > 20 && failurePercent <= 50 ? // 21-50%
                        chalk.rgb(255, 255, 0) : failurePercent > 50 && failurePercent <= 75 ? // 51-75%
                            chalk.rgb(255, 173, 0) : failurePercent > 75 && failurePercent <= 90 ? // 76-90%
                                chalk.rgb(255, 50, 0) : chalk.red.bold.underline // 86-100%
    }

    /**
     * Returns true if this `BenchmarkResult` was created with no times.
     * @returns {boolean}
     */
    isEmpty() {
        return this.#isEmpty
    }

    /**
     * Returns true if the times provided do not match the expected number of iterations.
     * @returns {boolean} True if this `BenchmarkResult` has failed iterations.
     */
    hasFailures() {
        return this.failures > 0
    }

    /**
     * Returns the percentage of failures, rounded to an integer, between 0 and 100.
     * @returns {number} The number of failures in this `BenchmarkResult` or NaN if iters is 0.
     */
    failPercent() {
        return this.opts.iters === 0 ? Number.NaN : Math.round((this.failures / this.opts.iters) * 100)
    }

    /**
     * Compare two `BenchmarkResult` objects.
     * @param {BenchmarkResult} a The first benchmark result to compare.
     * @param {BenchmarkResult} b The second benchmark result to compare.
     * @returns {string} A string that can be used to display a comparison of the results.
     */
    static generateComparison(a, b) {
        const aNil = isNil(a)
        const bNil = isNil(b)
        if (aNil && bNil) {
            return chalk.red.bold.underline('Both Benchmark Results are null!')
        }
        if (aNil) { return b.prettyString() }
        if (bNil) { return a.prettyString() }

        let lines = [];

        let [l, m, r] = lmr(a.opts.name, 'vs', b.opts.name)
        lines.push(chalk.whiteBright.underline(l) + chalk.yellow(m) + chalk.whiteBright.underline(r))

        let left = `${a.opts.iters} (${isNumber(a.opts.warmup) ? `${a.opts.warmup}` : '0'}%)`;
        let right = `${b.opts.iters} (${isNumber(b.opts.warmup) ? `${b.opts.warmup}` : '0'}%)`;
        [l, m, r] = lmr(left, 'Iters(Warmup)', right);
        lines.push(chalk.green(l) + chalk.yellow(m) + chalk.green(r));

        [l, m, r] = lmr(`${a.average}`, '...Average...', `${b.average}`);
        lines.push(a.average > b.average ? chalk.green(l) + chalk.yellow(m) + chalk.greenBright.bold(r) : chalk.greenBright.bold(l) + chalk.yellow(m) + chalk.green(r));

        [l, m, r] = lmr(a.fastest, '...Fastest...', b.fastest);
        lines.push(a.fastest > b.fastest ? chalk.green(l) + chalk.yellow(m) + chalk.greenBright.bold(r) : chalk.greenBright.bold(l) + chalk.yellow(m) + chalk.green(r));

        [l, m, r] = lmr(a.slowest, '...Slowest...', b.slowest);
        lines.push(a.slowest > b.slowest ? chalk.redBright.bold(l) + chalk.yellow(m) + chalk.red(r) : chalk.red(l) + chalk.yellow(m) + chalk.redBright.bold(r));

        const aFail = a.failPercent();
        const bFail = b.failPercent();

        left = `${a.failures} (${aFail}%)`;
        right = `${b.failures} (${bFail}%)`;
        [l, m, r] = lmr(left, '...Failures...', right);
        lines.push(a.shadeFailureColor(aFail)(l) + chalk.yellow(m) + b.shadeFailureColor(bFail)(r));

        return lines.join('\n');
    }
}

export class Bencher {
    opts = DefaultBenchmarkOptions
    runs = []

    /**
     * Construct a new `Bencher` object that will run benchmarks with the same options each time.
     * @param {BenchmarkOptions} opts The options to run each benchmark with.
     */
    constructor(opts) {
        this.opts = { ...this.opts, ...opts }
        this.opts.name = 'Bencher'
    }

    /**
     * Runs the given function with the options saved in this `Bencher`.
     * @param {Function} fn The function to benchmark.
     * @returns {BenchmarkResult} The benchmark result.
     */
    run = async (name, fn) => {
        const result = await benchmark({ ...this.opts, name }, fn)
        this.runs.push(result)
        return result
    }
}

/**
 * Benchmark the given function and return the results.
 * @typedef {{name: string?, iters: number?, warmup: number?, saveResults: boolean?, writeLine: (msg: string, ...args?) => void}} BenchmarkOptions The options for the benchmark run.
 * @param {BenchmarkOptions} opts The options for this benchmark run.
 * @param {Function} fn The function to benchmark.
 */
export const benchmark = async (opts, fn) => {
    const options = { ...DefaultBenchmarkOptions, ...opts }
    const optsValid = 'name' in options && 'iters' in options && 'warmup' in options

    if (!optsValid) {
        console.warn(`Invalid benchmark options: ${JSON.stringify(options)}`)
    }

    let times = []
    if (isAsyncFunction(fn)) {
        if (options.warmup > 0) {
            const _ = await runAsyncFunctionMultipleTimes(options.warmup, fn)
        }
        times = await runAsyncFunctionMultipleTimes(options.iters, fn)
    } else {
        if (options.warmup > 0) {
            const _ = runFunctionMultipleTimes(options.warmup, fn)
        }
        times = runFunctionMultipleTimes(options.iters, fn)
    }

    if (times.length !== options.iters) {
        console.warn(`Result count does not match requested number of iterations! Expected: ${options.iters} Actual: ${times.length}.`)
    }

    if (times.length < 1 && options.iters > 0) {
        console.error(`No results were returns but ${options.iters} iterations were expected, something might be wrong.`)
    }

    return new BenchmarkResult(opts, times)
}

/**
 * Run the given **SYNCHRONOUS** function multiple times and return the times of each run.
 * @param {number} times The number of times to run the function.
 * @param {(...args?) => unknown} fn The function to run.
 * @returns {number[]} The times of each run.
 */
const runFunctionMultipleTimes = (times, fn) => {
    if (isAsyncFunction(fn)) {
        console.error(`The given function ${fn.name ?? '<anonymous>'} is an async function.`)
    }
    const acceptsArg = fn.length > 0
    const fnCall = acceptsArg ? (i) => fn(i) : (i) => fn()

    return [...Array(times).keys()].map(i => {
        const start = microTime()
        fnCall(i)
        const end = microTime()
        return end - start
    })
}

/**
 * Run the given **SYNCHRONOUS** function multiple times and return the times of each run.
 * @param {number} times The number of times to run the function.
 * @param {(...args?) => Promise<unknown>} fn The function to run.
 * @returns {Promise<number[]>} The times of each run.
 */
const runAsyncFunctionMultipleTimes = (times, fn) => {
    if (!isAsyncFunction(fn)) {
        console.error(`The given function ${fn.name ?? '<anonymous>'} is not an async function.`)
    }
    const acceptsArg = fn.length > 0
    const fnCall = acceptsArg ? async (i) => fn(i) : async (i) => fn()

    return Promise.all([...Array(times).keys()].map(async i => {
        const start = microTime()
        await fnCall(i)
        return microTime() - start
    }))
}