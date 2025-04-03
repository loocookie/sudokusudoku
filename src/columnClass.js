import {Node} from "./nodeClass"

class Column extends Node {
    constructor (name) {
        super(null);
        this.c = this;
        this.size = 0;
        this.name = name;
    }
}

export default Column;
