import type { Expression, Program, Statement } from "./parser";

export class RuntimeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RuntimeError";
  }
}

export type PrintFn = (text: string) => void;

type Environment = Map<string, string>;

export function interpret(program: Program, print: PrintFn = defaultPrint): void {
  const env: Environment = new Map();

  for (const statement of program.body) {
    execute(statement, env, print);
  }
}

function execute(
  statement: Statement,
  env: Environment,
  print: PrintFn,
): void {
  if (statement.kind === "LetStmt") {
    if (env.has(statement.name)) {
      throw new RuntimeError(`variable already defined: ${statement.name}`);
    }

    env.set(statement.name, statement.value.value);
    return;
  }

  if (statement.kind === "PrintStmt") {
    print(evaluate(statement.argument, env));
    return;
  }

  throw new RuntimeError(`unsupported statement: ${(statement as Statement).kind}`);
}

function evaluate(expression: Expression, env: Environment): string {
  if (expression.kind === "StringLiteral") {
    return expression.value;
  }

  if (expression.kind === "IdentifierExpr") {
    const value = env.get(expression.name);
    if (value === undefined) {
      throw new RuntimeError(`undefined variable: ${expression.name}`);
    }
    return value;
  }

  throw new RuntimeError(
    `unsupported expression: ${(expression as Expression).kind}`,
  );
}

function defaultPrint(text: string): void {
  console.log(text);
}
