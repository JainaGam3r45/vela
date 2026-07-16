import { expect, test } from "bun:test";

import { interpret, RuntimeError } from "../src/interpreter";
import { tokenize } from "../src/lexer";
import { parse } from "../src/parser";
import { runSource } from "../src/index";

test("print writes the string literal", () => {
  const printed: string[] = [];
  const program = parse(tokenize('print("hola")'));

  interpret(program, (text) => {
    printed.push(text);
  });

  expect(printed).toEqual(["hola"]);
});

test("runSource executes a full program end to end", () => {
  const printed: string[] = [];

  runSource('print("hola")\nprint("vela")', (text) => {
    printed.push(text);
  });

  expect(printed).toEqual(["hola", "vela"]);
});

test("print reads a bound variable", () => {
  const printed: string[] = [];

  runSource('let nombre = "vela"\nprint(nombre)', (text) => {
    printed.push(text);
  });

  expect(printed).toEqual(["vela"]);
});

test("rejects undefined variables", () => {
  expect(() => {
    runSource("print(nombre)");
  }).toThrow(RuntimeError);
});

test("rejects redeclared variables", () => {
  expect(() => {
    runSource('let nombre = "vela"\nlet nombre = "otra"');
  }).toThrow(RuntimeError);
});
