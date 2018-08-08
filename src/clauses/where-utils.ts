import {
  Dictionary,
  isPlainObject,
  Many,
  isArray,
  join,
  map,
  split,
  last,
  keys,
  isFunction,
  isRegExp,
} from 'lodash';
import { ParameterBag } from '../parameter-bag';
import { WhereOp } from './where-operators';
import { Comparator, regexp } from './where-comparators';

export type Condition = any | Comparator;
export type Conditions = Dictionary<Many<Condition>>;
export type NodeConditions = Dictionary<Many<Conditions>>;
export type AnyConditions = Many<NodeConditions | Conditions | Condition>;
export type AndConditions = NodeConditions | Conditions;
export type OrConditions = (NodeConditions | Conditions | Condition)[];

export const enum Precedence {
  None,
  Or,
  Xor,
  And,
  Not,
}

export function stringifyCondition(
  params: ParameterBag,
  condition: Condition,
  name: string = '',
): string {
  if (isFunction(condition)) {
    return condition(params, name);
  }
  const conditionName = last(split(name, '.'));
  return name + ' = ' + params.addParam(condition, conditionName);
}


export function stringCons(
  params: ParameterBag,
  conditions: Many<NodeConditions | Conditions | Condition>,
  precedence: Precedence = Precedence.None,
  name: string = '',
): string {
  if (isArray(conditions)) {
    return combineOr(params, conditions, precedence, name);
  }
  if (isPlainObject(conditions)) {
    return combineAnd(params, conditions, precedence, name);
  }
  if (conditions instanceof WhereOp) {
    return conditions.evaluate(params, precedence, name);
  }
  if (isRegExp(conditions)) {
    return stringifyCondition(params, regexp(conditions), name);
  }
  return stringifyCondition(params, conditions, name);
}

export function combineNot(
  params: ParameterBag,
  conditions: AnyConditions,
  precedence: Precedence = Precedence.None,
  name: string = '',
): string {
  const string = 'NOT ' + stringCons(params, conditions, Precedence.Not, name);
  const braces = precedence !== Precedence.None && precedence > Precedence.Not;
  return braces ? '(' + string + ')' : string;
}

export function combineOr(
  params: ParameterBag,
  conditions: OrConditions,
  precedence: Precedence = Precedence.None,
  name: string = '',
): string {
  // If this operator will not be used, precedence should not be altered
  const newPrecedence = conditions.length < 2 ? precedence : Precedence.Or;
  const strings = map(conditions, condition => stringCons(params, condition, newPrecedence, name));

  const string = join(strings, ' OR ');
  const braces = precedence !== Precedence.None && precedence > newPrecedence;
  return braces ? '(' + string + ')' : string;
}

export function combineXor(
  params: ParameterBag,
  conditions: OrConditions,
  precedence: Precedence = Precedence.None,
  name: string = '',
): string {
  // If this operator will not be used, precedence should not be altered
  const newPrecedence = conditions.length < 2 ? precedence : Precedence.Xor;
  const strings = map(conditions, condition => stringCons(params, condition, newPrecedence, name));

  const string = join(strings, ' XOR ');
  const braces = precedence !== Precedence.None && precedence > newPrecedence;
  return braces ? '(' + string + ')' : string;
}

export function combineAnd(
  params: ParameterBag,
  conditions: AndConditions,
  precedence: Precedence = Precedence.None,
  name: string = '',
): string {
  // Prepare name to be joined with the key of the object
  const namePrefix = name.length > 0 ? name + '.' : '';

  // If this operator will not be used, precedence should not be altered
  const newPrecedence = keys(conditions).length < 2 ? precedence : Precedence.And;
  const strings = map(conditions, (condition, key) => {
    return stringCons(params, condition, newPrecedence, namePrefix + key);
  });

  const string = join(strings, ' AND ');
  const braces = precedence !== Precedence.None && precedence > newPrecedence;
  return braces ? '(' + string + ')' : string;
}
