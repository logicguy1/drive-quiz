import { Box, Button, IconButton, Typography, useTheme, Table, TextField } from "@mui/material";
import { tokens, themeSettings } from "../../theme";
import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";

import { AuthContext } from '../../context/login';

import config from "../../config";

// import { screen1 } from "../../data/mockData";

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const colors = tokens(theme.palette.mode);

  const auth = useContext(AuthContext);

  const [state, setState] = useState(0)

  const handleLogin = (e) => {
    e.preventDefault(); 

    const children = e.target.children;

    const user = children[1].children[1].lastChild.value;
    const pass = children[3].children[1].lastChild.value;

    console.log(user, pass)
    console.log(config.baseurl)
    fetch(
      `${config.baseurl}/login`,
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: user,
          pass: pass,
        })
      }
    ).then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json(); // Parse the response JSON
    })
    .then(data => {
      // Handle the response data here
      console.log(data);
      if (data.success) {
        auth.setToken(data.token)
        navigate("/");
      } else {
        alert("Invalid login.")
      }
    })
    .catch(error => {
      // Handle any errors that occurred during the fetch
      alert('Fetch error:', error);
    });
  }

  const handleLoginUser = (e) => {
    e.preventDefault(); 

    const children = e.target.children;
    console.log(children)

    const name = children[1].children[1].lastChild.value;
    const code = children[3].children[1].lastChild.value;

     fetch(
      `${config.baseurl}/getcode`,
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          code: code,
        })
      }
    ).then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json(); // Parse the response JSON
    })
    .then(data => {
      // Handle the response data here
      console.log(data);
      if (data.success) {
        auth.setToken({name: name, code: code});
        navigate("/awnser");
      } else {
        alert(data.message);
      }
    })
    .catch(error => {
      // Handle any errors that occurred during the fetch
      alert('Fetch error:', error);
    }); 
  }

  return (
    <Box
      width="clamp(100px, 100%, 400px);"
      boxSizing="border-box"
      p="6%"
      height="calc(100% - 55px)"
      position="absolute"
      left="50%"
      style={{
        transform: "translateX(-50%)",
      }}
    >
      <Typography
        variant="h2"
        fontWeight="500"
        color={colors.grey[100]}
      >
         KøreQuiz Login
      </Typography>
      {state === 0 ? (
        <>
          <br />
          <br />
          <Button variant="outlined" className="login-buttons" onClick={() => {setState(1)}}>Underviser</Button>
          <br />
          <br />
          <Button variant="outlined" className="login-buttons" onClick={() => {setState(2)}}>Elev</Button>
          <br />
        </>
      ) : state === 1 ? (
        <>
          <form onSubmit={handleLogin}>
            <br />
            <TextField className="login-field" type="text" name="username" label="Brugernavn" variant="standard" />
            <br />
            <TextField className="login-field" type="password" name="password" label="Adgangskode" variant="standard" />
            <br />
            <br />
            <Button variant="outlined" className="login-buttons" type="submit">Logind</Button>
          </form>
          <Box
            textAlign="center"
            mt={1}
            style={{cursor: "pointer"}}
            onClick={() => {setState(0)}}
          >
            <Typography
              variant="p"
              fontWeight="500"
              color={colors.grey[600]}
            >
               Tilbage
            </Typography>
          </Box>
        </>
      ) : (
        <>
          <form onSubmit={handleLoginUser}>
            <br />
            <TextField className="login-field" type="text" name="username" label="Brugernavn" variant="standard" />
            <br />
            <TextField className="login-field" type="text" name="code" label="Kode" variant="standard" />
            <br />
            <br />
            <Button variant="outlined" className="login-buttons" type="submit">Go!</Button>
          </form>
          <Box
            textAlign="center"
            mt={1}
            style={{cursor: "pointer"}}
            onClick={() => {setState(0)}}
          >
            <Typography
              variant="p"
              fontWeight="500"
              color={colors.grey[600]}
            >
               Tilbage
            </Typography>
          </Box>
        </>
      )}
    </Box>
  )
}

export default Login;
