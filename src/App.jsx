import { useState } from 'react'
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
  return (
    <>
      <h1>Partition</h1>
      <div className="grid_container" style={{width: "450px", height: "450px", aspectRatio: 1 / 1, display: "grid", gridTemplateRows: "repeat(9, 1fr)", border: "2px solid black"}}>
        {partition.map((row, rowIndex) => (
          <div key={rowIndex} className="grid_row" style={{display: "grid", gridTemplateColumns: "repeat(9, 1fr)"}}>
            {row.map((cell, columnIndex) => (
              <div key={`${rowIndex}-${columnIndex}`} className="grid_cell"  onMouseEnter={() => setHoveredCell({ row: rowIndex, column: columnIndex, part: partition[rowIndex][columnIndex]})}  onMouseLeave={() => setHoveredCell(null)} style={{display: "flex", width: "100%", alignItems: "center", justifyContent: "center", boxSizing: "border-box", backgroundColor: (hoveredCell?.row === rowIndex || hoveredCell?.column === columnIndex || hoveredCell?.part === partition[rowIndex][columnIndex]) ? "rgba(0, 0, 0, 0.1)" : "white", borderLeft: (columnIndex === 0 || partition[rowIndex][columnIndex] !== partition[rowIndex][columnIndex - 1]) ? "2px solid rgba(0, 0, 0, 1)" : "2px solid rgba(0, 0, 0, 0.2)", borderRight: (columnIndex === 8 || partition[rowIndex][columnIndex] !== partition[rowIndex][columnIndex + 1]) ? "2px solid rgba(0, 0, 0, 1)" : "2px solid rgba(0, 0, 0, 0.2)", borderTop: (rowIndex === 0 || partition[rowIndex][columnIndex] !== partition[rowIndex - 1][columnIndex]) ? "2px solid rgba(0, 0, 0, 1)" : "2px solid rgba(0, 0, 0, 0.2)", borderBottom: (rowIndex === 8 || partition[rowIndex][columnIndex] !== partition[rowIndex + 1][columnIndex]) ? "2px solid rgba(0, 0, 0, 1)" : "2px solid rgba(0, 0, 0, 0.2)"}}>
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}

export default App
