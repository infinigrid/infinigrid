import { Component } from 'react';

const HANDLERS = Symbol('handlers');

export class ComponentWithHandlers extends Component {

  bindHandlers() {
    const proto = Object.getPrototypeOf(this);
    return this[HANDLERS] = Object.getOwnPropertyNames(proto)
      .filter( name => name.startsWith('on') )
      .reduce( (o, name) => { o[name] = proto[name].bind(this); return o; } , {});
  }

  get handlers() {
    return this[HANDLERS] || this.bindHandlers();
  }
}
