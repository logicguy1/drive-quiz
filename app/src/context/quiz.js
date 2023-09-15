
import React, { createContext } from "react";

export const QuizContext = createContext();

export const QuizProvider = ({ children, value }) => {
  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
}
