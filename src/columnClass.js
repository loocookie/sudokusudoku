import {Node} from "./nodeClass"

export class Column extends Node {
    constructor (name) {
        super(null);
        this.c = this;
        this.size = 0;
        this.name = name;
    }
}
