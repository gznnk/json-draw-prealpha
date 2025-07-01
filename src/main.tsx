//import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./app/index.css";
import App from "./app/App.tsx";

// biome-ignore lint/style/noNonNullAssertion: Because we cannot ensure that the return type of getElementById() is non-null.
createRoot(document.getElementById("root")!).render(
	//<StrictMode>
	<App />,
	//</StrictMode>,
);
