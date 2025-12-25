// Simple in-memory retry queue for transient DB write failures
// Not distributed; designed for short-lived retries (seconds to a couple of minutes)

const DEFAULT_RETRY_OPTIONS = {
  attempts: 5,
  baseDelayMs: 1000, // 1s
  maxDelayMs: 30000, // 30s
};

const queue = new Map(); // id -> { attemptsLeft, fn }
let idCounter = 0;

function enqueueTask(fn, opts = {}) {
  const options = { ...DEFAULT_RETRY_OPTIONS, ...opts };
  const id = ++idCounter;
  const state = { attemptsLeft: options.attempts, fn, options };
  queue.set(id, state);

  const run = async () => {
    try {
      await fn();
      queue.delete(id);
    } catch (err) {
      state.attemptsLeft -= 1;
      if (state.attemptsLeft <= 0) {
        console.error(`❌ DB retry task ${id} failed after retries:`, err);
        queue.delete(id);
        return;
      }
      // Exponential backoff with jitter
      const attemptNum = options.attempts - state.attemptsLeft;
      const delay = Math.min(options.baseDelayMs * Math.pow(2, attemptNum), options.maxDelayMs);
      const jitter = Math.floor(Math.random() * 500);
      setTimeout(run, delay + jitter);
    }
  };

  // Start the first run shortly after enqueue
  setTimeout(run, 0);
  return id;
}

module.exports = { enqueueTask };
