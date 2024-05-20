import "./LoadingTile.scss";
import { ReactElement } from "react";

interface LoadingTileProps {
  count?: number;
}

export function LoadingTile({ count = 5 }: LoadingTileProps): ReactElement {
  return (
    <div className={"loading-tile-wrapper"}>
      <div className={"loading-tile-container"}>
        <div className="wrapper">
          <div className="wrapper-cell">
            <div className="text">
              {[...Array(count)].map((value, index) => {
                return <div className="text-line" key={index}></div>;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingTile;
