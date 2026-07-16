import type { Token } from "./lexer";

export type StringLiteral = {
  kind: "StringLiteral";
  value: string;
};

export type PrintStmt = {
  kind: "PrintStmt";
  argument: StringLiteral;
};

export type Statement = PrintStmt;

export type Program = {
  kind: "Program";
  body: Statement[];
};

export class ParserError extends Error {
  constructor(
    message: string,
    readonly line: number,
    readonly column: number,
  ) {
    super(`${message} at ${line}:${column}`);
    this.name = "ParserError";
  }
}

export function parse(tokens: Token[]): Program {
  let index = 0;

  const current = (): Token => tokens[index] ?? eofFallback();
  const previous = (): Token => tokens[index - 1] ?? eofFallback();

  const check = (type: Token["type"]): boolean => current().type === type;

  const advance = (): Token => {
    if (!check("Eof")) {
      index += 1;
    }
    return previous();
  };

  const match = (type: Token["type"]): boolean => {
    if (!check(type)) {
      return false;
    }
    advance();
    return true;
  };

  const expect = (type: Token["type"], message: string): Token => {
    if (check(type)) {
      return advance();
    }

    const token = current();
    throw new ParserError(message, token.line, token.column);
  };

  const parsePrintStmt = (): PrintStmt => {
    const name = expect("Identifier", "expected statement");

    if (name.lexeme !== "print") {
      throw new ParserError(
        `unknown identifier '${name.lexeme}'`,
        name.line,
        name.column,
      );
    }

    expect("LeftParen", "expected '(' after print");
    const argument = expect("String", "expected string argument");
    expect("RightParen", "expected ')' after string");

    return {
      kind: "PrintStmt",
      argument: {
        kind: "StringLiteral",
        value: argument.lexeme,
      },
    };
  };

  const body: Statement[] = [];

  while (!check("Eof")) {
    body.push(parsePrintStmt());
  }

  return {
    kind: "Program",
    body,
  };
}

function eofFallback(): Token {
  return {
    type: "Eof",
    lexeme: "",
    line: 1,
    column: 1,
  };
}
