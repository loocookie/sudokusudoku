import { useState, useEffect, useCallback } from 'react'
import './App.css'

const DEFAULT_PARTITION = [
  [0, 0, 0, 0, 1, 1, 1, 1, 1],
  [0, 2, 0, 2, 2, 2, 3, 3, 1],
  [0, 2, 2, 2, 4, 2, 3, 1, 1],
  [0, 5, 5, 5, 4, 2, 3, 3, 1],
  [0, 5, 4, 4, 4, 4, 4, 3, 6],
  [7, 5, 5, 8, 4, 3, 3, 3, 6],
  [7, 7, 5, 8, 4, 8, 8, 8, 6],
  [7, 5, 5, 8, 8, 8, 6, 8, 6],
  [7, 7, 7, 7, 7, 6, 6, 6, 6]
]

const DEFAULT_PROBLEM = [
  [2, 0, 0, 0, 0, 7, 0, 0, 0],
  [0, 0, 0, 2, 0, 3, 0, 0, 6],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 4, 0, 0, 0, 0, 3, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 3, 7, 0, 2, 0, 0, 6, 0],
  [0, 0, 0, 7, 0, 0, 0, 0, 0],
  [8, 0, 0, 0, 3, 0, 0, 1, 0],
  [0, 2, 0, 5, 0, 9, 0, 0, 0]
]

const today = new Date().toISOString().slice(0, 10)

const HUES = [0, 40, 80, 120, 160, 200, 240, 280, 320]

function cellBg(p, state, theme) {
  const h = HUES[p % HUES.length]
  const s = theme === "dark" ? 35 : 50
  const base = theme === "dark" ? 22 : 82
  const delta = state === "clicked" ? 22 : state === "related" ? 10 : 0
  const l = theme === "dark" ? base + delta : base - delta
  return `hsl(${h}, ${s}%, ${l}%)`
}

function storageKey(difficulty, i, j) {
  return `${difficulty}_${today}_${i},${j}`
}

function initStorage(difficulty, problem) {
  problem.forEach((row, i) => row.forEach((n, j) => {
    const key = storageKey(difficulty, i, j)
    if (n !== 0) {
      localStorage.setItem(key, `${n}`)
    } else if (localStorage.getItem(key) === null) {
      localStorage.setItem(key, "")
    }
  }))
}

function loadGameState(difficulty) {
  const vals = [...Array(9)].map(() => Array(9).fill(""))
  const marks = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => Array(9).fill("")))
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const v = localStorage.getItem(storageKey(difficulty, i, j)) ?? ""
      if (v[0] === "[") {
        marks[i][j] = JSON.parse(v)
      } else {
        vals[i][j] = v
      }
    }
  }
  return { vals, marks }
}

function computeValid(r, c, vals, part) {
  const used = new Set()
  for (let k = 0; k < 9; k++) {
    const rv = vals[r][k]
    if (rv !== '') used.add(+rv)
    const cv = vals[k][c]
    if (cv !== '') used.add(+cv)
  }
  const p = part[r][c]
  for (let x = 0; x < 9; x++)
    for (let y = 0; y < 9; y++)
      if (part[x][y] === p && vals[x][y] !== '') used.add(+vals[x][y])
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => !used.has(n))
}

function computeAutoDisplay(r, c, vals, dels, part) {
  const valid = computeValid(r, c, vals, part)
  const cands = Array(9).fill("")
  valid.forEach(n => { if (!dels[r][c][n - 1]) cands[n - 1] = `${n}` })
  return cands
}

const emptyDeleted = () => Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => Array(9).fill(false)))

function App() {
  const [screen, setScreen] = useState("menu")
  const [difficulty, setDifficulty] = useState(null)
  const [partition, setPartition] = useState(DEFAULT_PARTITION)
  const [problem, setProblem] = useState(null)

  const [theme, setTheme] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light"
  )
  const [hoveredCell, setHoveredCell] = useState({ row: null, col: null, part: null })
  const [clickedCell, setClickedCell] = useState({ row: null, col: null, part: null })
  const [values, setValues] = useState([...Array(9)].map(() => Array(9).fill("")))
  const [marked, setMarked] = useState(() => Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => Array(9).fill(""))))
  const [deleted, setDeleted] = useState(emptyDeleted)
  const [writeMode, setWriteMode] = useState("normal")
  const [autoMode, setAutoMode] = useState(false)

  const outlineBorder = theme === "dark" ? "4px solid rgb(219, 219, 219)" : "4px solid rgb(36, 36, 36)"
  const thickBorderColor = theme === "dark" ? "rgb(219, 219, 219)" : "rgb(36, 36, 36)"
  const thinBorderColor = theme === "dark" ? "rgb(75, 75, 75)" : "rgb(180, 180, 180)"
  const thickBorder = `min(0.36vmin, 2px) solid ${thickBorderColor}`
  const thinBorder = `min(0.36vmin, 2px) solid ${thinBorderColor}`
  const defaultBackground = theme === "dark" ? "rgb(36, 36, 36)" : "rgb(255, 255, 255)"
  document.documentElement.style.backgroundColor = defaultBackground
  const problemFontColor = theme === "dark" ? "rgb(219, 219, 219)" : "rgb(36, 36, 36)"
  const playerFontColor = theme === "dark" ? "rgba(219, 219, 219, 0.55)" : "rgba(36, 36, 36, 0.55)"

  useEffect(() => {
    if (!difficulty) return

    const applyPuzzle = (part, prob) => {
      setPartition(part)
      setProblem(prob)
      initStorage(difficulty, prob)
      const { vals, marks } = loadGameState(difficulty)
      setValues(vals)
      setMarked(marks)
    }

    fetch(`/puzzles/${difficulty}/${today}.json`)
      .then(r => r.json())
      .then(data => applyPuzzle(data.partition, data.puzzle))
      .catch(() => applyPuzzle(DEFAULT_PARTITION, DEFAULT_PROBLEM))
  }, [difficulty])

  const handleDifficultySelect = (diff) => {
    setDifficulty(diff)
    setScreen("game")
    setClickedCell({ row: null, col: null, part: null })
    setHoveredCell({ row: null, col: null, part: null })
    setWriteMode("normal")
    setAutoMode(false)
    setDeleted(emptyDeleted())
  }

  const goToMenu = () => {
    setScreen("menu")
    setProblem(null)
    setDifficulty(null)
  }

  const collide = (() => {
    if (!problem) return []
    let collideList = []
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (values[i][j] !== "") {
          for (let x = i; x < 9; x++) {
            for (let y = 0; y < 9; y++) {
              if ((i !== x || j !== y) && values[x][y] !== "" && (i === x || j === y || partition[i][j] === partition[x][y]) && values[i][j] === values[x][y]) {
                if (!collideList.some(([r, c]) => r === i && c === j)) collideList.push([i, j])
                if (!collideList.some(([r, c]) => r === x && c === y)) collideList.push([x, y])
              }
            }
          }
        }
      }
    }
    return collideList
  })()

  const handleKeyDown = useCallback((event) => {
    if (!problem || clickedCell.row === null) return
    const r = clickedCell.row, c = clickedCell.col
    if (problem[r][c] !== 0) return

    const key = storageKey(difficulty, r, c)
    const val = values[r][c]

    if (event.key >= "1" && event.key <= "9") {
      const n = parseInt(event.key, 10)
      if (writeMode === "normal") {
        const newValues = values.map(row => [...row])
        newValues[r][c] = event.key
        setValues(newValues)
        const newMarked = marked.map(row => row.map(arr => [...arr]))
        newMarked[r][c] = Array(9).fill("")
        setMarked(newMarked)
        localStorage.setItem(key, event.key)
      } else {
        if (val !== "") return
        if (autoMode) {
          const newDel = deleted.map(row => row.map(arr => [...arr]))
          newDel[r][c][n - 1] = !newDel[r][c][n - 1]
          setDeleted(newDel)
        } else {
          const newMarked = marked.map(row => row.map(arr => [...arr]))
          newMarked[r][c][n - 1] = newMarked[r][c][n - 1] === "" ? event.key : ""
          setMarked(newMarked)
          localStorage.setItem(key, JSON.stringify(newMarked[r][c]))
        }
      }
    } else if (event.key === "Backspace" || event.key === "Delete") {
      if (val !== "") {
        const newValues = values.map(row => [...row])
        newValues[r][c] = ""
        setValues(newValues)
        localStorage.setItem(key, "")
      } else {
        if (autoMode) {
          const newDel = deleted.map(row => row.map(arr => [...arr]))
          newDel[r][c] = Array(9).fill(false)
          setDeleted(newDel)
        } else {
          const newMarked = marked.map(row => row.map(arr => [...arr]))
          newMarked[r][c] = Array(9).fill("")
          setMarked(newMarked)
          localStorage.setItem(key, "")
        }
      }
    }
  }, [clickedCell, writeMode, values, marked, deleted, problem, difficulty, autoMode])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  if (screen === "menu") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "16px", backgroundColor: defaultBackground }}>
        <h1 style={{ color: problemFontColor, marginBottom: "8px" }}>Mosaic Sudoku</h1>
        {[["easy", "Easy"], ["medium", "Medium"], ["hard", "Hard"], ["extreme", "Extreme"]].map(([key, label]) => (
          <button
            key={key}
            onClick={() => handleDifficultySelect(key)}
            style={{ width: "200px", padding: "16px", fontSize: "min(3.2vmin, 18px)", fontWeight: "bold", color: problemFontColor, background: defaultBackground, border: thinBorder, cursor: "pointer" }}>
            {label}
          </button>
        ))}
      </div>
    )
  }

  if (!problem) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: problemFontColor, backgroundColor: defaultBackground }}>
        Loading...
      </div>
    )
  }

  return (
    <>
      <h1 style={{ color: problemFontColor }}>Mosaic Sudoku</h1>
      <div className="game_container" style={{ width: "min(80vmin, 450px)", maxWidth: "100%", maxHeight: "100%", display: "grid" }}>
        <div className="grid_container" style={{ aspectRatio: 1 / 1, display: "grid", gridTemplateRows: "repeat(9, 1fr)", gridTemplateColumns: "1fr", position: "relative", outline: outlineBorder, transition: "0.25s", borderRadius: "min(3.2vmin, 18px)", overflow: "hidden" }}>
          {partition.map((row, rowIndex) => (
            <div key={rowIndex} className="grid_row" style={{ display: "grid", gridTemplateColumns: "repeat(9, 1fr)" }}>
              {row.map((_, columnIndex) => {
                const val = values[rowIndex][columnIndex]
                const dispCands = val === ""
                  ? (autoMode
                      ? computeAutoDisplay(rowIndex, columnIndex, values, deleted, partition)
                      : marked[rowIndex][columnIndex])
                  : null
                const hasCands = dispCands && dispCands.some(v => v !== "")
                const bgState = (clickedCell?.row === rowIndex && clickedCell?.col === columnIndex) ? "clicked"
                  : (hoveredCell?.row === rowIndex || hoveredCell?.col === columnIndex || hoveredCell?.part === partition[rowIndex][columnIndex]) ? "related"
                  : "default"

                return hasCands ? (
                  <div
                    key={`${rowIndex}-${columnIndex}`}
                    className="grid_cell"
                    onMouseEnter={() => setHoveredCell({ row: rowIndex, col: columnIndex, part: partition[rowIndex][columnIndex] })}
                    onMouseLeave={() => setHoveredCell(null)}
                    onMouseDown={() => setClickedCell({ row: rowIndex, col: columnIndex, part: partition[rowIndex][columnIndex] })}
                    style={{
                      width: "100%",
                      display: "grid",
                      gridTemplateRows: "repeat(3, 1fr)",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      boxSizing: "border-box",
                      backgroundColor: cellBg(partition[rowIndex][columnIndex], bgState, theme),
                      transition: "0.25s",
                      position: "relative"
                    }}>
                    {dispCands.map((value, index) => (
                      <div
                        key={`${rowIndex}-${columnIndex}-${index}`}
                        className="grid_subcell"
                        style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "center", boxSizing: "border-box", fontSize: "min(1.78vmin, 10px)", fontWeight: "bold", color: clickedCell?.row === rowIndex && clickedCell?.col === columnIndex ? problemFontColor : playerFontColor, transition: "0.25s" }}>
                        {value}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    key={`${rowIndex}-${columnIndex}`}
                    className="grid_cell"
                    onMouseEnter={() => setHoveredCell({ row: rowIndex, col: columnIndex, part: partition[rowIndex][columnIndex] })}
                    onMouseLeave={() => setHoveredCell(null)}
                    onMouseDown={() => setClickedCell({ row: rowIndex, col: columnIndex, part: partition[rowIndex][columnIndex] })}
                    style={{
                      display: "flex",
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      boxSizing: "border-box",
                      backgroundColor: cellBg(partition[rowIndex][columnIndex], bgState, theme),
                      fontSize: "min(4.27vmin, 24px)",
                      fontWeight: "bold",
                      color: problem[rowIndex][columnIndex] === 0 ? playerFontColor : problemFontColor,
                      transition: "background-color 0.25s, color 0.25s, border-color 0.25s",
                      position: "relative"
                    }}>
                    {val}
                    {collide.some(([r, c]) => r === rowIndex && c === columnIndex) && (
                      <span style={{ position: "absolute", top: "min(0.53vmin, 3px)", right: "min(0.53vmin, 3px)", width: "min(0.89vmin, 5px)", height: "min(0.89vmin, 5px)", backgroundColor: "red", borderRadius: "50%" }}></span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", strokeLinecap: "square" }} viewBox="0 0 9 9" preserveAspectRatio="none">
            {[...Array(8)].flatMap((_, c) => [...Array(9)].flatMap((_, r) => partition[r][c] === partition[r][c + 1] ? [<line key={`v-${r}-${c}`} x1={c + 1} y1={r} x2={c + 1} y2={r + 1} stroke={thinBorderColor} strokeWidth="4" vectorEffect="non-scaling-stroke" />] : []))}
            {[...Array(9)].flatMap((_, c) => [...Array(8)].flatMap((_, r) => partition[r][c] === partition[r + 1][c] ? [<line key={`h-${r}-${c}`} x1={c} y1={r + 1} x2={c + 1} y2={r + 1} stroke={thinBorderColor} strokeWidth="4" vectorEffect="non-scaling-stroke" />] : []))}
            {[...Array(8)].flatMap((_, c) => [...Array(9)].flatMap((_, r) => partition[r][c] !== partition[r][c + 1] ? [<line key={`V-${r}-${c}`} x1={c + 1} y1={r} x2={c + 1} y2={r + 1} stroke={thickBorderColor} strokeWidth="4" vectorEffect="non-scaling-stroke" />] : []))}
            {[...Array(9)].flatMap((_, c) => [...Array(8)].flatMap((_, r) => partition[r][c] !== partition[r + 1][c] ? [<line key={`H-${r}-${c}`} x1={c} y1={r + 1} x2={c + 1} y2={r + 1} stroke={thickBorderColor} strokeWidth="4" vectorEffect="non-scaling-stroke" />] : []))}
          </svg>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", paddingTop: "20px", gap: "10px" }}>
          <button onClick={goToMenu} style={{ padding: "12px", color: problemFontColor, fontSize: "min(3.2vmin, 18px)", fontWeight: "bold", border: thinBorder, background: defaultBackground }}>
            Menu
          </button>
          <button onClick={() => setTheme(t => t === "light" ? "dark" : "light")} style={{ padding: "12px", color: problemFontColor, fontSize: "min(3.2vmin, 18px)", fontWeight: "bold", border: thinBorder, background: defaultBackground }}>
            {theme === "light" ? "Light" : "Dark"}
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", paddingTop: "10px", gap: "10px" }}>
          <button onClick={() => setWriteMode(m => m === "normal" ? "candidate" : "normal")} style={{ padding: "12px", color: problemFontColor, fontSize: "min(3.2vmin, 18px)", fontWeight: "bold", border: thinBorder, background: defaultBackground }}>
            {writeMode === "normal" ? "Normal mode" : "Candidate mode"}
          </button>
          <button onClick={() => setAutoMode(m => !m)} style={{ padding: "12px", color: autoMode ? defaultBackground : problemFontColor, fontSize: "min(3.2vmin, 18px)", fontWeight: "bold", border: thinBorder, background: autoMode ? problemFontColor : defaultBackground }}>
            Auto candidate
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", paddingTop: "20px", paddingBottom: "20px", gap: "10px" }}>
          {Array.from({ length: 9 }).map((_, index) => (
            <button
              key={index + 1}
              onClick={() => {
                if (clickedCell.row === null || problem[clickedCell.row][clickedCell.col] !== 0) return
                const r = clickedCell.row, c = clickedCell.col
                const key = storageKey(difficulty, r, c)
                const val = values[r][c]
                if (writeMode === "normal") {
                  const next = values.map(row => [...row])
                  next[r][c] = `${index + 1}`
                  setValues(next)
                  const newMarked = marked.map(row => row.map(arr => [...arr]))
                  newMarked[r][c] = Array(9).fill("")
                  setMarked(newMarked)
                  localStorage.setItem(key, `${index + 1}`)
                } else {
                  if (val !== "") return
                  if (autoMode) {
                    const newDel = deleted.map(row => row.map(arr => [...arr]))
                    newDel[r][c][index] = !newDel[r][c][index]
                    setDeleted(newDel)
                  } else {
                    const next = marked.map(row => row.map(arr => [...arr]))
                    next[r][c][index] = next[r][c][index] === "" ? `${index + 1}` : ""
                    setMarked(next)
                    localStorage.setItem(key, JSON.stringify(next[r][c]))
                  }
                }
              }}
              style={{ padding: "12px", color: problemFontColor, fontSize: "min(3.2vmin, 18px)", fontWeight: "bold", border: thinBorder, background: defaultBackground }}>
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => {
              if (clickedCell.row === null || problem[clickedCell.row][clickedCell.col] !== 0) return
              const r = clickedCell.row, c = clickedCell.col
              const val = values[r][c]
              if (val !== "") {
                const next = values.map(row => [...row])
                next[r][c] = ""
                setValues(next)
                localStorage.setItem(storageKey(difficulty, r, c), "")
              } else {
                if (autoMode) {
                  const newDel = deleted.map(row => row.map(arr => [...arr]))
                  newDel[r][c] = Array(9).fill(false)
                  setDeleted(newDel)
                } else {
                  const next = marked.map(row => row.map(arr => [...arr]))
                  next[r][c] = Array(9).fill("")
                  setMarked(next)
                  localStorage.setItem(storageKey(difficulty, r, c), "")
                }
              }
            }}
            style={{ padding: "12px", color: problemFontColor, fontSize: "min(3.2vmin, 18px)", fontWeight: "bold", border: thinBorder, background: defaultBackground }}>
            ⌫
          </button>
        </div>
      </div>
    </>
  )
}

export default App
