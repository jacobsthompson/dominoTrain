import DailyDominos from "./DailyDominos/javascripts/DailyDominos";
import { Analytics } from "@vercel/analytics/next"

function App() {
    return(
        <div className="app" style={{backgroundColor: '#191919'}}>
            <DailyDominos/>
            <Analytics/>
        </div>
    );
}

export default App;
