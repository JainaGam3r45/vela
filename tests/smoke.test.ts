import { expect, test } from "bun:test";

import { runSource } from "../src/index";

test("runs the hello print program", () => {
  const printed: string[] = [];

  runSource('print("hola")', (text) => {
    printed.push(text);
  });

  expect(printed).toEqual(["hola"]);
});
