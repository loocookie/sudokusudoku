import { useState, useEffect } from 'react'
import './App.css'

const partition = [
 [1, 1, 1, 1, 1, 1, 1, 1, 0],
 [3, 3, 3, 2, 2, 2, 2, 1, 0],
 [3, 4, 2, 2, 0, 0, 0, 0, 0],
 [3, 4, 2, 8, 8, 8, 8, 8, 0],
 [3, 4, 2, 8, 7, 8, 8, 8, 0],
 [3, 4, 2, 7, 7, 7, 7, 7, 7],
 [3, 4, 7, 7, 5, 5, 5, 5, 5],
 [3, 4, 6, 6, 6, 5, 6, 5, 5],
 [4, 4, 4, 6, 6, 6, 6, 6, 5]
]

function App() {
  const [hoveredCell, setHoveredCell] = useState({row: null, col: null, part: null});
  const [clickedCell, setClickedCell] = useState({row: null, col: null, part: null})

  var [values, setValues] = useState([
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""]
  ])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (clickedCell !== null) {
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

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clickedCell])

  return (
    <>
      <h1>Partition</h1>
      <div className="game_container" style={{width: "min(80vmin, 450px)", maxWidth: "100%", maxHeight: "100%", display: "grid"}}>
        <div className="grid_container" style={{aspectRatio: 1 / 1, display: "grid", gridTemplateRows: "repeat(9, 1fr)", border: "4px solid black"}}>
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
                      backgroundColor: (clickedCell?.row === rowIndex && clickedCell.col === columnIndex) ? "rgb(255, 223, 17)" : ((hoveredCell?.row === rowIndex || hoveredCell?.col === columnIndex || hoveredCell?.part === partition[rowIndex][columnIndex]) ? "rgba(0, 0, 0, 0.1)" : "white"),
                      borderLeft: (columnIndex === 0 || partition[rowIndex][columnIndex] !== partition[rowIndex][columnIndex - 1]) ? "1px solid rgba(0, 0, 0, 1)" : "1px solid rgba(0, 0, 0, 0.2)",
                      borderRight: (columnIndex === 8 || partition[rowIndex][columnIndex] !== partition[rowIndex][columnIndex + 1]) ? "1px solid rgba(0, 0, 0, 1)" : "1px solid rgba(0, 0, 0, 0.2)", 
                      borderTop: (rowIndex === 0 || partition[rowIndex][columnIndex] !== partition[rowIndex - 1][columnIndex]) ? "1px solid rgba(0, 0, 0, 1)" : "1px solid rgba(0, 0, 0, 0.2)",
                      borderBottom: (rowIndex === 8 || partition[rowIndex][columnIndex] !== partition[rowIndex + 1][columnIndex]) ? "1px solid rgba(0, 0, 0, 1)" : "1px solid rgba(0, 0, 0, 0.2)"}}>
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
                  setValues((prevValues) => {
                    const newValues = prevValues.map((row) => [...row])
                    newValues[clickedCell.row][clickedCell.col] = `${index + 1}`
                    return newValues
                  })
                }}}
              style={{padding: "15px", fontSize: "16px", border: "1px solid gray"}}>
              {index + 1}
            </button>
          ))}
          <button
            key="delete"
            onClick={() => {
              if (clickedCell.row !== null) {
                setValues((prevValues) => {
                  const newValues = prevValues.map((row) => [...row])
                  newValues[clickedCell.row][clickedCell.col] = ""
                  return newValues
                })
              }}}
            style={{padding: "15px", fontSize: "16px", border: "1px solid gray"}}>
            ⌫
          </button>
        </div>
      </div>
    </>
  )
}

export default App
