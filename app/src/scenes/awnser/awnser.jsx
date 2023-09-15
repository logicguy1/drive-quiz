import { Box, Button, IconButton, Typography, useTheme, Table, TextField } from "@mui/material";
import { tokens, themeSettings } from "../../theme";
import { useState, useEffect, useContext } from "react";
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

import { AuthContext } from '../../context/login';

import config from "../../config";

const Quiz = () => {
  const params = useParams();

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const auth = useContext(AuthContext);

  const [code, setCode] = useState(auth.token.code);
  const [name, setName] = useState("")
  const [options, setOptions] = useState([]);
  const [choice, setChoice] = useState(-1);

  const [result, setResult] = useState(-1)
  const [showOptions, setShopwOptions] = useState(false);

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

    socket.on('server_question', (data) => {
      console.log('Received message:', data);
      setOptions(data.options);
      setResult(-1);
      setShopwOptions(true)
    });

    socket.on('server_name', (data) => {
      console.log('Received message:', data);
      setName(` - ${data.quizname}`)
    })

    socket.on('server_score', (data) => {
      console.log('Received message SERVERSCORE:', data);
      setShopwOptions(false)
      if (data.status) {
        setResult(1);
      } else {
        setResult(0);
      }
    })

    socket.emit('join_quiz', {
      name: auth.token.name,
      code: auth.token.code,
    });

    return () => {
      socket.disconnect();
      setUserSocket(null);
    };
  }, []);

  const set_awnser = (awnser) => {
    setChoice(awnser);
  }

  useEffect(() => {
    if (userSocket !== null && choice !== -1) {
      userSocket.emit("submit_awnser", {awnser: choice, code: code, name: auth.token.name})
      setChoice(-1)
      setShopwOptions(false)
    }
  }, [choice])

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
         {`KøreQuiz${name}`}
      </Typography>

      {
        showOptions ? (
          <Box
            height="calc(-200px + 100vh)"
            overflow="scroll"
          >
            {options.map((item) => {return (
              <Box 
                key={item[0]}
              >
                <br />
                <Button variant="outlined"  
                  height="3em !important"
                  fontSize="2em !important"
                  className="input-buttons"
                  onClick={() => {set_awnser(item[0])}}
                >
                  {item[1]}
                </Button>

              </Box>
            )})}
          </Box>
        ) : (
          <>
            {result === 1 ? (
              <>
                <Box
                  backgroundColor={colors.greenAccent[500]}
                  position="absolute"
                  p={"2em"}
                  width="100%"
                  top="40%"
                  left="0"
                  textAlign="center"
                >
                  <Typography
                    variant="h2"
                    fontWeight="600"
                    color="#fff"
                  >
                     Korrekt!
                  </Typography>
                  <Typography
                    variant="h3"
                    fontWeight="500"
                    color="#fff"
                  >
                     Godt klaret
                  </Typography>
                </Box>
              </>
            ) : result === 0 ? (
              <>
                <Box
                  backgroundColor={colors.redAccent[500]}
                  position="absolute"
                  p={"2em"}
                  width="100%"
                  top="40%"
                  left="0"
                  textAlign="center"
                >
                  <Typography
                    variant="h2"
                    fontWeight="600"
                    color="#fff"
                  >
                    Desværre :(
                  </Typography>
                  <Typography
                    variant="h3"
                    fontWeight="500"
                    color="#fff"
                  >
                     Prøv igen næste gang
                  </Typography>
                </Box>
              </>
            ) : (
              <>
              </>
            )}
          </>
        )
      }

      <Box
        display="flex"
        justifyContent="space-between"
        position="absolute"
        bottom={0}
        left={0}
        width="100%"
        boxSizing="border-box"
        p="6%"
      >
        <Typography
          variant="h3"
          fontWeight="500"
          color={colors.grey[100]}
        >
           {auth.token.name}
        </Typography>
        <Typography
          variant="h3"
          fontWeight="500"
          color={colors.grey[100]}
        >
           {auth.token.code}
        </Typography>
      </Box>

    </Box>
  )
}

export default Quiz;
