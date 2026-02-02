type CellProps = {
    row: number;
    col: number;
}

export default function Cell({row, col}:CellProps) {
    return (
        <div
            className="cell"
            data-row={row}
            data-col={col}
        />
    );
}