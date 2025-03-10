import { useState, useEffect } from 'react'
import './App.css'

const partition = [
  [0, 0, 0, 0, 1, 1, 1, 1, 1],
  [0, 2, 0, 2, 2, 2, 3, 3, 1],
  [0, 2, 2, 2, 4, 2, 3, 1, 1],
  [0, 5, 5, 5, 4, 2, 3, 3, 1],
  [0, 5, 4, 4, 4, 4, 4, 3, 6],
  [7, 5, 5, 8, 4, 3, 3, 3, 6],
  [7, 7, 5, 8, 4, 8, 8, 8, 6],
  [7, 5, 5, 8, 8, 8, 6, 8, 6],
  [7, 7, 7, 7, 7, 6, 6, 6, 6]]

const problem = [
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

function App() {
  var [theme, setTheme] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light")

  const [hoveredCell, setHoveredCell] = useState({row: null, col: null, part: null});
  const [clickedCell, setClickedCell] = useState({row: null, col: null, part: null})
  const outlineBorder = theme === "dark" ? "min(0.71vmin, 4px) solid rgb(219, 219, 219)" : "min(0.71vmin, 4px) solid rgb(36, 36, 36)"
  const thickBorder = theme === "dark" ? "min(0.36vmin, 2px) solid rgb(219, 219, 219)" : "min(0.36vmin, 2px) solid rgb(36, 36, 36)"
  const thinBorder = theme === "dark" ? "min(0.36vmin, 2px) solid rgb(60, 60, 60)" : "min(0.36vmin, 2px) solid rgb(231, 231, 231)"
  const relatedBackground = theme === "dark" ? "rgb(84, 84, 84)" : "rgb(207, 207, 207)"
  const defaultBackground = theme === "dark" ? "rgb(36, 36, 36)" : "rgb(255, 255, 255)"
  document.documentElement.style.backgroundColor = defaultBackground
  const highlightBackground = theme === "dark" ? "rgb(37, 59, 99)" : "rgb(255, 223, 17)"
  const problemFontColor = theme === "dark" ? "rgb(219, 219, 219)" : "rgb(36, 36, 36)"
  const playerFontColor = theme === "dark" ? "rgb(219, 219, 120)" : "rgb(90, 90, 150)"

  var [values, setValues] = useState(problem.map((row) =>
    row.map((n) => (n === 0 ? "" : `${n}`))
  ))
  var [writeMode, setWriteMode] = useState("normal")

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (clickedCell.row !== null) {
        if (problem[clickedCell.row][clickedCell.col] === 0){
          if (event.key >= "1" && event.key <= "9"){
            if (writeMode === "normal") {
              setValues((prevValues) => {
                const newValues = prevValues.map((row) => [...row]);
                newValues[clickedCell.row][clickedCell.col] = event.key;
                return newValues;
              });
            }
            else {
              if (Array.isArray(values[clickedCell.row][clickedCell.col])) {
                if (values[clickedCell.row][clickedCell.col][parseInt(event.key, 10) - 1] === "") {
                  values[clickedCell.row][clickedCell.col][parseInt(event.key, 10) - 1] = event.key
                }
                else {
                  values[clickedCell.row][clickedCell.col][parseInt(event.key, 10) - 1] = ""
                }
              }
              else {
                if (values[clickedCell.row][clickedCell.col] === "") {
                  values[clickedCell.row][clickedCell.col] = Array(9).fill("")
                  values[clickedCell.row][clickedCell.col][parseInt(event.key, 10) - 1] = event.key
                }
              }
            }
          }
          else {
            if (event.key === "Backspace" || event.key === "Delete") {
              setValues((prevValues) => {
                const newValues = prevValues.map((row) => [...row]);
                newValues[clickedCell.row][clickedCell.col] = "";
                return newValues;
              });
            }
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clickedCell, writeMode, values])

  return (
    <>
      <h1 style={{color: problemFontColor}}>Fractured Sudoku</h1>
      <div className="game_container" style={{width: "min(80vmin, 450px)", maxWidth: "100%", maxHeight: "100%", display: "grid"}}>
        <div className="grid_container" style={{aspectRatio: 1 / 1, display: "grid", gridTemplateRows: "repeat(9, 1fr)", border: outlineBorder, transition: "0.25s"}}>
          {partition.map((row, rowIndex) => (
            <div key={rowIndex} className="grid_row" style={{display: "grid", gridTemplateColumns: "repeat(9, 1fr)"}}>
              {row.map((_, columnIndex) => (
                Array.isArray(values[rowIndex][columnIndex]) ? 
                <div 
                  key={`${rowIndex}-${columnIndex}`}
                  className="grid_cell"
                  onMouseEnter={() => setHoveredCell({row: rowIndex, col: columnIndex, part: partition[rowIndex][columnIndex]})}
                  onMouseLeave={() => setHoveredCell(null)}
                  onMouseDown={() => setClickedCell({row: rowIndex, col: columnIndex, part: partition[rowIndex][columnIndex]})}
                  style={{
                    width: "100%",
                    display: "grid",
                    gridTemplateRows: "repeat(3, 1fr)",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    boxSizing: "border-box",
                    backgroundColor: (clickedCell?.row === rowIndex && clickedCell.col === columnIndex) ? highlightBackground : ((hoveredCell?.row === rowIndex || hoveredCell?.col === columnIndex || hoveredCell?.part === partition[rowIndex][columnIndex]) ? relatedBackground : defaultBackground),
                    borderLeft: (columnIndex === 0 || partition[rowIndex][columnIndex] !== partition[rowIndex][columnIndex - 1]) ? thickBorder : thinBorder,
                    borderRight: (columnIndex === 8 || partition[rowIndex][columnIndex] !== partition[rowIndex][columnIndex + 1]) ? thickBorder : thinBorder,
                    borderTop: (rowIndex === 0 || partition[rowIndex][columnIndex] !== partition[rowIndex - 1][columnIndex]) ? thickBorder : thinBorder,
                    borderBottom: (rowIndex === 8 || partition[rowIndex][columnIndex] !== partition[rowIndex + 1][columnIndex]) ? thickBorder : thinBorder,
                    transition: "0.25s"}}>
                  {values[rowIndex][columnIndex].map((value, index) => (
                    <div 
                      key={`${rowIndex}-${columnIndex}-${index}`}
                      className="grid_subcell"
                      style={{
                        display: "flex",
                        width: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                        boxSizing: "border-box",
                        fontSize: "min(1.42vmin, 8px)",
                        fontWeight: "normal",
                        color: playerFontColor,
                        transition: "0.25s"}}>
                      {value}
                    </div>
                  ))}
                </div> : 
                <div 
                    key={`${rowIndex}-${columnIndex}`}
                    className="grid_cell"
                    onMouseEnter={() => setHoveredCell({row: rowIndex, col: columnIndex, part: partition[rowIndex][columnIndex]})}
                    onMouseLeave={() => setHoveredCell(null)}
                    onMouseDown={() => setClickedCell({row: rowIndex, col: columnIndex, part: partition[rowIndex][columnIndex]})}
                    style={{
                      display: "flex",
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      boxSizing: "border-box",  
                      backgroundColor: (clickedCell?.row === rowIndex && clickedCell.col === columnIndex) ? highlightBackground : ((hoveredCell?.row === rowIndex || hoveredCell?.col === columnIndex || hoveredCell?.part === partition[rowIndex][columnIndex]) ? relatedBackground : defaultBackground),
                      borderLeft: (columnIndex === 0 || partition[rowIndex][columnIndex] !== partition[rowIndex][columnIndex - 1]) ? thickBorder : thinBorder,
                      borderRight: (columnIndex === 8 || partition[rowIndex][columnIndex] !== partition[rowIndex][columnIndex + 1]) ? thickBorder : thinBorder,
                      borderTop: (rowIndex === 0 || partition[rowIndex][columnIndex] !== partition[rowIndex - 1][columnIndex]) ? thickBorder : thinBorder,
                      borderBottom: (rowIndex === 8 || partition[rowIndex][columnIndex] !== partition[rowIndex + 1][columnIndex]) ? thickBorder : thinBorder,
                      fontSize: "min(4.27vmin, 24px)",
                      fontWeight: "bold",
                      color: problem[rowIndex][columnIndex] === 0 ? playerFontColor : problemFontColor,
                      transition: "0.25s"}}>
                  {values[rowIndex][columnIndex]}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{display: "grid", gridTemplateColumns: "2fr 1fr", paddingTop: "20px", gap: "10px"}}>
          <button onClick={() => {writeMode === "normal" ? setWriteMode("candidate") : setWriteMode("normal")}} style={{padding: "12px", color: problemFontColor, fontSize: "min(3.2vmin, 18px)", fontWeight: "bold", border: thinBorder, background: defaultBackground}}>
          {writeMode === "normal" ? "Candidate Mode" : "Normal Mode"}
          </button>
          <button onClick={() => {theme === "light" ? setTheme("dark") : setTheme("light")}} style={{padding: "12px", color: problemFontColor, fontSize: "min(3.2vmin, 18px)", fontWeight: "bold", border: thinBorder, background: defaultBackground}}>
            {theme === "light" ? "Dark" : "Light"}
          </button>
        </div>
        <div style={{display: "grid", gridTemplateColumns: "repeat(5, 1fr)", paddingTop: "20px", paddingBottom: "20px", gap: "10px"}}>
          {Array.from({length: 9}).map((_, index) => (
            <button
              key={index + 1}
              onClick={() => {
                if (clickedCell.row !== null) {
                  if (problem[clickedCell.row][clickedCell.col] === 0) {
                    if (writeMode === "normal") {
                      setValues((prevValues) => {
                        const newValues = prevValues.map((row) => [...row]);
                        newValues[clickedCell.row][clickedCell.col] = `${index + 1}`;
                        return newValues;
                      });
                    }
                    else {
                      if (Array.isArray(values[clickedCell.row][clickedCell.col])) {
                        if (values[clickedCell.row][clickedCell.col][index] === "") {
                          values[clickedCell.row][clickedCell.col][index] = `${index + 1}`
                        }
                        else {
                          values[clickedCell.row][clickedCell.col][index] = ""
                        }
                      }
                      else {
                        if (values[clickedCell.row][clickedCell.col] === "") {
                          values[clickedCell.row][clickedCell.col] = Array(9).fill("")
                          values[clickedCell.row][clickedCell.col][index] = `${index + 1}`
                        }
                      }
                    }
                  }
                }}}
              style={{padding: "12px", color: playerFontColor, fontSize: "min(3.2vmin, 18px)", fontWeight: "bold", border: thinBorder, background: defaultBackground}}>
              {index + 1}
            </button>
          ))}
          <button
            key="delete"
            onClick={() => {
              if (clickedCell.row !== null) {
                if (problem[clickedCell.row][clickedCell.col] === 0) {
                  setValues((prevValues) => {
                    const newValues = prevValues.map((row) => [...row])
                    newValues[clickedCell.row][clickedCell.col] = ""
                    return newValues
                  })
                }
              }}}
            style={{padding: "12px", color: playerFontColor, fontSize: "min(3.2vmin, 18px)", fontWeight: "bold", border: thinBorder, background: defaultBackground}}>
            ⌫
          </button>
        </div>
      </div>
    </>
  )
}

export default App
