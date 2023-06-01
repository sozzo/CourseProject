import React, {useState} from "react";
import "./Popup.css";
import {ActionIcon, MantineProvider} from "@mantine/core";
import ClosedTabsList from "./ClosedTabsList";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCog} from "@fortawesome/free-solid-svg-icons";
import Settings from "./Settings";
import CloseCurrent from "./CloseCurrent";
import mantineTheme from "./mantineTheme";


const Popup = (props) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSettingsClick = async () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  return (
    <MantineProvider theme={mantineTheme}>
      <div className="Popup">
        <div className="Root">
          {isSettingsOpen ? (
            <Settings handleSettingsClick={handleSettingsClick}/>
          ) : (
            <>
              <header className="Popup-header">
                <p className="Popup-name">TabHabit</p>
                <ActionIcon
                  size="l"
                  radius="xl"
                  variant="subtle"
                  onClick={handleSettingsClick}
                >
                  <FontAwesomeIcon icon={faCog} size={"1x"}></FontAwesomeIcon>
                </ActionIcon>
              </header>
              <CloseCurrent/>
              <ClosedTabsList/>
            </>
          )}
        </div>
      </div>
    </MantineProvider>
  );
}

export default Popup;
