from random import shuffle
from dlx import *


def sudoku_grid(n, partition):
    root = Column("root")

    rc = [[None for j in range(n)] for i in range(n)]
    rn = [[None for k in range(n)] for i in range(n)]
    cn = [[None for k in range(n)] for j in range(n)]
    pn = [[None for k in range(n)] for p in range(n)]
    
    for i in range(n):
        for j in range(n):
            column = Column(f"R{i} C{j}")
            rc[i][j] = column
            add_horizontal(root, column)
    
    for i in range(n):
        for k in range(1, n + 1):
            column = Column(f"R{i} N{k}")
            rn[i][k - 1] = column
            add_horizontal(root, column)
    
    for j in range(n):
        for k in range(1, n + 1):
            column = Column(f"C{j} N{k}")
            cn[j][k - 1] = column
            add_horizontal(root, column)
    
    for p in range(n):
        for k in range(1, n + 1):
            column = Column(f"P{p} N{k}")
            pn[p][k - 1] = column
            add_horizontal(root, column)

    for i in range(n):
        for j in range(n):
            for k in range(1, n + 1):
                node_rc = Node(rc[i][j])
                add_vertical(rc[i][j], node_rc)

                node_rn = Node(rn[i][k - 1])
                add_vertical(rn[i][k - 1], node_rn)
                add_horizontal(node_rc, node_rn)

                node_cn = Node(cn[j][k - 1])
                add_vertical(cn[j][k - 1], node_cn)
                add_horizontal(node_rc, node_cn)

                node_bn = Node(pn[partition[i][j]][k - 1])
                add_vertical(pn[partition[i][j]][k - 1], node_bn)
                add_horizontal(node_rc, node_bn)
    
    return root, rc, rn, cn, pn


class DLX_Sudoku_Generator(DLX):
    def __init__(self, n, partition) -> None:
        self.n = n
        self.partition = partition
        # self.partition = [[i // 3 * 3 + j // 3 for j in range(9)] for i in range(9)]
        while True:
            sol = RDLX_Sudoku_Solver(n, self.partition).search()
            if sol is not None:
                self.sudoku = sol
                break
        root, self.rc, self.rn, self.cn, self.pn = sudoku_grid(self.n, self.partition)

        super().__init__(root)

        for i in range(self.n):
            for j in range(self.n):
                k = self.sudoku[i][j]
                self.cover_column(self.rc[i][j])
                self.cover_column(self.rn[i][k - 1])
                self.cover_column(self.cn[j][k - 1])
                self.cover_column(self.pn[self.partition[i][j]][k - 1])
        
        self.n_solution = 0
        self.difficulty = 0
        self.n2 = self.n * self.n

    def search(self, k=0):
        if self.n_solution >= 2:
            return
        if self.root.r == self.root:
            self.n_solution += 1
            return

        c = self.choose_column()
        
        # cover column
        self.cover_column(c)

        r = c.d
        cnt = -1
        while r != c:
            self.o[k] = r

            j = r.r
            while j != r:
                self.cover_column(j.c)
                j = j.r

            cnt += 1
            self.search(k + 1)

            r = self.o[k]
            c = r.c
            
            j = r.l
            while j != r:
                self.uncover_column(j.c)
                j = j.l

            r = r.d
        self.difficulty += cnt ** 2
        
        self.uncover_column(c)


    def generate(self, n_puzzle):
        results = []
        while len(results) < n_puzzle:
            way = list(range(self.n2))
            shuffle(way)

            possible = -1
            difficulty = 0
            for h in range(self.n2):
                self.difficulty = 0
                self.n_solution = 0

                for i in range(self.n2 - 1, way[h] - 1, -1):
                    if i not in way[:h]:
                        x, y = i // self.n, i % self.n
                        k = self.sudoku[x][y]
                        self.uncover_column(self.pn[self.partition[x][y]][k - 1])
                        self.uncover_column(self.cn[y][k - 1])
                        self.uncover_column(self.rn[x][k - 1])
                        self.uncover_column(self.rc[x][y])
                for i in range(way[h] + 1, self.n2):
                    if i not in way[:h]:
                        x, y = i // self.n, i % self.n
                        k = self.sudoku[x][y]
                        self.cover_column(self.rc[x][y])
                        self.cover_column(self.rn[x][k - 1])
                        self.cover_column(self.cn[y][k - 1])
                        self.cover_column(self.pn[self.partition[x][y]][k - 1])

                if 2 * h > self.n2:
                    self.search()
                    if self.n_solution == 1:
                        difficulty = self.difficulty + (h + 1) / self.n2
                    else:
                        if difficulty != 0:
                            puzzle = [l[:] for l in self.sudoku]
                            for i in way[:h]:
                                x, y = i // self.n, i % self.n
                                puzzle[x][y] = 0
                            results.append({
                                "difficulty": difficulty,
                                "puzzle": puzzle,
                                "solution": [l[:] for l in self.sudoku],
                            })
                        break
                possible += 1

            for h in range(possible, -1, -1):
                for i in range(self.n2 - 1, way[h], -1):
                    if i not in way[:h]:
                        x, y = i // self.n, i % self.n
                        k = self.sudoku[x][y]
                        self.uncover_column(self.pn[self.partition[x][y]][k - 1])
                        self.uncover_column(self.cn[y][k - 1])
                        self.uncover_column(self.rn[x][k - 1])
                        self.uncover_column(self.rc[x][y])
                for i in range(way[h], self.n2):
                    if i not in way[:h]:
                        x, y = i // self.n, i % self.n
                        k = self.sudoku[x][y]
                        self.cover_column(self.rc[x][y])
                        self.cover_column(self.rn[x][k - 1])
                        self.cover_column(self.cn[y][k - 1])
                        self.cover_column(self.pn[self.partition[x][y]][k - 1])

        return results


class RDLX_Sudoku_Solver(RDLX):
    def __init__(self, n, partition, sudoku=None) -> None:
        self.n = n
        if sudoku is None:
            self.sudoku = [[0 for j in range(n)] for i in range(n)]
        else:
            self.sudoku = sudoku
        self.partition = partition
        self.steps = 0

        root, rc, rn, cn, pn = sudoku_grid(n, partition)
        super().__init__(root)

        for i in range(self.n):
            for j in range(self.n):
                k = self.sudoku[i][j]
                if k != 0:
                    self.cover_column(rc[i][j])
                    self.cover_column(rn[i][k - 1])
                    self.cover_column(cn[j][k - 1])
                    self.cover_column(pn[partition[i][j]][k - 1])

    def search(self, k=0):
        self.steps += 1
        if self.steps > 100000:
            return None
        # end step
        if self.root.r == self.root:
            # self.print_ans(k)
            ans = [self.sudoku[i][:] for i in range(self.n)]
            for i in range(k):
                value = {"R": None, "C": None, "N": None} 
                done = {"R": False, "C": False, "N": False}

                o = self.o[i]
                while not (done["R"] and done["C"] and done["N"]):
                    a = o.c.name.split()
                    for v in a:
                        if v[0] in "RCN" and not done[v[0]]:
                            value[v[0]] = int(v[1:])
                            done[v[0]] = True
                    o = o.r
                
                ans[value["R"]][value["C"]] = value["N"]
            return ans
        
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