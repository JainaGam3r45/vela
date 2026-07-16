import { interpret } from "./interpreter";
import { LexerError, tokenize } from "./lexer";
import { parse, ParserError } from "./parser";

export function runSource(source: string, print?: (text: string) => void): void {
  const tokens = tokenize(source);
  const program = parse(tokens);
  interpret(program, print);
}

export async function runFile(
  path: string,
  print?: (text: string) => void,
): Promise<void> {
  const file = Bun.file(path);

  if (!(await file.exists())) {
    throw new Error(`file not found: ${path}`);
  }

  const source = await file.text();
  runSource(source, print);
}

async function main(): Promise<void> {
  const path = process.argv[2];

  if (!path) {
    console.error("usage: bun run src/index.ts <file.vela>");
    process.exitCode = 1;
    return;
  }

  try {
    await runFile(path);
  } catch (error) {
    if (
      error instanceof LexerError ||
      error instanceof ParserError ||
      error instanceof Error
    ) {
      console.error(error.message);
      process.exitCode = 1;
      return;
    }

    throw error;
  }
}

if (import.meta.main) {
  await main();
}
