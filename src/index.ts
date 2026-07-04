export function main(): string {
  return "ok";
}

if (import.meta.main) {
  console.log(main());
}
