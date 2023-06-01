import React, { useState, useEffect } from "react";
import { Switch, Text } from "@mantine/core";
import domainsWhitelist from "../storage/domains-whitelist";
import urlsWhitelist from "../storage/urls-whitelist";

function CloseCurrent(props) {
  const [currentTabUrl, setCurrentTabUrl] = useState("");
  const [currentTabDomain, setCurrentTabDomain] = useState("");
  const [currentTabPath, setCurrentTabPath] = useState("");
  const [closeCurrentDomain, setCloseCurrentDomain] = useState(false);
  const [closeCurrentTab, setCloseCurrentTab] = useState(false);

  useEffect(async () => {
    await domainsWhitelist.init();
    await urlsWhitelist.init();

    const currentWindow = await chrome.windows.getCurrent();
    const currentTab = (
      await chrome.tabs.query({ active: true, windowId: currentWindow.id })
    )[0];
    const currentTabUrl = currentTab.url;
    const tabUrlObj = new URL(currentTabUrl);
    const currentTabDomain = tabUrlObj.hostname;
    const currentTabPath = tabUrlObj.pathname + tabUrlObj.search;

    setCurrentTabPath(currentTabPath);
    setCurrentTabUrl(currentTabUrl);
    setCurrentTabDomain(currentTabDomain);
    setCloseCurrentDomain(!domainsWhitelist.has(currentTabDomain));
    setCloseCurrentTab(!urlsWhitelist.has(currentTabUrl));
  }, [currentTabUrl]);

  const toggleCloseCurrentDomain = async (checked) => {
    if (checked) {
      await domainsWhitelist.delete(currentTabDomain);
    } else {
      await domainsWhitelist.add(currentTabDomain);
    }
    chrome.runtime.sendMessage({ action: "reload-domains-whitelist" });
    setCloseCurrentDomain(checked);
  };

  const toggleCloseCurrentTab = async (checked) => {
    if (checked) {
      await urlsWhitelist.delete(currentTabUrl);
    } else {
      await urlsWhitelist.add(currentTabUrl);
    }
    chrome.runtime.sendMessage({ action: "reload-urls-whitelist" });
    setCloseCurrentTab(checked);
  };

  return (
    <>
      <div className="Subheader">Clean up tabs from:</div>
      <div className="CloseCurrentDomain-container">
        <div className="CloseCurrent-name-container CloseCurrentDomain-name-container">
          <div className={"Website-name"}>This website:</div>
          <div className={"Website-url"}>
            {currentTabDomain.split("www.")[1] || currentTabDomain}
          </div>
        </div>

        <div className="CloseCurrent-checker-container">
          <Switch
            color={"tabHabitGreen"}
            size="md"
            checked={closeCurrentDomain}
            onChange={(event) =>
              toggleCloseCurrentDomain(event.currentTarget.checked)
            }
            styles={{
              track: { height: 28, width: 60 },
            }}
          />
        </div>
      </div>
      <div className="CloseCurrentPath-container">
        <div className="CloseCurrent-name-container CloseCurrentPath-name-container">
          <div className={"Website-name"}>This page:</div>
          <div className={"Website-url"}>{currentTabPath}</div>
        </div>

        <div className="CloseCurrent-checker-container">
          <Switch
            color={"tabHabitGreen"}
            size="sm"
            checked={closeCurrentTab && closeCurrentDomain}
            onChange={(event) =>
              toggleCloseCurrentTab(event.currentTarget.checked)
            }
            styles={{
              track: { height: 22, width: 48 },
            }}
          />
        </div>
      </div>
    </>
  );
}

export default CloseCurrent;
