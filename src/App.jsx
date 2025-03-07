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
  const [hoveredCell, setHoveredCell] = useState({ row: null, col: null, part: null });

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
      if (hoveredCell !== null) {
        if (event.key >= "1" && event.key <= "9"){
          console.log(event.key)
          setValues((prevValues) => {
            const newValues = prevValues.map((row) => [...row]);
            newValues[hoveredCell.row][hoveredCell.col] = event.key;
            return newValues;
          });
        }
        else {
          if (event.key === "Backspace" || event.key === "Delete") {
            setValues((prevValues) => {
              const newValues = prevValues.map((row) => [...row]);
              newValues[hoveredCell.row][hoveredCell.col] = "";
              return newValues;
            });
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hoveredCell])

  return (
    <>
      <h1>Partition</h1>
      <div className="grid_container" style={{width: "450px", height: "450px", aspectRatio: 1 / 1, display: "grid", gridTemplateRows: "repeat(9, 1fr)", border: "2px solid black"}}>
        {partition.map((row, rowIndex) => (
          <div key={rowIndex} className="grid_row" style={{display: "grid", gridTemplateColumns: "repeat(9, 1fr)"}}>
            {row.map((_, columnIndex) => (
              <div 
                  key={`${rowIndex}-${columnIndex}`}
                  className="grid_cell"
                  onMouseEnter={() => setHoveredCell({ row: rowIndex, col: columnIndex, part: partition[rowIndex][columnIndex]})}
                  onMouseLeave={() => setHoveredCell(null)}
                  style={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    boxSizing: "border-box",
                    backgroundColor: (hoveredCell?.row === rowIndex || hoveredCell?.col === columnIndex || hoveredCell?.part === partition[rowIndex][columnIndex]) ? "rgba(0, 0, 0, 0.1)" : "white",
                    borderLeft: (columnIndex === 0 || partition[rowIndex][columnIndex] !== partition[rowIndex][columnIndex - 1]) ? "2px solid rgba(0, 0, 0, 1)" : "2px solid rgba(0, 0, 0, 0.2)",
                    borderRight: (columnIndex === 8 || partition[rowIndex][columnIndex] !== partition[rowIndex][columnIndex + 1]) ? "2px solid rgba(0, 0, 0, 1)" : "2px solid rgba(0, 0, 0, 0.2)", 
                    borderTop: (rowIndex === 0 || partition[rowIndex][columnIndex] !== partition[rowIndex - 1][columnIndex]) ? "2px solid rgba(0, 0, 0, 1)" : "2px solid rgba(0, 0, 0, 0.2)",
                    borderBottom: (rowIndex === 8 || partition[rowIndex][columnIndex] !== partition[rowIndex + 1][columnIndex]) ? "2px solid rgba(0, 0, 0, 1)" : "2px solid rgba(0, 0, 0, 0.2)"}}>
                {values[rowIndex][columnIndex]}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}

export default App
