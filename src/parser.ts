import type { Token } from "./lexer";

export type StringLiteral = {
  kind: "StringLiteral";
  value: string;
};

export type IdentifierExpr = {
  kind: "IdentifierExpr";
  name: string;
};

export type Expression = StringLiteral | IdentifierExpr;

export type LetStmt = {
  kind: "LetStmt";
  name: string;
  value: StringLiteral;
};

export type PrintStmt = {
  kind: "PrintStmt";
  argument: Expression;
};

export type Statement = LetStmt | PrintStmt;

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

  const expect = (type: Token["type"], message: string): Token => {
    if (check(type)) {
      return advance();
    }

    const token = current();
    throw new ParserError(message, token.line, token.column);
  };

  const parseExpression = (): Expression => {
    if (check("String")) {
      const token = advance();
      return {
        kind: "StringLiteral",
        value: token.lexeme,
      };
    }

    if (check("Identifier")) {
      const token = advance();
      return {
        kind: "IdentifierExpr",
        name: token.lexeme,
      };
    }

    const token = current();
    throw new ParserError("expected expression", token.line, token.column);
  };

  const parseLetStmt = (): LetStmt => {
    expect("Let", "expected 'let'");
    const name = expect("Identifier", "expected variable name after let");
    expect("Equal", "expected '=' after variable name");
    const valueToken = expect("String", "expected string after '='");

    return {
      kind: "LetStmt",
      name: name.lexeme,
      value: {
        kind: "StringLiteral",
        value: valueToken.lexeme,
      },
    };
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
    const argument = parseExpression();
    expect("RightParen", "expected ')' after argument");

    return {
      kind: "PrintStmt",
      argument,
    };
  };

  const parseStatement = (): Statement => {
    if (check("Let")) {
      return parseLetStmt();
    }

    return parsePrintStmt();
  };

  const body: Statement[] = [];

  while (!check("Eof")) {
    body.push(parseStatement());
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
