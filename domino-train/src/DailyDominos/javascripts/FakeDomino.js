import DominoPips from "./DominoPips";
import '../stylesheets/domino.css';

function FakeDomino({CELL_SIZE, value1, value2, rotation, color, topTile= false}){
    const getRotationValues = (rot) => {
        switch(rot){
            case 0:
                return{
                    orientation: 'v',
                    topvalue: value1,
                    botvalue: value2
                };
            case 90:
                return{
                    orientation: 'h',
                    topvalue: value2,
                    botvalue: value1
                };
            case 180:
                return{
                    orientation: 'v',
                    topvalue: value2,
                    botvalue: value1
                };
            case 270:
                return{
                    orientation: 'h',
                    topvalue: value1,
                    botvalue: value2
                };
            default:
                return{
                    orientation: 'h',
                    topvalue: value1,
                    botvalue: value2
                };
        }
    }

    const {orientation, topvalue, botvalue} = getRotationValues(rotation);
    const isVertical = orientation === 'v';
    const width = isVertical ? CELL_SIZE : CELL_SIZE * 2;
    const height = isVertical ? CELL_SIZE*2 : CELL_SIZE;

    return (
        <div className="tutorial-domino-wrapper" style={{width: isVertical ? '50%' : '100%'}}>
            <div
                className="domino"
                style={{
                    width: width,
                    height: height,
                    left: 0,
                    top: 0,
                    backgroundColor: '#f8f8ff',
                    zIndex: 1000,
                    flexDirection: isVertical ? 'column' : 'row',
                    touchAction: 'none',
                    transform: 'scale(0.6)',
                    transformOrigin: 'top left'
                }}
            >
                <div
                    className="domino-half top-half-domino"
                    style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        borderRadius: isVertical ? '0.5rem 0.5rem 0 0': '0.5rem 0 0 0.5rem',
                        borderStyle: isVertical ? "none" : topTile ? 'none' : "none none solid none",
                        borderColor: "#ccc"
                    }}
                >
                    <DominoPips CELL_SIZE={CELL_SIZE} value={topvalue} color={color} inHolder={false}/>
                </div>
                <div className="domino-divider" style={{width: isVertical ?  '100%' : '0.15rem', height: isVertical ? '0.15rem' : '100%'}}/>
                <div
                    className="domino-half bot-half-domino"
                    style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        borderRadius: isVertical ? ' 0 0 0.5rem 0.5rem': '0 0.5rem 0.5rem 0',
                        borderStyle: topTile ? 'none' : 'none none solid none',
                        borderColor: "#ccc"
                    }}>
                     <DominoPips CELL_SIZE={CELL_SIZE} value={botvalue} color={color} inHolder={false}/>
                </div>
            </div>
        </div>
    );
}

export default FakeDomino;