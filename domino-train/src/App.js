import {useState} from "react";
import Domino from "./components/Domino";
import Board from "./components/Board";
import {GRID_SIZE, CELL_SIZE} from "./components/constants";
import './App.css';

function App() {
    const [grid, setGrid] = useState(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));

    const handlePlacement = (dominoId, dominoValue, gridX, gridY) => {
        const newGrid = grid.map(row => [...row]);
        newGrid[gridY][gridX] = {id: dominoId, value: dominoValue};
        setGrid(newGrid);
    };

    return (
      <div className="App" style={{padding: 20}}>
          <h2>Domino Train</h2>
          <div style={{marginTop: 40}}>
            <Board grid={grid}/>
          </div>
          <div style={{position: 'relative', height: '50px', marginTop: -50}}>
              <Domino id={1} value={5} onPlacement={handlePlacement}/>
          </div>
      </div>
      );
    }

  export default App;
