import join from 'lodash-es/join';
import reduce from 'lodash-es/reduce';
import map from 'lodash-es/map';
import assign from 'lodash-es/assign';
import castArray from 'lodash-es/castArray';
import isArray from 'lodash-es/isArray';
import { Clause } from '../clause';
import { Pattern } from './pattern';

export interface PatternOptions {
  useExpandedConditions?: boolean;
}

export type PatternCollection = Pattern | Pattern[] | Pattern[][];

export class PatternClause extends Clause {
  protected patterns: Pattern[][];

  constructor(
    patterns: PatternCollection,
    options: PatternOptions = { useExpandedConditions: false },
  ) {
    super();
    const defaultOptions = {
      useExpandedConditions: true,
    };
    const { useExpandedConditions } = assign(defaultOptions, options);

    // Ensure patterns is a two dimensional array.
    const arr = castArray<Pattern | Pattern[]>(patterns);
    this.patterns = (isArray(arr[0]) ? arr : [arr]) as Pattern[][];


    // Add child patterns as clauses
    this.patterns.forEach(arr => arr.forEach((pat) => {
      pat.setExpandedConditions(useExpandedConditions);
      pat.useParameterBag(this.parameterBag);
    }));
  }

  build() {
    const patternStrings = map(this.patterns, (pattern) => {
      return reduce(pattern, (str, clause) => str + clause.build(), '');
    });
    return join(patternStrings, ', ');
  }
}
