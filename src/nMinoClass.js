import {DLX} from "./dlxClass"
import seedrandom from "seedrandom";


function factorial (n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}


function shuffle (a, rng) {
    const f = factorial(a.length)
    var n = (rng.int32() % f + f) % f;
    var new_a = [];
    [...Array(a.length)].map((_, i) => {
        const idx = a.length - i;
        new_a.push(a.splice(n % idx, 1)[0])
        n /= idx;
    })
    return new_a;
}


class RDLX_n_mino extends DLX {
    constructor (root, seed) {
        super(root);
        this.rng = seedrandom(seed);
        this.added = 0;
    }

    choose_column () {
        let column = this.root;
        let min_columns_pos = [];
        let min_columns_type = [];
        let min_size_pos = Infinity;
        let min_size_type = Infinity;
        column = column.r;
        while (column !== this.root) {
            if (column.name.includes(",")) {
                if (column.size < min_size_pos) {
                    min_columns_pos = [column];
                    min_size_pos = column.size;
                }
                else if (column.size === min_size_pos) {
                    min_columns_pos.push(column);
                }
            }
            else {
                if (column.size < min_size_type) {
                    min_columns_type = [column];
                    min_size_type = column.size;
                }
                else if (column.size === min_size_type) {
                    min_columns_type.push(column);
                }
            }
            column = column.r;
        }
        if (min_columns_pos.length > 0) {
            return min_columns_pos[(this.rng.int32() % min_columns_pos.length + min_columns_pos.length) % min_columns_pos.length];
        }
        return min_columns_type[(this.rng.int32() % min_columns_type.length + min_columns_type.length) % min_columns_type.length];
    }

    search (k=0) {
        if (k === 0 || this.o[k - 1].r !== this.o[k - 1]) {
            this.print_ans(k);
        }

        if (this.root.r === this.root) {
            return this.o.slice(0, k);
        }

        let c = this.choose_column();

        this.cover_column(c);

        let rs = [];
        let r = c.d;
        while (r !== c) {
            rs.push(r);
            r = r.d;
        }
        rs = shuffle(rs, this.rng);

        for (let r of rs) {
            this.o[k] = r;
            
            let j = r.r;
            while (j !== r) {
                this.cover_column(j.c);
                j = j.r;
            }

            const ans = this.search(k + 1);

            r = this.o[k];
            c = r.c;

            j = r.l;
            while (j !== r) {
                this.uncover_column(j.c);
                j = j.l;
            }

            if (ans !== undefined) {
                this.uncover_column(c);
                return ans;
            }
        }

        this.uncover_column(c);
        return undefined;
    }
}
