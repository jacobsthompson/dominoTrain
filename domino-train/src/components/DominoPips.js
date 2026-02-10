import './pips.css'

function DominoPips({ value, color, inHolder }){
    const renderPips = () => {
        const pipLocations = {
            1: ['center'],
            2: ['top-left', 'bottom-right'],
            3: ['top-left', 'center', 'bottom-right'],
            4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
            5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
            6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right']
        };

        const positions = pipLocations[value] || [];

        return positions.map((pos, index) =>(
            <div
                key={index}
                className={`pip pip-${pos}`}
                style={{
                    backgroundColor: color,
                    width: inHolder ? '7px' : '8px',
                    height: inHolder ? '7px' : '8px',
                }}
            />
        ));
    };

    return (
        <div className="domino-pip-container">
            {renderPips()}
        </div>
    );
}

export default DominoPips;