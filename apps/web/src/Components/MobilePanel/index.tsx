import React, { useState } from "react";

import { Button } from "@mui/material";
import { Menu, X } from "lucide-react";
import {
  airdropRoutes,
  dashboardRoutes,
  dashboardTabs,
  settingRoutes,
  stakingRoutes,
} from "../../constants/routes";
import { useLocation, useNavigate } from "react-router-dom";
import WalletWidget from "../WalletWidget/WalletWidget";
import logo from "../../assets/images/full-logo.png";

// import { Link } from 'react-router-dom';

const MobileMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const theme = "dark";
  const navlinks: string[] = [
    ...dashboardRoutes,
    ...airdropRoutes,
    ...stakingRoutes,
    ...settingRoutes,
  ];
  const [open, setOpen] = useState(false);
  return (
    <section>
      <Button
        onClick={() => {
          console.log({ open });
          setOpen((prev) => !prev);
        }}
        className={`${theme}`}
        variant={`outlined`}
      >
        <Menu />
      </Button>
      <div
        onClick={() => {
          setOpen(() => false);
        }}
        style={{
          background: open ? "hsla(0, 0%, 0%, 0.486)" : "hsla(0, 0%, 0%, 0)",
          transition: "background ease-in-out 0.3s",
          transform: open ? "translateX(0%)" : "translateX(200%)",
        }}
        className="w-full absolute inset-0 h-[1px] "
      ></div>
      <div
        style={{
          background: "hsl(40, 20%, 95%)",
          transition: "transform ease-in-out 0.3s",
          transform: open ? "translateX(20%)" : "translateX(200%)",
          zIndex: 10,
          width: "80%",
        }}
        className={`${theme} absolute inset-0 p-4 `}
      >
        <header>
          <div
            style={{
              borderColor: "black",
              borderBottom: "1px solid #0700004c",
            }}
            className="border-b py-2 text-start flex items-center gap-2 justify-between rounded"
          >
            {/* Explore{" "} */}
            <div
              style={{ background: "#6f2ae2" }}
              className="p-2 sm:hidden  rounded-md! "
            >
              <img
                className=""
                style={{
                  width: "40px",
                }}
                src={logo}
                alt={"logo"}
              />
            </div>

            <div className="flex">
              {/* <Profile> */}
              <WalletWidget />
              {/* </Profile> */}
              <Button
                onClick={() => {
                  setOpen(false);
                }}
                style={{ padding: "0px" }}
              >
                <X style={{ color: "black" }} />
              </Button>
            </div>
          </div>
        </header>
        {/* <ul className="grid grid-cols-2 "> */}
        <ul
          style={{
            marginTop: "1rem",
          }}
          className="py-2 flex flex-col gap-4 "
        >
          {dashboardTabs.map((item, key) => {
            return location?.pathname?.includes(item.value) ? (
              <Button
                style={{
                  textAlign: "start",
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  width: "100%",
                  color: "white",
                  gap: "4px",
                  background: "#6f2ae2",
                }}
                className="!w-full gap-3 "
                key={`${key}_${item}`}
                // style={{ color: isDarkTheme ? "#717579" : undefined }}
                onClick={() => {
                  setOpen(false);
                  navigate(item.value);
                }}
              >
                {item.icon}
                <p  className="flex w-full ">
                  {item.label}
                </p>
                <div
                  className={`divide-solid divide-x w-full h-[1px] bg-primary rounded`}
                ></div>
              </Button>
            ) : (
              <Button
                style={{
                  textAlign: "start",
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  width: "100%",
                  gap: "4px",
                  color: "black",
                }}
                className="w-full  "
                key={`${key}_${item}`}
                // style={{ color: isDarkTheme ? "#717579" : undefined }}
                onClick={() => {
                  setOpen(false);
                  navigate(item.value);
                }}
              >
                {item.icon}
                <p style={{ width: "100%" }} className="flex w-max ">
                  {item.label}
                </p>
                <div
                  className={`divide-solid divide-x w-full h-[1px] bg-primary rounded`}
                ></div>
              </Button>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default MobileMenu;
