'use strict';

class A {
  constructor() {
    alert("a");
  }
}

class B extends A {
  constructor() {
    super();
  }
}