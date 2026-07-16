import type { Program, Statement } from "./parser";

export class RuntimeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RuntimeError";
  }
}

export type PrintFn = (text: string) => void;

export function interpret(program: Program, print: PrintFn = defaultPrint): void {
  for (const statement of program.body) {
    execute(statement, print);
  }
}

function execute(statement: Statement, print: PrintFn): void {
  if (statement.kind === "PrintStmt") {
    print(statement.argument.value);
    return;
  }

  throw new RuntimeError(`unsupported statement: ${statement.kind}`);
}

function defaultPrint(text: string): void {
  console.log(text);
}
