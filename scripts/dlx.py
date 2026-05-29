from random import choice, shuffle
import sys


sys.setrecursionlimit(5000)


class Node:
    def __init__(self, c) -> None:
        self.u = self
        self.d = self
        self.r = self
        self.l = self
        self.c = c


class Column(Node):
    def __init__(self, name) -> None:
        super().__init__(self)
        self.size = 0
        self.name = name


def add_horizontal(n1, n2):
    n2.r = n1
    n2.l = n1.l
    n1.l.r = n2
    n1.l = n2


def add_vertical(c, n2):
    n2.d = c
    n2.u = c.u
    c.u.d = n2
    c.u = n2
    c.size += 1


class DLX:
    def __init__(self, root) -> None:
        self.root = root
        cnt = 0
        c = self.root.r
        while c != self.root:
            cnt += 1
            c = c.r
        self.o = [None] * cnt

    def choose_column(self):
        column = self.root.r
        min_column = column
        min_size = column.size
        column = column.r
        while column != self.root:
            if column.size < min_size:
                min_column = column
                min_size = column.size
            column = column.r
        return min_column
    
    def cover_column(self, column):
        column.r.l = column.l
        column.l.r = column.r
        i = column.d
        while i != column:
            j = i.r
            while j != i:
                j.d.u = j.u
                j.u.d = j.d
                j.c.size -= 1
                j = j.r
            i = i.d

    def uncover_column(self, column):
        i = column.u
        while i != column:
            j = i.l
            while j != i:
                j.c.size += 1
                j.d.u = j
                j.u.d = j
                j = j.l
            i = i.u
        column.r.l = column
        column.l.r = column
    
    def search(self, k=0):
        if self.root.r == self.root:
            return [self.o[:k]]

        c = self.choose_column()
        self.cover_column(c)

        results = []
        r = c.d
        while r != c:
            self.o[k] = r

            j = r.r
            while j != r:
                self.cover_column(j.c)
                j = j.r

            results.extend(self.search(k + 1))

            r = self.o[k]
            c = r.c

            j = r.l
            while j != r:
                self.uncover_column(j.c)
                j = j.l

            r = r.d

        self.uncover_column(c)
        return results


class RDLX(DLX):
    def __init__(self, root) -> None:
        super().__init__(root)
        self.added = 0

    def choose_column(self):
        column = self.root
        min_columns_pos = []
        min_columns_type = []
        min_size_pos = float("inf")
        min_size_type = float("inf")
        column = column.r
        while column != self.root:
            if "," in column.name:
                if column.size < min_size_pos:
                    min_columns_pos = [column]
                    min_size_pos = column.size
                elif column.size == min_size_pos:
                    min_columns_pos.append(column)
            else:
                if column.size < min_size_type:
                    min_columns_type = [column]
                    min_size_type = column.size
                elif column.size == min_size_type:
                    min_columns_type.append(column)
            column = column.r
        if len(min_columns_pos) > 0:
            return choice(min_columns_pos)
        return choice(min_columns_type)
    
    def search(self, k=0):
        if self.root.r == self.root:
            # self.print_ans(k)
            return self.o[:k]
        
        # choose column
        c = self.choose_column()
        
        # cover column
        self.cover_column(c)

        rs = []
        r = c.d
        while r != c:
            rs.append(r)
            r = r.d
        shuffle(rs)
        
        for r in rs:
            self.o[k] = r

            j = r.r
            while j != r:
                self.cover_column(j.c)
                j = j.r

            ans = self.search(k + 1)

            r = self.o[k]
            c = r.c
            
            j = r.l
            while j != r:
                self.uncover_column(j.c)
                j = j.l
            
            if ans is not None:
                self.uncover_column(c)
                return ans
        
        self.uncover_column(c)