import React from "react";
import "./HistoryItem.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faGlobeAmericas, faTimes} from '@fortawesome/free-solid-svg-icons';


function HistoryItem({ tab, removeTabFromLastClosed }) {
  return (
    <div className="ItemContainer">
      <div className="TimeContainer">
          {" "}
          {tab.time}{" "}
      </div>

      <div className="LogoContainer" style={{backgroundImage: `url(${tab.faviconUrl})`}}>
        {!tab.faviconUrl && <FontAwesomeIcon size={"1x"} icon={faGlobeAmericas} />}
      </div>

      <div className="TitleContainer">
        <a
          href={tab.url}
          target="_blank"
          onClick={removeTabFromLastClosed}
          title={tab.title}
        >
          {" "}
          {tab.title}{" "}
        </a>
      </div>
      <FontAwesomeIcon className={"RemoveLastClosedTabIcon"} style={{cursor: 'pointer', width: '0.5rem'}} icon={faTimes} onClick={removeTabFromLastClosed} />
    </div>
  );
}

export default HistoryItem;
