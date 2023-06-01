import React, { useEffect, useState } from "react";
import { NumberInput, Switch, Text, ActionIcon } from "@mantine/core";
import settings from "../storage/settings";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

function Settings({ handleSettingsClick }) {
  const [tabLifetimeDays, setTabLifetimeDays] = useState(3);
  const [closePinnedTabs, setClosePinnedTabs] = useState(true);

  useEffect(async () => {
    await settings.init();
    setTabLifetimeDays(settings.get(settings.TAB_LIFETIME_DAYS));
    setClosePinnedTabs(settings.get(settings.CLOSE_PINNED_TABS));
  }, []);

  const changeTabLifetimeDays = async (value) => {
    console.log(value);
    await settings.set(settings.TAB_LIFETIME_DAYS, value);
    setTabLifetimeDays(value);
    chrome.runtime.sendMessage({ action: "reload-settings" });
  };

  const toggleClosePinnedTabs = async (checked) => {
    await settings.set(settings.CLOSE_PINNED_TABS, checked);
    setClosePinnedTabs(checked);
    chrome.runtime.sendMessage({ action: "reload-settings" });
  };

  return (
    <>
      <header className="Popup-header">
        <ActionIcon
          size="l"
          radius="xl"
          variant="subtle"
          onClick={handleSettingsClick}
        >
          <FontAwesomeIcon icon={faChevronLeft} size={"1x"}></FontAwesomeIcon>
        </ActionIcon>
        <p className="Settings-header">Settings</p>
      </header>

      <div className="Settings-container">
        <div className="Setting-line-container">
          <div className="Setting-title-container">
            <Text fz="md" fw={600}>
              Tab lifetime days:
            </Text>
          </div>
          <div className="Lifetime-input-container">
            <NumberInput
              defaultValue={tabLifetimeDays}
              onChange={(value) => changeTabLifetimeDays(value)}
              placeholder="Tab lifetime input"
              variant="default"
              radius="lg"
              size="sm"
              max={14}
              min={1}
            />
          </div>
        </div>

        <div className="Setting-line-container">
          <div className="Setting-title-container">
            <Text fz="md" fw={600}>
              Close pinned tabs:
            </Text>
          </div>
          <div className="Pinned-settings-checker-container">
            <Switch
              size="md"
              color={"tabHabitGreen"}
              checked={closePinnedTabs}
              onChange={(event) =>
                toggleClosePinnedTabs(event.currentTarget.checked)
              }
              styles={{
                track: { height: 28, width: 60 },
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Settings;
