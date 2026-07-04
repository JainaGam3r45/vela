import { expect, test } from "bun:test";

import { main } from "../src/index";

test("main devuelve un valor estable", () => {
  expect(main()).toBe("ok");
});
