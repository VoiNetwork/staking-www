import { ReactElement } from "react";
import "./noRowsOverlay.scss";

export function CustomNoRowsOverlay(): ReactElement {
  return (
    <div className="no-rows-wrapper">
      <div className="no-rows-container">
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="text">No Rows found</div>
      </div>
    </div>
  );
}
