// Efeitos e refs do React só podem devolver uma função de limpeza (ou nada).
//
// O React 19 guarda o retorno de useEffect/useLayoutEffect/useInsertionEffect e
// de callbacks de ref e, ao desmontar o componente, CHAMA esse valor se ele não
// for undefined. Um efeito escrito como `useEffect(() => window.scrollTo(...))`
// devolve o resultado de scrollTo: undefined até o Chrome 149, mas uma Promise
// a partir do Chrome 150. Ao sair da página (inclusive com "Voltar"), o React
// tentava chamar essa Promise: "TypeError: d is not a function".
//
// Este teste lê todo o src/ com o compilador do TypeScript e falha se algum
// efeito ou ref devolver algo que não seja uma função.
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import type * as TS from 'typescript';

// o TypeScript é carregado do projeto em tempo de execução (não entra no pacote do teste)
const nodeRequire = eval('require') as NodeRequire;
const ts: typeof TS = nodeRequire(nodeRequire.resolve('typescript', { paths: [process.cwd()] }));

let pass = 0, fail = 0;
const ok = (c: boolean, m: string) => { if (c) pass++; else { fail++; console.log('FAIL:', m); } };

const root = join(process.cwd(), 'src');
const walk = (d: string): string[] =>
  readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : /\.tsx?$/.test(e.name) ? [join(d, e.name)] : []));

const EFFECTS = new Set(['useEffect', 'useLayoutEffect', 'useInsertionEffect']);
const isFn = (n: TS.Node) => ts.isArrowFunction(n) || ts.isFunctionExpression(n);
/** O que pode ser devolvido: uma função, `void ...` ou undefined. Identificadores e chamadas
 *  (ex.: `return unsubscribe`, `return observe(el)`) são aceitos só se o tipo for checado à parte. */
const isSafeReturn = (e: TS.Expression) =>
  isFn(e) || ts.isVoidExpression(e) || (ts.isIdentifier(e) && e.text === 'undefined');

const problems: string[] = [];
let effects = 0, refs = 0;

for (const file of walk(root)) {
  const src = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const where = (n: TS.Node) => `${relative(process.cwd(), file)}:${src.getLineAndCharacterOfPosition(n.getStart()).line + 1}`;

  /** Retornos do próprio callback (sem entrar em funções internas). */
  const returnsOf = (body: TS.Block) => {
    const out: TS.ReturnStatement[] = [];
    const visit = (n: TS.Node) => {
      if (isFn(n) || ts.isFunctionDeclaration(n) || ts.isMethodDeclaration(n)) return;
      if (ts.isReturnStatement(n)) out.push(n);
      ts.forEachChild(n, visit);
    };
    ts.forEachChild(body, visit);
    return out;
  };

  const checkCallback = (fn: TS.ArrowFunction | TS.FunctionExpression, kind: string) => {
    if (ts.isArrowFunction(fn) && !ts.isBlock(fn.body)) {
      if (!isSafeReturn(fn.body)) problems.push(`${where(fn)} ${kind} devolve implicitamente \`${fn.body.getText(src).slice(0, 60)}\``);
      return;
    }
    for (const r of returnsOf(fn.body as TS.Block)) {
      if (!r.expression || isSafeReturn(r.expression)) continue;
      // `return algo` que não é função: só aceito se for um identificador ligado a uma função declarada no callback
      const e = r.expression;
      const named = ts.isIdentifier(e) && returnsLocalFunction(fn.body as TS.Block, e.text);
      if (!named) problems.push(`${where(r)} ${kind} devolve \`${e.getText(src).slice(0, 60)}\` (não é uma função de limpeza)`);
    }
  };

  /** `const limpar = () => {...}` ou `function limpar() {}` declarado no próprio callback. */
  const returnsLocalFunction = (body: TS.Block, name: string) =>
    body.statements.some((s) =>
      (ts.isFunctionDeclaration(s) && s.name?.text === name) ||
      (ts.isVariableStatement(s) && s.declarationList.declarations.some((d) => ts.isIdentifier(d.name) && d.name.text === name && !!d.initializer && isFn(d.initializer))));

  const visit = (n: TS.Node) => {
    if (ts.isCallExpression(n)) {
      const callee = ts.isIdentifier(n.expression) ? n.expression.text : ts.isPropertyAccessExpression(n.expression) ? n.expression.name.text : '';
      if (EFFECTS.has(callee) && n.arguments[0] && isFn(n.arguments[0])) {
        effects++;
        checkCallback(n.arguments[0] as TS.ArrowFunction, callee);
      }
    }
    if (ts.isJsxAttribute(n) && n.name.getText(src) === 'ref' && n.initializer && ts.isJsxExpression(n.initializer) && n.initializer.expression && isFn(n.initializer.expression)) {
      refs++;
      checkCallback(n.initializer.expression as TS.ArrowFunction, 'ref');
    }
    ts.forEachChild(n, visit);
  };
  visit(src);
}

console.log(`${effects} efeitos e ${refs} callbacks de ref analisados`);
ok(effects > 30, `encontrou os efeitos do projeto (${effects})`);
for (const p of problems) console.log('  ' + p);
ok(problems.length === 0, `nenhum efeito ou ref devolve algo que não seja função (${problems.length} encontrados)`);
console.log(`${pass} passaram, ${fail} falharam`);
if (fail) process.exit(1);
