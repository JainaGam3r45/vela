import { expect, test } from "bun:test";

import { tokenize } from "../src/lexer";
import { parse, ParserError } from "../src/parser";

test("parses a print statement", () => {
  const program = parse(tokenize('print("hola")'));

  expect(program).toEqual({
    kind: "Program",
    body: [
      {
        kind: "PrintStmt",
        argument: {
          kind: "StringLiteral",
          value: "hola",
        },
      },
    ],
  });
});

test("rejects unknown identifiers", () => {
  expect(() => parse(tokenize('foo("hola")'))).toThrow(ParserError);
});

test("rejects a missing closing parenthesis", () => {
  expect(() => parse(tokenize('print("hola"'))).toThrow(ParserError);
});

test("parses let bindings and print identifiers", () => {
  const program = parse(tokenize('let nombre = "vela"\nprint(nombre)'));

  expect(program).toEqual({
    kind: "Program",
    body: [
      {
        kind: "LetStmt",
        name: "nombre",
        value: {
          kind: "StringLiteral",
          value: "vela",
        },
      },
      {
        kind: "PrintStmt",
        argument: {
          kind: "IdentifierExpr",
          name: "nombre",
        },
      },
    ],
  });
});

test("rejects let without a value", () => {
  expect(() => parse(tokenize("let nombre ="))).toThrow(ParserError);
});
