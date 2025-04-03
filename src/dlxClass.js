export class DLX {
    constructor (root) {
        this.root = root;
        let cnt = 0;
        let c = this.root.r;
        while (c !== this.root) {
            cnt += 1;
            c = c.r;
        }
        this.o = Array(cnt).fill(null)
    }

    print_ans (k) {
        [...Array(k)].forEach((_, i) => {
            let str = "";
            const o = this.o[i]
            str += o.c.name + " ";
            let o_r = o.r;
            while (o_r !== o) {
                str += o_r.c.name + " ";
                o_r = o_r.r;
            }
            console.log(str);
        })
    }

    choose_column () {
        let column = this.root.r;
        let min_column = column;
        let min_size = column.size;
        column = column.r;
        while (column !== this.root) {
            if (column.size < min_size) {
                min_column = column;
                min_size = column.size;
            }
            column = column.r;
        }
        return min_column;
    }

    cover_column (column) {
        column.r.l = column.l;
        column.l.r = column.r;
        let i = column.d;
        while (i !== column) {
            let j = i.r;
            while (j !== i) {
                j.d.u = j.u;
                j.u.d = j.d;
                j.c.size -= 1;
                j = j.r;
            }
            i = i.d;
        }
    }

    uncover_column (column) {
        let i = column.u;
        while (i !== column) {
            let j = i.l;
            while (j !== i) {
                j.c.size += 1;
                j.d.u = j;
                j.u.d = j;
                j = j.l;
            }
            i = i.u;
        }
        column.r.l = column;
        column.l.r = column;
    }

    search (k=0) {
        if (this.root.r == this.root) {
            this.print_ans(k);
        }

        let c = this.choose_column();

        this.cover_column(c);

        let r = c.d;
        while (r !== c) {
            this.o[k] == r;

            let j = r.r;
            while (j !== r) {
                this.cover_column(j.c);
                j = j.r;
            }

            this.search(k + 1);

            r = this.o[k];
            c = r.c;

            j = r.l;
            while (j !== r) {
                this.uncover_column(j.c);
                j = j.l;
            }

            r = r.d;
        }

        this.uncover_column(c);
    }
}
