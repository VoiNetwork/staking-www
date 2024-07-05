import { createContext, useContext, useState } from "react";
import loaderImg from "./loader.gif";
import "./Loader.scss";

interface LoaderState {
  visible: boolean;
  message: string;
}

interface LoaderContextType {
  loader: LoaderState;
  showLoader: (message?: string) => void;
  hideLoader: () => void;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (context === undefined) {
    throw new Error("useLoader must be used within a LoaderProvider");
  }
  return context;
};

export function LoaderProvider({ children }: any) {
  const [loader, setLoader] = useState<LoaderState>({
    visible: false,
    message: "",
  });

  const showLoader = (message = "Loading...") => {
    setLoader({ visible: true, message });
  };

  const hideLoader = () => {
    setLoader({ visible: false, message: "" });
  };

  const loaderUI = loader.visible ? (
    <div>
      <div className="loading-box">
        <div className="progress-bar">
          <img src={loaderImg} alt="loading" />
        </div>
        <div className="message">{loader.message}</div>
      </div>
      <div className="loader-wrapper"></div>
    </div>
  ) : null;

  return (
    <LoaderContext.Provider value={{ loader, showLoader, hideLoader }}>
      {children}
      {loaderUI}
    </LoaderContext.Provider>
  );
}
