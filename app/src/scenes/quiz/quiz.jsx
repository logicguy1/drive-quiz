import { Box, Button, IconButton, Typography, useTheme, Table, TextField } from "@mui/material";
import { tokens, themeSettings } from "../../theme";
import { useState, useEffect, useContext } from "react";
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { useNavigate } from "react-router-dom";

import { AuthContext } from '../../context/login';

import Progress from '../../componentes/progress/progress';

import config from "../../config";

const Quiz = () => {
  const params = useParams();
  const navigate = useNavigate();

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const auth = useContext(AuthContext);

  const [code, setCode] = useState("...");

  const [questions, setQuestions] = useState("...");
  const [options, setOptions] = useState([]);
  const [awnsers, setAwnsers] = useState({});

  const [activeQ, setActiveQ] = useState(-1);
  const [users, setUsers] = useState([]);
  const [isShowResult, setIsShowResult] = useState(false);

  const [userSocket, setUserSocket] = useState(null);

  useEffect(() => {
    const socket = io(config.baseurl); // Replace with your Flask server URL

    socket.on('connect', () => {
      console.log('Connected to WebSocket');
      setUserSocket(socket);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      setUserSocket(null);
    });

    // You can define custom events and handlers here
    // For example:
    socket.on('message', (data) => {
      console.log('Received message:', data);
    });

    socket.on('server_code', (data) => {
      console.log('Received code:', data);
      setCode(data.code);
      setQuestions(data.questions)
    });

    socket.on('server_join', (data) => {
      console.log('Received code:', data);
      setUsers((prevUsers) => [...prevUsers, data.name]);
    });

    socket.on('server_awnsers', (data) => {
      console.log('Received message:', data);
      setOptions(data.options);
      setAwnsers(data.awnsers);
    })

    socket.emit('start_quiz', {
      token: auth.token,
      id: params.id,
    });

    return () => {
      socket.disconnect();
      setUserSocket(null);
    };
  }, []);

  const next_question = () => {
    setActiveQ(activeQ + 1);
    setIsShowResult(false);
    console.log(activeQ)
  }

  useEffect(() => {
    if (userSocket !== null && activeQ !== questions.length) {
      console.log(questions, activeQ)
      userSocket.emit("next_question", {qid: questions[activeQ][0], code: code})
    }
  }, [activeQ])

  const show_result = () => {
    if (userSocket !== null) {
      console.log("SHOWING RESULT")
      userSocket.emit("get_awnsers", {qid: questions[activeQ][0], code: code})
      setIsShowResult(true);
    }
  }

  return (
    <Box
      width="100%"
      boxSizing="border-box"
      p="6%"
      height="calc(100% - 55px)"
    >
      <Typography
        variant="h2"
        fontWeight="500"
        color={colors.grey[100]}
      >
         {`KøreQuiz - ${code}`}
      </Typography>
     
      {activeQ === questions.length ? (
        <>
          <Progress users={awnsers} qAmount={questions.length} />
          <Button variant="outlined" className="bottom-buttons" onClick={() => navigate("/")}>{"Afslut Quiz"}</Button>
        </>
      ) : (
        <>
          {
            isShowResult === true ? (
              <>
                <Typography
                  variant="h3"
                  fontWeight="500"
                  color={colors.grey[100]}
                >
                   {questions[activeQ][1]}
                </Typography>
                <br />
                <Box
                  height="calc(-335px + 100vh)"
                  overflow="scroll"
                >
                  <Box
                    display="grid"
                    width="100%"
                    gridTemplateColumns="auto auto"
                    gap="1em"
                  >
                    {options.map((item) => {return (
                      <Box 
                        height="65px"
                        boxSizing="border-box"
                        className="show-input-buttons"
                        backgroundColor={ item[2] == 0 ? colors.redAccent[800] : colors.greenAccent[800] }
                        textAlign="center"
                        borderRadius="3px"
                        border={`1px ${item[2] == 0 ? colors.redAccent[600] : colors.greenAccent[600]} solid`}
                      >
                        <Typography
                          variant="h4"
                          fontWeight="500"
                          color={colors.grey[100]}
                          lineHeight="65px"
                        >
                          {item[1]}
                        </Typography>
                      </Box>
                    )})}
                  </Box>

                  <br />
                  <Box width="100%">
                    <Progress users={awnsers} qAmount={questions.length} />
                  </Box>
                </Box>

                <Button variant="outlined" className="bottom-buttons" onClick={next_question}>{">>>>"}</Button>
              </>
            ) : (
              <>
                {activeQ === -1 ? (
                  <>
                    <Box>
                      {users.map((item) => {return (
                        <Box key={item}>
                          <Typography
                            variant="h4"
                            fontWeight="500"
                            color={colors.grey[100]}
                          >
                            {item}
                          </Typography>
                        </Box>
                      )})}
                    </Box>
                    <Button variant="outlined" className="bottom-buttons" onClick={next_question}>{"Start!"}</Button>
                  </>
                ) : (
                  <>
                    <Typography
                      variant="h3"
                      fontWeight="500"
                      color={colors.grey[100]}
                    >
                      {questions[activeQ][1]}
                    </Typography>
      
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      pt={2}
                    >
                      <img 
                        src={`${config.baseurl}/static/img/${questions[activeQ][2]}`} 
                        alt=""
                        style={{ height: "60vh" }}
                      />
                    </Box>

                    <Button variant="outlined" className="bottom-buttons" onClick={show_result}>{"Se resluater"}</Button>
                  </>
                )}
              </>
            )
          }
        </>
      )}
    </Box>
  )
}

export default Quiz;
