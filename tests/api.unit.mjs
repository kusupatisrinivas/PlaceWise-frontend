import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import {
  api,
  authenticateRequest,
  errorMessage,
  setAccessToken,
} from "../src/api.js";

const originalAdapter = api.defaults.adapter;
afterEach(() => {
  api.defaults.adapter = originalAdapter;
  setAccessToken(null);
});

function clockedOptions(probe, onWaiting = () => {}) {
  let time = 0;
  return {
    probe,
    onWaiting,
    timeoutMs: 6000,
    now: () => time,
    pause: async (ms) => {
      time += ms;
    },
  };
}

test("waits through startup responses, then submits registration exactly once", async () => {
  let probes = 0;
  let posts = 0;
  const progress = [];
  api.defaults.adapter = async (config) => {
    assert.equal(config.method, "post");
    assert.equal(config.url, "/auth/register");
    posts++;
    return {
      status: 201,
      data: { token: "test-only-token" },
      headers: {},
      config,
    };
  };
  const options = clockedOptions(
    async () => {
      probes++;
      if (probes === 1)
        throw { response: { status: 503, data: "<html>Starting</html>" } };
      return probes === 2
        ? { status: 200, data: "<html>Application loading</html>" }
        : { status: 200, data: { status: "UP" } };
    },
    (message) => progress.push(message),
  );
  options.timeoutMs = 9000;
  const result = await authenticateRequest("/auth/register", {}, options);
  assert.equal(result.status, 201);
  assert.equal(probes, 3);
  assert.equal(posts, 1);
  assert.ok(progress.some((message) => message.includes("server is starting")));
  assert.equal(progress.at(-1), "");
});

test("does not submit credentials or create an account when readiness times out", async () => {
  let posts = 0;
  api.defaults.adapter = async () => {
    posts++;
    throw new Error("Unexpected POST");
  };
  const options = clockedOptions(async () => {
    throw { code: "ERR_NETWORK" };
  });
  await assert.rejects(authenticateRequest("/auth/register", {}, options), {
    code: "BACKEND_STARTUP_TIMEOUT",
  });
  assert.equal(posts, 0);
});

test("does not retry registration after an ambiguous server failure", async () => {
  let posts = 0;
  api.defaults.adapter = async (config) => {
    posts++;
    throw {
      response: { status: 502, data: "<html>Bad Gateway</html>" },
      config,
    };
  };
  const options = clockedOptions(async () => ({
    status: 200,
    data: { status: "UP" },
  }));
  await assert.rejects(authenticateRequest("/auth/register", {}, options));
  assert.equal(posts, 1);
});

test("leaving a form during startup prevents its eventual registration POST", async () => {
  const controller = new AbortController();
  let posts = 0;
  api.defaults.adapter = async () => {
    posts++;
    throw new Error("Unexpected POST");
  };
  const options = clockedOptions(async () => ({
    status: 503,
    data: { status: "STARTING" },
  }));
  options.signal = controller.signal;
  options.pause = async () => {
    controller.abort();
  };
  await assert.rejects(authenticateRequest("/auth/register", {}, options), {
    code: "ERR_CANCELED",
  });
  assert.equal(posts, 0);
});

test("cancellation as readiness completes still prevents credential submission", async () => {
  const controller = new AbortController();
  let posts = 0;
  api.defaults.adapter = async () => {
    posts++;
    throw new Error("Unexpected POST");
  };
  const options = clockedOptions(async () => {
    controller.abort();
    return { status: 200, data: { status: "UP" } };
  });
  options.signal = controller.signal;
  await assert.rejects(authenticateRequest("/auth/register", {}, options), {
    code: "ERR_CANCELED",
  });
  assert.equal(posts, 0);
});

test("does not send an existing bearer token to login or registration", async () => {
  const headers = [];
  setAccessToken("expired-test-token");
  api.defaults.adapter = async (config) => {
    headers.push(config.headers.get("Authorization"));
    return { status: 200, data: {}, headers: {}, config };
  };
  await api.post("/auth/login", {});
  await api.post("/auth/register", {});
  await api.get("/drives");
  assert.deepEqual(headers, [
    undefined,
    undefined,
    "Bearer expired-test-token",
  ]);
});

test("reports upstream errors without displaying an HTML page or throwing on null", () => {
  assert.match(
    errorMessage({ response: { status: 503, data: "<html>loading</html>" } }),
    /HTTP 503/,
  );
  assert.match(
    errorMessage({ response: { status: 502, data: null } }),
    /HTTP 502/,
  );
  assert.match(errorMessage({ code: "ECONNABORTED" }), /try signing in/);
});

test("preserves useful duplicate-account and field-validation messages", () => {
  assert.equal(
    errorMessage({
      response: { status: 409, data: { message: "Email already registered." } },
    }),
    "Email already registered.",
  );
  assert.equal(
    errorMessage({
      response: {
        status: 400,
        data: { errors: { rollNumber: "Already used" } },
      },
    }),
    "roll Number: Already used",
  );
});

test("uncertain registration results advise signing in before creating a duplicate", () => {
  for (const response of [
    undefined,
    { status: 502, data: "Bad Gateway" },
    { status: 504, data: null },
  ]) {
    assert.match(
      errorMessage({
        config: { url: "/auth/register", method: "post" },
        response,
      }),
      /Try signing in before creating it again/,
    );
  }
});
