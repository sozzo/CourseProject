import HistoryItem from "./HistoryItem";
import React, {useEffect, useState} from "react";

const ClosedTabsList = function (props) {
    const [closedTabsByDate, setClosedTabsByDate] = useState(
        closedTabs.groupedByDate
    );

    useEffect(async () => {
        await closedTabs.init();
        setClosedTabsByDate(closedTabs.groupedByDate);
    }, []);

  const removeTabFromLastClosed = async (url) => {
    await closedTabs.removeByUrl(url);
    setClosedTabsByDate(closedTabs.groupedByDate);
    chrome.runtime.sendMessage({
      action: "reload-closed-tabs",
      url: url,
    });
  };

  return (
    <>
      <div className="Subheader">
          Recently closed tabs
      </div>
      <div className="History-body">
      {closedTabsByDate.size > 0 ?
        Array.from(closedTabsByDate).map((val) => {
          const date = val[0];
          const tabs = val[1];
          return (
            <div className="History-by-date" key={date}>
              <div className="History-date">
                {date}
              </div>
              {tabs.map((tab, i) => (
                <HistoryItem
                  key={i}
                  tab={tab}
                  removeTabFromLastClosed={() => removeTabFromLastClosed(tab.url)}
                />
              ))}
            </div>
          );
      }) : <div className="History-empty">
            No closed tabs yet.
        </div>}
      </div>
    </>
  );
};

export default ClosedTabsList;