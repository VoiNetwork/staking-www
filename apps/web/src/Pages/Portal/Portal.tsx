import { ReactElement } from "react";
import "./Portal.scss";
import Header from "./Components/Header/Header";
import { Outlet } from "react-router-dom";
import { Grid } from "@mui/material";

function Portal(): ReactElement {
  return (
    <div className="portal-wrapper">
      <div className="portal-container">
        <Header></Header>
        <div className="portal-body">
          <Grid container spacing={0}>
            <Grid item xs={2} sm={2} md={2} lg={2} xl={2}></Grid>
            <Grid item xs={8} sm={8} md={8} lg={8} xl={8}>
              <Outlet></Outlet>
            </Grid>
          </Grid>
        </div>
      </div>
    </div>
  );
}

export default Portal;
