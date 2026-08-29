import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./store";
import AppShell from "./components/AppShell";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Work from "./pages/Work";
import Discover from "./pages/Discover";
import Outcome from "./pages/Outcome";
import Learn from "./pages/Learn";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/work" element={<Work />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/outcome" element={<Outcome />} />
            <Route path="/learn" element={<Learn />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
