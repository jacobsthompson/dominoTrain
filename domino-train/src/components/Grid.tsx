import Cell from "./Cell";
import {Grid as GridType} from "../game/types";

export default function Grid({grid}: {grid: GridType}){
    return(
        <div className="grid">
            {grid.map((row,x) =>
                row.map((_,y) => <Cell key={`${y}-${x}`}/>)
            )}
        </div>
    );
}