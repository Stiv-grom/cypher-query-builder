import isString from 'lodash-es/isString';
import isArray from 'lodash-es/isArray';
import isObjectLike from 'lodash-es/isObjectLike';
import map from 'lodash-es/map';
import join from 'lodash-es/join';
import flatten from 'lodash-es/flatten';
import zip from 'lodash-es/zip';
import isNil from 'lodash-es/isNil';
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
