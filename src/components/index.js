import React from 'react';
import ReactDOM from 'react-dom';
import Popup from "./popup";
import closedTabs from "../storage/closed-tabs";


window.onload = function() {
    global.closedTabs = closedTabs;
    ReactDOM.render(
        <React.StrictMode>
            <Popup/>
        </React.StrictMode>,
        document.getElementById('root')
    );
}