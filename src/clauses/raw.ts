import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import isObjectLike from 'lodash/isObjectLike';
import map from 'lodash/map';
import join from 'lodash/join';
import flatten from 'lodash/flatten';
import zip from 'lodash/zip';
import isNil from 'lodash/isNil';
import { Clause } from '../clause';

export class Raw extends Clause {
  clause: string;

  constructor(clause: string | TemplateStringsArray, ...args: any[]) {
    super();

    if (isString(clause)) {
      this.clause = clause;
      const params = args[0];
      if (isObjectLike(params)) {
        for (const key in params) {
          if (Object.hasOwnProperty.call(params, key)) {
            this.addParam(params[key], key);
          }
        }
      } else if (!isNil(params)) {
        throw new TypeError('When passing a string clause to Raw, params should be an object');
      }
    } else if (isArray(clause)) {
      const queryParams = map(args, param => this.addParam(param));
      this.clause = join(flatten(zip(clause, queryParams)), '');
    } else {
      throw new TypeError('Clause should be a string or an array');
    }
  }

  build() {
    return this.clause;
  }
}
