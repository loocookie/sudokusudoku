from datetime import date, timedelta
import json, os
from partition import random_partition, n_mino
from sudoku import DLX_Sudoku_Generator


today = (date.today() + timedelta(days=1)).isoformat()
n_minos = [m for m in n_mino(9) if m.max_x < 7 and m.max_y < 7]
P = random_partition(9, n_minos, redundant=True)

n, k = 20, 20

all_puzzles = []
for i in range(n):
    gen = DLX_Sudoku_Generator(9, P)
    all_puzzles += gen.generate(k)

targets = [100, 1000, 10000]
labels = ["easy", "medium", "hard", "extreme"]

all_puzzles.sort(key=lambda p: p["difficulty"])

picks = [min(all_puzzles, key=lambda p: abs(p["difficulty"] - t)) for t in targets]
picks.append(all_puzzles[-1])  # extreme = max


# all_puzzles에서 난이도별로 하나씩 골라 JSON 저장
for i in range(4):
    puzzle = picks[i]
    difficulty = labels[i]
    os.makedirs(f"../public/puzzles/{difficulty}", exist_ok=True)
    with open(f"../public/puzzles/{difficulty}/{today}.json", "w") as f:
        json.dump({**puzzle, "partition": P}, f)
