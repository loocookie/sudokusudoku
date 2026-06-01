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

function deletedStorageKey(difficulty, i, j) {
  return `${difficulty}_${today}_del_${i},${j}`
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
  const dels = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => Array(9).fill(false)))
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const v = localStorage.getItem(storageKey(difficulty, i, j)) ?? ""
      if (v[0] === "[") {
        marks[i][j] = JSON.parse(v)
      } else {
        vals[i][j] = v
      }
      const dv = localStorage.getItem(deletedStorageKey(difficulty, i, j))
      if (dv) dels[i][j] = JSON.parse(dv)
    }
  }
  return { vals, marks, dels }
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
  const [solution, setSolution] = useState(null)
  const [history, setHistory] = useState([])

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

    const applyPuzzle = (part, prob, sol) => {
      setPartition(part)
      setProblem(prob)
      setSolution(sol)
      initStorage(difficulty, prob)
      const { vals, marks, dels } = loadGameState(difficulty)
      setValues(vals)
      setMarked(marks)
      setDeleted(dels)
      setHistory([])
    }

    fetch(`/puzzles/${difficulty}/${today}.json`)
      .then(r => r.json())
      .then(data => applyPuzzle(data.partition, data.puzzle, data.solution))
      .catch(() => applyPuzzle(DEFAULT_PARTITION, DEFAULT_PROBLEM, null))
  }, [difficulty])

  const handleDifficultySelect = (diff) => {
    setDifficulty(diff)
    setScreen("game")
    setClickedCell({ row: null, col: null, part: null })
    setHoveredCell({ row: null, col: null, part: null })
    setWriteMode("normal")
    setAutoMode(false)
    setDeleted(emptyDeleted())
    setHistory([])
  }

  const goToMenu = () => {
    setScreen("menu")
    setProblem(null)
    setDifficulty(null)
  }

  const handleReset = () => {
    if (!problem) return
    const newValues = values.map((row, i) => row.map((_, j) => problem[i][j] !== 0 ? `${problem[i][j]}` : ""))
    const newMarked = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => Array(9).fill("")))
    const newDels = emptyDeleted()
    setValues(newValues)
    setMarked(newMarked)
    setDeleted(newDels)
    setHistory([])
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (problem[i][j] !== 0) {
          localStorage.setItem(storageKey(difficulty, i, j), `${problem[i][j]}`)
        } else {
          localStorage.setItem(storageKey(difficulty, i, j), "")
          localStorage.removeItem(deletedStorageKey(difficulty, i, j))
        }
      }
    }
  }

  const handleUndo = () => {
    if (history.length === 0 || !problem) return
    const prev = history[history.length - 1]
    setHistory(h => h.slice(0, -1))
    setValues(prev.values)
    setMarked(prev.marks)
    setDeleted(prev.dels)
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (problem[i][j] !== 0) continue
        const key = storageKey(difficulty, i, j)
        const dkey = deletedStorageKey(difficulty, i, j)
        const v = prev.values[i][j]
        const m = prev.marks[i][j]
        if (v !== "") {
          localStorage.setItem(key, v)
        } else if (m.some(x => x !== "")) {
          localStorage.setItem(key, JSON.stringify(m))
        } else {
          localStorage.setItem(key, "")
        }
        if (prev.dels[i][j].some(x => x)) {
          localStorage.setItem(dkey, JSON.stringify(prev.dels[i][j]))
        } else {
          localStorage.removeItem(dkey)
        }
      }
    }
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
    const snap = () => ({
      values: values.map(row => [...row]),
      marks: marked.map(row => row.map(arr => [...arr])),
      dels: deleted.map(row => row.map(arr => [...arr]))
    })

    if (event.key >= "1" && event.key <= "9") {
      const n = parseInt(event.key, 10)
      if (writeMode === "normal") {
        setHistory(h => [...h, snap()])
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
          setHistory(h => [...h, snap()])
          const newDel = deleted.map(row => row.map(arr => [...arr]))
          newDel[r][c][n - 1] = !newDel[r][c][n - 1]
          setDeleted(newDel)
          localStorage.setItem(deletedStorageKey(difficulty, r, c), JSON.stringify(newDel[r][c]))
        } else {
          setHistory(h => [...h, snap()])
          const newMarked = marked.map(row => row.map(arr => [...arr]))
          newMarked[r][c][n - 1] = newMarked[r][c][n - 1] === "" ? event.key : ""
          setMarked(newMarked)
          localStorage.setItem(key, JSON.stringify(newMarked[r][c]))
        }
      }
    } else if (event.key === "Backspace" || event.key === "Delete") {
      if (val !== "") {
        setHistory(h => [...h, snap()])
        const newValues = values.map(row => [...row])
        newValues[r][c] = ""
        setValues(newValues)
        localStorage.setItem(key, "")
      } else {
        if (autoMode) {
          setHistory(h => [...h, snap()])
          const newDel = deleted.map(row => row.map(arr => [...arr]))
          newDel[r][c] = Array(9).fill(false)
          setDeleted(newDel)
          localStorage.setItem(deletedStorageKey(difficulty, r, c), JSON.stringify(newDel[r][c]))
        } else {
          setHistory(h => [...h, snap()])
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

  const cleared = !!solution && values.every((row, i) => row.every((v, j) => v === `${solution[i][j]}`))

  const btnStyle = { padding: "12px", color: problemFontColor, fontSize: "min(3.2vmin, 18px)", fontWeight: "bold", border: thinBorder, background: defaultBackground, cursor: "pointer" }
  const iconBtnStyle = { width: "min(9vmin, 44px)", height: "min(9vmin, 44px)", border: null, background: defaultBackground, color: problemFontColor, fontSize: "min(5vmin, 22px)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }

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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh", backgroundColor: defaultBackground, padding: "0 12px" }}>
      <h1 style={{ color: problemFontColor, margin: "16px 0 4px 0" }}>Mosaic Sudoku</h1>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "min(80vmin, 450px)", maxWidth: "100%", paddingBottom: "12px", paddingTop: "12px" }}>
        <button onClick={goToMenu} style={iconBtnStyle}>🡸</button>
        <button onClick={() => setTheme(t => t === "light" ? "dark" : "light")} style={iconBtnStyle}>
          {theme === "light" ? "☀" : "⏾"}
        </button>
      </div>
      <div style={{ width: "min(80vmin, 450px)", maxWidth: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
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
                      position: "relative",
                      animation: cleared ? `cellClear 0.6s ease ${(rowIndex + columnIndex) * 40}ms both` : undefined
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
                      position: "relative",
                      animation: cleared ? `cellClear 0.6s ease ${(rowIndex + columnIndex) * 40}ms both` : undefined
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
          {cleared && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: theme === "dark" ? "rgba(36,36,36,0.88)" : "rgba(255,255,255,0.88)", borderRadius: "inherit", zIndex: 10, animation: "overlayFadeIn 0.5s ease 1s both" }}>
              <div style={{ color: problemFontColor, fontSize: "min(10vmin, 56px)", fontWeight: "bold", letterSpacing: "0.05em" }}>Clear!</div>
            </div>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "10px", marginTop: "10px" }}>
          <button onClick={() => setWriteMode(m => m === "normal" ? "candidate" : "normal")} style={btnStyle}>
            {writeMode === "normal" ? "Normal mode" : "Candidate mode"}
          </button>
          <button onClick={handleUndo} style={{ ...btnStyle, opacity: history.length === 0 ? 0.35 : 1 }}>
            Undo
          </button>
          <button onClick={handleReset} style={btnStyle}>
            Reset
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", paddingBottom: "20px", gap: "10px" }}>
          {Array.from({ length: 9 }).map((_, index) => (
            <button
              key={index + 1}
              onClick={() => {
                if (clickedCell.row === null || problem[clickedCell.row][clickedCell.col] !== 0) return
                const r = clickedCell.row, c = clickedCell.col
                const key = storageKey(difficulty, r, c)
                const val = values[r][c]
                const snap = {
                  values: values.map(row => [...row]),
                  marks: marked.map(row => row.map(arr => [...arr])),
                  dels: deleted.map(row => row.map(arr => [...arr]))
                }
                if (writeMode === "normal") {
                  setHistory(h => [...h, snap])
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
                    setHistory(h => [...h, snap])
                    const newDel = deleted.map(row => row.map(arr => [...arr]))
                    newDel[r][c][index] = !newDel[r][c][index]
                    setDeleted(newDel)
                    localStorage.setItem(deletedStorageKey(difficulty, r, c), JSON.stringify(newDel[r][c]))
                  } else {
                    setHistory(h => [...h, snap])
                    const next = marked.map(row => row.map(arr => [...arr]))
                    next[r][c][index] = next[r][c][index] === "" ? `${index + 1}` : ""
                    setMarked(next)
                    localStorage.setItem(key, JSON.stringify(next[r][c]))
                  }
                }
              }}
              style={btnStyle}>
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => {
              if (clickedCell.row === null || problem[clickedCell.row][clickedCell.col] !== 0) return
              const r = clickedCell.row, c = clickedCell.col
              const val = values[r][c]
              const snap = {
                values: values.map(row => [...row]),
                marks: marked.map(row => row.map(arr => [...arr])),
                dels: deleted.map(row => row.map(arr => [...arr]))
              }
              if (val !== "") {
                setHistory(h => [...h, snap])
                const next = values.map(row => [...row])
                next[r][c] = ""
                setValues(next)
                localStorage.setItem(storageKey(difficulty, r, c), "")
              } else {
                if (autoMode) {
                  setHistory(h => [...h, snap])
                  const newDel = deleted.map(row => row.map(arr => [...arr]))
                  newDel[r][c] = Array(9).fill(false)
                  setDeleted(newDel)
                  localStorage.setItem(deletedStorageKey(difficulty, r, c), JSON.stringify(newDel[r][c]))
                } else {
                  setHistory(h => [...h, snap])
                  const next = marked.map(row => row.map(arr => [...arr]))
                  next[r][c] = Array(9).fill("")
                  setMarked(next)
                  localStorage.setItem(storageKey(difficulty, r, c), "")
                }
              }
            }}
            style={btnStyle}>
            ⌫
          </button>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", paddingBottom: "20px", alignSelf: "flex-start" }}>
          <input type="checkbox" checked={autoMode} onChange={e => setAutoMode(e.target.checked)} style={{ display: "none" }} />
          <div style={{ width: "44px", height: "24px", borderRadius: "12px", background: autoMode ? problemFontColor : thinBorderColor, position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
            <div style={{ position: "absolute", top: "2px", left: autoMode ? "22px" : "2px", width: "20px", height: "20px", borderRadius: "50%", background: autoMode ? defaultBackground : problemFontColor, transition: "left 0.2s" }} />
          </div>
          <span style={{ color: problemFontColor, fontSize: "min(3.2vmin, 18px)", fontWeight: "bold" }}>Auto candidate</span>
        </label>
      </div>
    </div>
  )
}

export default App
