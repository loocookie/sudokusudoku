from dlx import *


class Mino:
    def __init__(self, n, blocks):
        assert len(blocks) == n
        
        self.n = n
        self.blocks = []
        
        min_x, min_y = blocks[0][0], blocks[0][1]
        self.max_x, self.max_y = blocks[0][0], blocks[0][1]
        for i in range(1, n):
            x, y = blocks[i]
            if min_x > x:
                min_x = x
            if min_y > y:
                min_y = y
            if self.max_x < x:
                self.max_x = x
            if self.max_y < y:
                self.max_y = y
        self.max_x -= min_x
        self.max_y -= min_y
        
        for x, y in blocks:
            self.blocks.append((x - min_x, y - min_y))

        self.hash = []
        self.quarter = False
        self.half = False
        self.mirror = False

        for i in range(4):
            h = hash(str(self))
            if i == 1 and h == self.hash[0]:
                self.quarter = True
                self.half = True
                self.rotate()
                self.rotate()
                self.rotate()
                break
            if i == 2 and h == self.hash[0]:
                self.half = True
                self.rotate()
                self.rotate()
                break
            self.hash.append(h)
            self.rotate()
        
        self.reflect()
        h = hash(str(self))
        if h in self.hash:
            self.mirror = True
        else:
            for i in range(4):
                if self.quarter and i == 1:
                    self.rotate()
                    self.rotate()
                    self.rotate()
                    break
                if self.half and i == 2:
                    self.rotate()
                    self.rotate()
                    break
                self.hash.append(hash(str(self)))
                self.rotate()
        self.reflect()
        self.hash = set(self.hash)

    def __str__(self):
        ans = ""
        for i in range(self.max_x + 1):
            for j in range(self.max_y + 1):
                ans += "X" if (i, j) in self.blocks else " "
            ans += "\n"
        return ans
                
    
    def rotate(self):
        self.blocks = [(self.max_y - y, x) for x, y in self.blocks]
        self.max_x, self.max_y = self.max_y, self.max_x
    
    def reflect(self):
        self.blocks = [(y, x) for x, y in self.blocks]
        self.max_x, self.max_y = self.max_y, self.max_x
    
    def __eq__(self, other):
        return self.hash == other.hash
    

def n_mino(n):
    if n == 1:
        return [Mino(1, [(0, 0)])]
    
    minos = []
    for mino in n_mino(n - 1):
        for x, y in mino.blocks:
            for i, j in [(1, 0), (0, 1), (-1, 0), (0, -1)]:
                block = (x + i, y + j)
                if block not in mino.blocks:
                    new_mino = Mino(n, mino.blocks + [block])
                    if new_mino not in minos:
                        minos.append(new_mino)
    
    return minos

    
def jigsaw_grid(n, n_minos):
    l = len(n_minos)

    root = Column("root")

    tiles = [None for k in range(l)]
    blocks = [[None for j in range(n)] for i in range(n)]

    for k in range(l):
        column = Column(f"{k}")
        tiles[k] = column
        add_horizontal(root, column)

    for i in range(n):
        for j in range(n):
            column = Column(f"{i}, {j}")
            blocks[i][j] = column
            add_horizontal(root, column)
            
    for k in range(l):
        tile = n_minos[k]
        node = Node(tiles[k])
        add_vertical(tiles[k], node)
        for cnt in range(4):
            if tile.quarter and cnt == 1:
                break
            if tile.half and cnt == 2:
                break
            for a in range(n - tile.max_x):
                for b in range(n - tile.max_y):
                    node = Node(tiles[k])
                    add_vertical(tiles[k], node)
                    for i, j in tile.blocks:
                        node2 = Node(blocks[i + a][j + b])
                        add_vertical(blocks[i + a][j + b], node2)
                        add_horizontal(node, node2)
            tile.rotate()
                
        if tile.mirror:
            tile.reflect()
            for cnt in range(4):
                if tile.quarter and cnt == 1:
                    break
                if tile.half and cnt == 2:
                    break
                for a in range(n - tile.max_x):
                    for b in range(n - tile.max_y):
                        node = Node(tiles[k])
                        add_vertical(tiles[k], node)
                        for i, j in tile.blocks:
                            node2 = Node(blocks[i + a][j + b])
                            add_vertical(blocks[i + a][j + b], node2)
                            add_horizontal(node, node2)
                tile.rotate()
            tile.reflect()
        
    return root, tiles, blocks


def jigsaw_grid_redundant(n, n_minos):
    l = len(n_minos)

    root = Column("root")

    blocks = [[None for j in range(n)] for i in range(n)]

    for i in range(n):
        for j in range(n):
            column = Column(f"{i}, {j}")
            blocks[i][j] = column
            add_horizontal(root, column)
            
    for k in range(l):
        tile = n_minos[k]
        for cnt in range(4):
            if tile.quarter and cnt == 1:
                break
            if tile.half and cnt == 2:
                break
            for a in range(n - tile.max_x):
                for b in range(n - tile.max_y):
                    node = Node(blocks[tile.blocks[0][0] + a][tile.blocks[0][1] + b])
                    add_vertical(blocks[tile.blocks[0][0] + a][tile.blocks[0][1] + b], node)
                    for i, j in tile.blocks[1:]:
                        node2 = Node(blocks[i + a][j + b])
                        add_vertical(blocks[i + a][j + b], node2)
                        add_horizontal(node, node2)
            tile.rotate()
                
        if tile.mirror:
            tile.reflect()
            for cnt in range(4):
                if tile.quarter and cnt == 1:
                    break
                if tile.half and cnt == 2:
                    break
                for a in range(n - tile.max_x):
                    for b in range(n - tile.max_y):
                        node = Node(blocks[tile.blocks[0][0] + a][tile.blocks[0][1] + b])
                        add_vertical(blocks[tile.blocks[0][0] + a][tile.blocks[0][1] + b], node)
                        for i, j in tile.blocks[1:]:
                            node2 = Node(blocks[i + a][j + b])
                            add_vertical(blocks[i + a][j + b], node2)
                            add_horizontal(node, node2)
                tile.rotate()
            tile.reflect()
        
    return root, blocks


def random_partition(n, n_minos, redundant, constraint=[]):
    partition = [[None for j in range(n)] for i in range(n)]
    cnt = 0
    if redundant:
        root, blocks = jigsaw_grid_redundant(n, n_minos)
        o = RDLX(root)
        for (a, b), mino in constraint:
            o.added += 1
            for x, y in mino.blocks:
                o.cover_column(blocks[x + a][y + b])
            r = blocks[mino.blocks[0][0] + a][mino.blocks[0][1] + b].d
            while r != blocks[mino.blocks[0][0] + a][mino.blocks[0][1] + b]:
                flag = True
                c = r.r
                while c != r:
                    t = tuple(map(int, c.c.name.split(",")))
                    if (t[0] - a, t[1] - b) not in mino.blocks:
                        flag = False
                        break
                    c = c.r
                if flag:
                    o.o[cnt] = r
                    break
                r = r.d
            cnt += 1
        ans = o.search(cnt)
    else:
        root, tiles, blocks = jigsaw_grid(n, n_minos)
        o = RDLX(root)
        for (a, b), mino in constraint:
            o.added += 1
            i = n_minos.index(mino)
            o.cover_column(tiles[i])
            for x, y in mino.blocks:
                o.cover_column(blocks[x + a][y + b])
            r = tiles[i].d
            while r != tiles[i]:
                if r.r != r:
                    flag = True
                    c = r.r
                    while c != r:
                        t = tuple(map(int, c.c.name.split(",")))
                        if (t[0] - a, t[1] - b) not in mino.blocks:
                            flag = False
                            break
                        c = c.r
                    if flag:
                        o.o[cnt] = r
                        break
                r = r.d
            cnt += 1
        ans = o.search(cnt)
    cnt = 0
    for node in ans:
        if node.r != node:
            if "," in node.c.name:
                i, j = tuple(map(int, node.c.name.strip().split(",")))
                partition[i][j] = cnt
            r = node.r
            while r != node:
                if "," in r.c.name:
                    i, j = tuple(map(int, r.c.name.strip().split(",")))
                    partition[i][j] = cnt
                r = r.r
            cnt += 1
    
    return partition