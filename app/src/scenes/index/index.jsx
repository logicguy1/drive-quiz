import { Box, Button, IconButton, Typography, useTheme, TextField } from "@mui/material";
import { tokens, themeSettings } from "../../theme";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { AuthContext } from '../../context/login';

import config from "../../config";

const Index = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const auth = useContext(AuthContext);

  const [quizes, setQuizes] = useState([]);

  useEffect(() => {
    fetch(`${config.baseurl}/getquizes`, {
      method: 'GET',
      headers: {
        token: auth.token
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Handle the response data
        setQuizes(data.data)
      })
      .catch(error => {
        // Handle any errors that occurred during the fetch
        console.error('Fetch error:', error);
      });
  }, [])

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
         KøreQuiz
      </Typography>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell align="right">ID</TableCell>
              <TableCell align="right">Navn</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quizes.map((item) => {return (
              <TableRow
                key={item[0]}
                sx={{ '&:last-child td, &:last-child th': { border: 0 }, 'cursor': 'pointer' }}
                onClick={() => {navigate(`/quiz/${item[0]}`)}}
              >
                <TableCell align="right">{item[0]}</TableCell>
                <TableCell align="right">{item[1]}</TableCell>
                {/*<Link to={`/quiz/${item[0]}`}>{item[1]}</Link>*/}
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default Index;
