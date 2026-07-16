export type TokenType =
  | "Identifier"
  | "LeftParen"
  | "RightParen"
  | "String"
  | "Eof";

export type Token = {
  type: TokenType;
  lexeme: string;
  line: number;
  column: number;
};

export class LexerError extends Error {
  constructor(
    message: string,
    readonly line: number,
    readonly column: number,
  ) {
    super(`${message} at ${line}:${column}`);
    this.name = "LexerError";
  }
}

export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  let line = 1;
  let column = 1;

  const peek = (): string => source[index] ?? "";
  const advance = (): string => {
    const char = source[index] ?? "";
    index += 1;

    if (char === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }

    return char;
  };

  const skipWhitespace = (): void => {
    while (index < source.length) {
      const char = peek();
      if (char === " " || char === "\t" || char === "\r" || char === "\n") {
        advance();
        continue;
      }
      break;
    }
  };

  const readIdentifier = (startLine: number, startColumn: number): Token => {
    let lexeme = "";

    while (index < source.length) {
      const char = peek();
      if (!isIdentifierContinue(char)) {
        break;
      }
      lexeme += advance();
    }

    return {
      type: "Identifier",
      lexeme,
      line: startLine,
      column: startColumn,
    };
  };

  const readString = (startLine: number, startColumn: number): Token => {
    advance(); // opening quote
    let value = "";

    while (index < source.length) {
      const char = peek();

      if (char === "\n") {
        throw new LexerError("unterminated string", startLine, startColumn);
      }

      if (char === '"') {
        advance();
        return {
          type: "String",
          lexeme: value,
          line: startLine,
          column: startColumn,
        };
      }

      value += advance();
    }

    throw new LexerError("unterminated string", startLine, startColumn);
  };

  while (index < source.length) {
    skipWhitespace();
    if (index >= source.length) {
      break;
    }

    const startLine = line;
    const startColumn = column;
    const char = peek();

    if (char === "(") {
      advance();
      tokens.push({
        type: "LeftParen",
        lexeme: "(",
        line: startLine,
        column: startColumn,
      });
      continue;
    }

    if (char === ")") {
      advance();
      tokens.push({
        type: "RightParen",
        lexeme: ")",
        line: startLine,
        column: startColumn,
      });
      continue;
    }

    if (char === '"') {
      tokens.push(readString(startLine, startColumn));
      continue;
    }

    if (isIdentifierStart(char)) {
      tokens.push(readIdentifier(startLine, startColumn));
      continue;
    }

    throw new LexerError(`unexpected character '${char}'`, startLine, startColumn);
  }

  tokens.push({
    type: "Eof",
    lexeme: "",
    line,
    column,
  });

  return tokens;
}

function isIdentifierStart(char: string): boolean {
  return (
    (char >= "a" && char <= "z") ||
    (char >= "A" && char <= "Z") ||
    char === "_"
  );
}

function isIdentifierContinue(char: string): boolean {
  return isIdentifierStart(char) || (char >= "0" && char <= "9");
}
