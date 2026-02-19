import icon from "../assets/DominoTrainIcon.svg";
import statsIcon from "../assets/StatsIcon.svg";
import howToIcon from "../assets/HowToIcon.svg";
import moreIcon from "../assets/MoreIcon.svg";
import './header.css'

export default function Header({howToPlayModal, statsModal}){
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const date = new Date();

        return(
            <div className="header-container">
                <div className="header">
                    <div className="section left">
                        <img src={moreIcon} className="header-icon left" alt="<-"/>
                        <div className="header-text left"  style={{cursor: 'pointer'}}>More Projects</div>
                    </div>
                    <div className="section center">
                        <div className="header-text title">Daily Dominos</div>
                        <div className="modal-subtext">{months[date.getMonth()]} {date.getDate()}, {date.getFullYear()}</div>
                    </div>
                    <div className="section right">
                        <img src={howToIcon} className="header-icon right" onClick={howToPlayModal} alt="?"/>
                        <img src={statsIcon} className="header-icon right" onClick={statsModal} alt="[]"/>
                    </div>
                </div>
            </div>
        );
}