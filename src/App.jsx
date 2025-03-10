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
  const [hoveredCell, setHoveredCell] = useState({row: null, col: null, part: null});
  const [clickedCell, setClickedCell] = useState({row: null, col: null, part: null})
  const thickBorder = window.matchMedia('(prefers-color-scheme: dark)').matches ? "min(0.36vmin, 2px) solid rgb(219, 219, 219)" : "min(0.36vmin, 2px) solid rgb(36, 36, 36)"
  const thinBorder = window.matchMedia('(prefers-color-scheme: dark)').matches ? "min(0.36vmin, 2px) solid rgb(60, 60, 60)" : "min(0.36vmin, 2px) solid rgb(231, 231, 231)"
  const relatedBackground = window.matchMedia('(prefers-color-scheme: dark)').matches ? "rgb(84, 84, 84)" : "rgb(207, 207, 207)"
  const defaultBackground = window.matchMedia('(prefers-color-scheme: dark)').matches ? "rgb(36, 36, 36)" : "rgb(255, 255, 255)"
  const highlightBackground = window.matchMedia('(prefers-color-scheme: dark)').matches ? "rgb(37, 59, 99)" : "rgb(255, 223, 17)"
  const problemFontColor = window.matchMedia('(prefers-color-scheme: dark)').matches ? "rgb(219, 219, 219)" : "rgb(36, 36, 36)"
  const playerFontColor = window.matchMedia('(prefers-color-scheme: dark)').matches ? "rgb(219, 219, 120)" : "rgb(90, 90, 150)"

  var [values, setValues] = useState(problem.map((row) =>
    row.map((n) => (n === 0 ? "" : `${n}`))
  ))

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (clickedCell.row !== null) {
        if (problem[clickedCell.row][clickedCell.col] === 0){
          if (event.key >= "1" && event.key <= "9"){
            setValues((prevValues) => {
              const newValues = prevValues.map((row) => [...row]);
              newValues[clickedCell.row][clickedCell.col] = event.key;
              return newValues;
            });
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
  }, [clickedCell])

  return (
    <>
      <h1>Partition</h1>
      <div className="game_container" style={{width: "min(80vmin, 450px)", maxWidth: "100%", maxHeight: "100%", display: "grid"}}>
        <div className="grid_container" style={{aspectRatio: 1 / 1, display: "grid", gridTemplateRows: "repeat(9, 1fr)"}}>
          {partition.map((row, rowIndex) => (
            <div key={rowIndex} className="grid_row" style={{display: "grid", gridTemplateColumns: "repeat(9, 1fr)"}}>
              {row.map((_, columnIndex) => (
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
                      color: problem[rowIndex][columnIndex] === 0 ? playerFontColor : problemFontColor}}>
                  {values[rowIndex][columnIndex]}
                </div>
              ))}
            </div>
          ))}
          
        </div>
        <div style={{display: "grid", gridTemplateColumns: "repeat(5, 1fr)", paddingTop: "20px", paddingBottom: "20px", gap: "10px"}}>
          {Array.from({length: 9}).map((_, index) => (
            <button
              key={index + 1}
              onClick={() => {
                if (clickedCell.row !== null) {
                  if (problem[clickedCell.row][clickedCell.col] === 0) {
                    setValues((prevValues) => {
                      const newValues = prevValues.map((row) => [...row])
                      newValues[clickedCell.row][clickedCell.col] = `${index + 1}`
                      return newValues
                    })
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
