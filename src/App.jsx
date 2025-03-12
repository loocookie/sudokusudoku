import { useState, useEffect, useCallback } from 'react'
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
  const outlineBorder = theme === "dark" ? "min(1.07vmin, 6px) solid rgb(219, 219, 219)" : "min(1.07vmin, 6px) solid rgb(36, 36, 36)"
  const thickBorder = theme === "dark" ? "min(0.36vmin, 2px) solid rgb(219, 219, 219)" : "min(0.36vmin, 2px) solid rgb(36, 36, 36)"
  const thinBorder = theme === "dark" ? "min(0.36vmin, 2px) solid rgb(60, 60, 60)" : "min(0.36vmin, 2px) solid rgb(231, 231, 231)"
  const relatedBackground = theme === "dark" ? "rgb(84, 84, 84)" : "rgb(207, 207, 207)"
  const defaultBackground = theme === "dark" ? "rgb(36, 36, 36)" : "rgb(255, 255, 255)"
  document.documentElement.style.backgroundColor = defaultBackground
  const highlightBackground = theme === "dark" ? "rgb(37, 59, 99)" : "rgb(255, 223, 17)"
  const problemFontColor = theme === "dark" ? "rgb(219, 219, 219)" : "rgb(36, 36, 36)"
  const playerFontColor = theme === "dark" ? "rgb(219, 219, 120)" : "rgb(90, 90, 150)"
  
  if (!localStorage.getItem("0,0")) {
    problem.map((row, i) => (
      row.map((n, j) => (
        localStorage.setItem(`${i},${j}`, n === 0 ? "" : `${n}`)
      ))
    ))
  }
  
  var [values, setValues] = useState(
    [...Array(9)].map((_, i) => (
      [...Array(9)].map((_, j) => (
        localStorage.getItem(`${i},${j}`)[0] === "[" ? JSON.parse(localStorage.getItem(`${i},${j}`)) : localStorage.getItem(`${i},${j}`)
      ))
    )))

  var [writeMode, setWriteMode] = useState("normal")

  const collide = (() => {
    let collideList = [];
    
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (!Array.isArray(values[i][j]) && values[i][j] !== "") {
          for (let x = i; x < 9; x++) {
            for (let y = 0; y < 9; y++) {
              if ((i !== x || j !== y) && !Array.isArray(values[x][y]) && (i === x || j === y || partition[i][j] === partition[x][y]) && values[i][j] === values[x][y]) {
                if (!collideList.some(([r, c]) => r === i && c === j)) {
                  collideList.push([i, j]);
                }
                if (!collideList.some(([r, c]) => r === x && c === y)) {
                  collideList.push([x, y]);
                }
              }
            }
          }
        }
      }
    }
  
    return collideList;
  })();
  

  const handleKeyDown = useCallback((event) => {
    if (clickedCell.row !== null && problem[clickedCell.row][clickedCell.col] === 0) {
      const newValues = [...values]; // 얕은 복사로 불필요한 깊은 복사 방지
      const cellValue = newValues[clickedCell.row][clickedCell.col];
  
      if (event.key >= "1" && event.key <= "9") {
        if (writeMode === "normal") {
          newValues[clickedCell.row][clickedCell.col] = event.key;
          localStorage.setItem(`${clickedCell.row},${clickedCell.col}`, event.key)
        } else {
          if (!Array.isArray(cellValue)) {
            if (cellValue === "") {
              newValues[clickedCell.row][clickedCell.col] = Array(9).fill("");
              newValues[clickedCell.row][clickedCell.col][parseInt(event.key, 10) - 1] = newValues[clickedCell.row][clickedCell.col][parseInt(event.key, 10) - 1] === "" ? event.key : "";
            }
          }
          else {
            newValues[clickedCell.row][clickedCell.col][parseInt(event.key, 10) - 1] = newValues[clickedCell.row][clickedCell.col][parseInt(event.key, 10) - 1] === "" ? event.key : "";
          }
          localStorage.setItem(`${clickedCell.row},${clickedCell.col}`, JSON.stringify(newValues[clickedCell.row][clickedCell.col]))
        }
        setValues(newValues);
      } else if (event.key === "Backspace" || event.key === "Delete") {
        newValues[clickedCell.row][clickedCell.col] = "";
        localStorage.setItem(`${clickedCell.row},${clickedCell.col}`, "")
        setValues(newValues);
      }
    }
  }, [clickedCell, writeMode, values]);
  
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <h1 style={{color: problemFontColor}}>Fractured Sudoku</h1>
      <div className="game_container" style={{width: "min(80vmin, 450px)", maxWidth: "100%", maxHeight: "100%", display: "grid"}}>
        <div className="grid_container" style={{aspectRatio: 1 / 1, display: "grid", gridTemplateRows: "repeat(9, 1fr)", border: outlineBorder, transition: "0.25s", borderRadius: "min(3.2vmin, 18px)", overflow: "hidden"}}>
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
                    color: problem[rowIndex][columnIndex] === 0 ? playerFontColor : problemFontColor,
                    backgroundColor: (clickedCell?.row === rowIndex && clickedCell.col === columnIndex) ? highlightBackground : ((hoveredCell?.row === rowIndex || hoveredCell?.col === columnIndex || hoveredCell?.part === partition[rowIndex][columnIndex]) ? relatedBackground : defaultBackground),
                    borderLeft: columnIndex === 0 ? "none" : (partition[rowIndex][columnIndex] !== partition[rowIndex][columnIndex - 1]) ? thickBorder : thinBorder,
                    borderRight: columnIndex === 8 ? "none" : (partition[rowIndex][columnIndex] !== partition[rowIndex][columnIndex + 1]) ? thickBorder : thinBorder,
                    borderTop: rowIndex === 0 ? "none" : (partition[rowIndex][columnIndex] !== partition[rowIndex - 1][columnIndex]) ? thickBorder : thinBorder,
                    borderBottom: rowIndex === 8 ? "none" : (partition[rowIndex][columnIndex] !== partition[rowIndex + 1][columnIndex]) ? thickBorder : thinBorder,
                    transition: "0.25s",
                    position: "relative"}}>
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
                        fontSize: "min(1.78vmin, 10px)",
                        fontWeight: "bold",
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
                      borderLeft: columnIndex === 0 ? "none" : (partition[rowIndex][columnIndex] !== partition[rowIndex][columnIndex - 1]) ? thickBorder : thinBorder,
                      borderRight: columnIndex === 8 ? "none" : (partition[rowIndex][columnIndex] !== partition[rowIndex][columnIndex + 1]) ? thickBorder : thinBorder,
                      borderTop: rowIndex === 0 ? "none" : (partition[rowIndex][columnIndex] !== partition[rowIndex - 1][columnIndex]) ? thickBorder : thinBorder,
                      borderBottom: rowIndex === 8 ? "none" : (partition[rowIndex][columnIndex] !== partition[rowIndex + 1][columnIndex]) ? thickBorder : thinBorder,
                      fontSize: "min(4.27vmin, 24px)",
                      fontWeight: "bold",
                      color: problem[rowIndex][columnIndex] === 0 ? playerFontColor : problemFontColor,
                      transition: "background-color 0.25s, color 0.25s, border-color 0.25s",
                      position: "relative"}}>
                  {values[rowIndex][columnIndex]}
                  {collide.some(([r, c]) => r === rowIndex && c === columnIndex) && (
                    <span style={{
                      position: "absolute", 
                      top: "min(0.53vmin, 3px)", 
                      right: "min(0.53vmin, 3px)", 
                      width: "min(0.89vmin, 5px)", 
                      height: "min(0.89vmin, 5px)",
                      backgroundColor: "red", 
                      borderRadius: "50%"
                    }}></span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{display: "grid", gridTemplateColumns: "2fr 1fr", paddingTop: "20px", gap: "10px"}}>
          <button onClick={() => {writeMode === "normal" ? setWriteMode("candidate") : setWriteMode("normal")}} style={{padding: "12px", color: problemFontColor, fontSize: "min(3.2vmin, 18px)", fontWeight: "bold", border: thinBorder, background: defaultBackground}}>
          {writeMode === "normal" ? "Normal Mode" : "Candidate Mode"}
          </button>
          <button onClick={() => {theme === "light" ? setTheme("dark") : setTheme("light")}} style={{padding: "12px", color: problemFontColor, fontSize: "min(3.2vmin, 18px)", fontWeight: "bold", border: thinBorder, background: defaultBackground}}>
            {theme === "light" ? "Light" : "Dark"}
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
                      localStorage.setItem(`${clickedCell.row},${clickedCell.col}`, `${index + 1}`)
                    }
                    else {
                      if (Array.isArray(values[clickedCell.row][clickedCell.col])) {
                        if (values[clickedCell.row][clickedCell.col][index] === "") {
                          setValues((prevValues) => {
                            const newValues = prevValues.map((row) => [...row]);
                            newValues[clickedCell.row][clickedCell.col][index] = `${index + 1}`;
                            localStorage.setItem(`${clickedCell.row},${clickedCell.col}`, JSON.stringify(newValues[clickedCell.row][clickedCell.col]))
                            return newValues;
                          });
                        }
                        else {
                          setValues((prevValues) => {
                            const newValues = prevValues.map((row) => [...row]);
                            newValues[clickedCell.row][clickedCell.col][index] = "";
                            localStorage.setItem(`${clickedCell.row},${clickedCell.col}`, JSON.stringify(newValues[clickedCell.row][clickedCell.col]))
                            return newValues;
                          });
                        }
                      }
                      else {
                        if (values[clickedCell.row][clickedCell.col] === "") {
                          setValues((prevValues) => {
                            const newValues = prevValues.map((row) => [...row]);
                            newValues[clickedCell.row][clickedCell.col] = Array(9).fill("");
                            newValues[clickedCell.row][clickedCell.col][index] = `${index + 1}`
                            localStorage.setItem(`${clickedCell.row},${clickedCell.col}`, JSON.stringify(newValues[clickedCell.row][clickedCell.col]))
                            return newValues;
                          });
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
                  localStorage.setItem(`${clickedCell.row},${clickedCell.col}`, "")
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
