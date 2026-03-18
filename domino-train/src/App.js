import DailyDominos from "./DailyDominos/javascripts/DailyDominos";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

function App() {
    return(
        <div className="app" style={{backgroundColor: '#191919'}}>
            <DailyDominos/>
            <Analytics />
            <SpeedInsights />
        </div>
    );
}

export default App;
