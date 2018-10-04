import join from 'lodash/join';
import castArray from 'lodash/castArray';
import { Many } from 'lodash';
import { Clause } from '../clause';

export interface DeleteOptions {
  detach?: boolean;
}

export class Delete extends Clause {
  variables: string[];

  constructor(
    variables: Many<string>,
    protected options: DeleteOptions = { detach: true },
  ) {
    super();
    this.variables = castArray(variables);
  }

  build() {
    let str = this.options.detach ? 'DETACH ' : '';
    str += 'DELETE ';
    return str + join(this.variables, ', ');
  }
}
