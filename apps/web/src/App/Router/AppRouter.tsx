import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { ReactElement } from "react";
import Portal from "../../Pages/Portal/Portal";

function AppRouter(): ReactElement {
  return (
    <HashRouter>
      <Routes>
        <Route path="/portal" element={<Portal></Portal>}>
          <Route path="/portal/overview" element={<div></div>}></Route>
          <Route path="/portal/stake" element={<div></div>}></Route>
          <Route path="/portal/deposit" element={<div></div>}></Route>
          <Route path="/portal/withdraw" element={<div></div>}></Route>
          <Route path="/portal/config" element={<div></div>}></Route>
          <Route path="" element={<Navigate to="overview" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/portal" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default AppRouter;
