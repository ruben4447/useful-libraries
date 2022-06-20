import { Complex } from "./maths/Complex";
import { IParseNumberOptions, parseNumber } from "./utils";

interface IToken {
  type: number;
  value: any;
}

interface IOperator extends IToken {
  unary?: boolean;
  action: Function;
  assoc: 'rtl' | 'ltr',
  prec: number,
}

export interface IOperatorMap {
  [op: string]: Function;
}

export const OPERATORS_DEFAULT: IOperatorMap = {
  "**": Math.pow,
  "!": (a: number) => +!a,
  "/": (a: number, b: number) => a / b,
  "%": (a: number, b: number) => a % b,
  "*": (a: number, b: number) => a * b,
  "+": (a: number, b: number) => a + b,
  "-": (a: number, b: number) => a - b,
};

export const OPERATORS_IMAG: IOperatorMap = {
  "**": Complex.pow,
  "!": (a: Complex) => new Complex(+!a.isTruthy()),
  "/": Complex.div,
  "%": Complex.modulo,
  "*": Complex.mult,
  "+": Complex.add,
  "-": Complex.sub,
};

function getPrecedence(token: IToken | IOperator) {
  if (token.type === TOKEN_OP) return (token as IOperator).prec;
  return 0;
}

const TOKEN_OP = 1;
const TOKEN_NUM = 2;
const TOKEN_SYM = 4;
const LABELREGEX = /^[A-Za-z][A-Za-z0-9_\$]*$/;

type Tokens = Array<IToken | IOperator>;

/** Creates an expression, which may be parsed and executed.
 * Expression.numberOpts allows customision on numerical parsing.
 *   NOTE if numberOpts.imag is truthy, please pass OPERATORS_IMAG to parse
*/
export class Expression {
  private _raw: string;
  private _tokens: Tokens;
  private _symbols = new Map<string, number>();
  public readonly numberOpts: IParseNumberOptions;

  constructor(expr = '') {
    this._raw = expr;
    this._tokens = [];
    this.numberOpts = {};
  }

  public reset() {
    this._tokens.length = 0;
    this._symbols.clear();
  }

  public setSymbol(name: string, value: number) {
    this._symbols.set(name, value);
    return value;
  }

  public hasSymbol(name: string) {
    return this._symbols.has(name);
  }

  public getSymbol(name: string) {
    return this._symbols.get(name);
  }

  public setSymbolMap(map: Map<string, number>) {
    this._symbols = map;
  }

  /** Parse raw to token array */
  public parse(operators?: IOperatorMap) {
    if (operators === undefined) operators = OPERATORS_DEFAULT;
    this._tokens.length = 0;
    for (let i = 0; i < this._raw.length;) {
      let token: IOperator | IToken | undefined = undefined;

      if (/\s/.test(this._raw[i])) {
        i += this._raw[i].length;
        continue;
      } else if (this._raw[i] === '*' && this._raw[i + 1] === '*') {
        token = <IOperator>{ type: TOKEN_OP, value: '**', unary: false, action: operators["**"], assoc: 'rtl', prec: 16 };
        i += 2;
      } else if (this._raw[i] === '!') {
        token = <IOperator>{ type: TOKEN_OP, value: '!', unary: true, action: operators["!"], assoc: 'rtl', prec: 17 };
        i += 1;
      } else if (this._raw[i] === '/') {
        token = <IOperator>{ type: TOKEN_OP, value: '/', unary: false, action: operators["/"], assoc: 'ltr', prec: 15 };
        i += 1;
      } else if (this._raw[i] === '%') {
        token = <IOperator>{ type: TOKEN_OP, value: '%', unary: false, action: operators["%"], assoc: 'ltr', prec: 15 };
        i += 1;
      } else if (this._raw[i] === '*') {
        token = <IOperator>{ type: TOKEN_OP, value: '*', unary: false, action: operators["*"], assoc: 'ltr', prec: 15 };
        i += 1;
      } else if (this._raw[i] === '+') {
        token = <IOperator>{ type: TOKEN_OP, value: '+', unary: false, action: operators["+"], assoc: 'ltr', prec: 14 };
        i += 1;
      } else if (this._raw[i] === '-') {
        token = <IOperator>{ type: TOKEN_OP, value: '-', unary: false, action: operators["-"], assoc: 'ltr', prec: 14 };
        i += 1;
      } else if (this._raw[i] === '=') {
        token = <IOperator>{ type: TOKEN_OP, value: '=', unary: false, action: (a: string, b: number) => this.setSymbol(a, b), assoc: 'rtl', prec: 3 };
        i += 1;
      } else if (this._raw[i] === ',') {
        token = <IOperator>{ type: TOKEN_OP, value: ',', unary: false, action: (a: string, b: number) => b, assoc: 'ltr', prec: 1 };
        i += 1;
      } else {
        let nextSpace = this._raw.substring(i).indexOf(' ');
        let symbol = nextSpace === -1 ? this._raw.substring(i) : this._raw.substring(i, nextSpace);
        if (this.hasSymbol(symbol) || LABELREGEX.test(symbol)) {
          token = <IToken>{ type: TOKEN_SYM, value: symbol };
          i += symbol.length;
        } else {
          let nobj = parseNumber(this._raw.substring(i), this.numberOpts);
          if (nobj.str.length !== 0) {
            token = <IToken>{ type: TOKEN_NUM, value: nobj.imag ? new Complex(0, nobj.num) : nobj.num };
            i += nobj.str.length;
          }
        }
      }

      if (token) {
        this._tokens.push(token);
      } else {
        throw new Error(`Syntax Error: unknown token '${this._raw[i]}' at position ${i}`);
      }
    }

    // Unary operators
    for (let i = 0; i < this._tokens.length; i++) {
      if (this._tokens[i]?.type === TOKEN_OP) {
        const OP = this._tokens[i] as IOperator;
        if (!OP.unary) {
          const top = this._tokens[i - 1];
          if (top === undefined || (top.type === TOKEN_OP && top.value !== ')')) {
            if (OP.value === '-') {
              OP.unary = true;
              OP.action = (a: number) => -a;
              OP.assoc = 'rtl';
              OP.prec = 17;
            } else if (OP.value === '+') {
              OP.unary = true;
              OP.action = (a: number) => a;
              OP.assoc = 'rtl';
              OP.prec = 17;
            }
          }
        }
      }
    }
  }

  /** Evaluate parsed string. */
  public evaluate() {
    // TO RPN
    const stack: Tokens = [], tokens: Tokens = [];
    for (let i = 0; i < this._tokens.length; ++i) {
      const token = this._tokens[i];
      if (token.type === TOKEN_OP) {
        const OP = token as IOperator;
        if (OP.value === '(') {
          stack.push(token);
        } else if (OP.value === ')') {
          while (stack.length > 0 && !(stack[stack.length - 1].type === TOKEN_OP && stack[stack.length - 1].value === '(')) {
            tokens.push(stack.pop() as IToken | IOperator);
          }
          stack.pop(); // Remove ) from stack
        } else {
          if (OP.assoc === 'ltr') {
            while (stack.length !== 0 && getPrecedence(this._tokens[i]) <= getPrecedence(this._tokens[this._tokens.length - 1])) tokens.push(stack.pop() as IToken | IOperator);
          } else {
            while (stack.length !== 0 && getPrecedence(this._tokens[i]) < getPrecedence(this._tokens[this._tokens.length - 1])) tokens.push(stack.pop() as IToken | IOperator);
          }
          stack.push(OP);
        }
      } else {
        tokens.push(token);
      }
    }
    while (stack.length !== 0) tokens.push(stack.pop() as IToken | IOperator); // DUMP

    // EVALUATE
    stack.length = 0;
    for (let i = 0; i < tokens.length; ++i) {
      const T = tokens[i];
      if (T.type === TOKEN_NUM) stack.push(T);
      else if (T.type === TOKEN_SYM) stack.push(T);
      else if (T.type === TOKEN_OP) {
        const OP = T as IOperator;
        if ((OP.unary && stack.length < 1) || stack.length < 2) return { error: 1, token: T, msg: `Stack underflow whilst executing operator ${OP.value}` };
        let result: number;
        let aT = stack.pop() as IToken | IOperator, a: number;
        if (aT.type === TOKEN_NUM) a = aT.value;
        else if (aT.type === TOKEN_SYM) {
          if (!this.hasSymbol(aT.value)) return { error: 1, token: aT, msg: `Unbound symbol referenced '${aT.value}' in operator ${OP.value}` };
          a = this.getSymbol(aT.value) as number;
        } else return { error: 1, token: aT, msg: `Invalid token type in operator ${OP.value}` };
        if (OP.unary) {
          result = OP.action(a);
        } else {
          let bT = stack.pop() as IToken | IOperator, b: number;
          if (bT.type === TOKEN_NUM) b = bT.value;
          else if (bT.type === TOKEN_SYM) {
            if (OP.value === '=') {
              b = bT.value;
            } else {
              if (!this.hasSymbol(bT.value)) return { error: 1, token: bT, msg: `Unbound symbol referenced '${bT.value}' in operator ${OP.value}` };
              b = this.getSymbol(bT.value) as number;
            }
          } else return { error: 1, token: bT, msg: `Invalid token type in operator ${OP.value}` };
          result = OP.action(b, a);
        }
        stack.push({ type: TOKEN_NUM, value: result } as IToken);
      }
    }

    if (stack.length !== 1) return { error: 1, token: null, msg: `Expected one item to be in result stack, got ${stack.length}`, stack, };
    let value: number;
    if (stack[0].type === TOKEN_NUM) value = stack[0].value;
    else if (stack[0].type === TOKEN_SYM) {
      if (!this.hasSymbol(stack[0].value)) return { error: 1, token: stack[0], msg: `Unbound symbol referenced '${stack[0].value}'` };
      value = this.getSymbol(stack[0].value) as number;
    } else {
      return { error: 1 };
    }
    return { error: 0, value };
  }
} 