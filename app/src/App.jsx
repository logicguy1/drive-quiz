import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider, Box } from "@mui/material";
import { Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";

import { AuthProvider } from "./context/login";

import Login from "./scenes/login/login.jsx";
import Index from "./scenes/index/index.jsx";
import Quiz from "./scenes/quiz/quiz.jsx";
import Awnser from "./scenes/awnser/awnser.jsx";

function App() {
  const [theme, colorMode] = useMode();
  const [token, setToken] = useState(null);

  return (
    <AuthProvider value={{token: token, setToken: setToken}}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {token === null ? (
            <Login />
          ) : (
          <>
            <div className="app">
              <main className="content">
                {/*<Topbar /> */}
                <Box display="block" mb="55px">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/quiz/:id" element={<Quiz />} />
                    <Route path="/awnser" element={<Awnser />} />
                  </Routes>
                </Box>
              </main>
            </div>
          </>
        )}
        </ThemeProvider>
      </ColorModeContext.Provider>
    </AuthProvider>
  );
}

export default App;
