import { expect, test } from "bun:test";

import { LexerError, tokenize } from "../src/lexer";

test("tokenizes print with a string literal", () => {
  const tokens = tokenize('print("hola")');

  expect(tokens.map((token) => token.type)).toEqual([
    "Identifier",
    "LeftParen",
    "String",
    "RightParen",
    "Eof",
  ]);
  expect(tokens[0]?.lexeme).toBe("print");
  expect(tokens[2]?.lexeme).toBe("hola");
});

test("rejects unterminated strings", () => {
  expect(() => tokenize('print("hola')).toThrow(LexerError);
});

test("rejects unexpected characters", () => {
  expect(() => tokenize("print@")).toThrow(LexerError);
});

test("tokenizes let bindings", () => {
  const tokens = tokenize('let nombre = "vela"');

  expect(tokens.map((token) => token.type)).toEqual([
    "Let",
    "Identifier",
    "Equal",
    "String",
    "Eof",
  ]);
  expect(tokens[1]?.lexeme).toBe("nombre");
  expect(tokens[3]?.lexeme).toBe("vela");
});
