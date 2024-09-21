import React from "react"
import "./Setting.scss";
import { ReactElement } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import NetworkPicker from "../../Components/pickers/NetworkPicker/NetworkPicker";

function Setting(): ReactElement {
  const node = useSelector((state: RootState) => state.node);

  const nodes = useSelector((state: RootState) => state.nodes);
  console.log({ nodes });

  return (
    <div className="overview-wrapper">
      <div className="overview-container">
        <div className="overview-header">
          <div>Setting</div>
        </div>
        <div className="overview-body">
          <div className="row">
            <div className="col">
              <div className="key">Network</div>
            </div>
            <div className="col">
              <div className="value">
                <NetworkPicker></NetworkPicker>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Setting;
