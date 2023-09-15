import { Box, Button, IconButton, Typography, useTheme, Table, TextField } from "@mui/material";
import { tokens, themeSettings } from "../../theme";
 
import config from "../../config";
import { useEffect, useState } from "react";

const Progress = ({ users, qAmount }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [data, setData] = useState([]);
  const [offset, setOffset] = useState(0);

  console.log(users, data);

  useEffect(() => {
    if (!(!users || typeof users !== 'object' || users === {} || users.children === undefined)) {
      let x = -1;

      const tmpData = Object.entries(users.children).map((item) => {
        x++;
        return [x, item[0], item[1].awnser, item[1].score]
      });

      setData(tmpData);
    }
  }, [users]);

  if (!users || typeof users !== 'object' || users === {} || users.children === undefined) {
    return <div>No data available</div>;
  }

  return (
    <svg style={{ width: "inherit", height: data.length * 80}}>
      <svg x="80%" y="0" width="30" height="100%">
        <line x1="6" y1="6" x2="6" y2="100%" style={{ stroke: "rgb(75,75,75)", strokeWidth: 6, strokeDasharray: "6" }} />
        <line x1="12" y1="12" x2="12" y2="100%" style={{ stroke: "rgb(75,75,75)", strokeWidth: 6, strokeDasharray: "6" }} />
      </svg>

      {data.map((item) => {return (
        <>
          <line x1="0" y1={item[0] * 80+45} x2={`${item[3]/qAmount*100}%`} y2={item[0] * 80+45} style={{ stroke: "rgb(255,0,0)", strokeWidth: 5}} />
          <g transform="translate(-70, 0)">
            <svg x={`${item[3]/qAmount*100}%`} y={item[0] * 80+6} width="80" height="40">
              <rect x="10" y="10" width="60" height="20" rx="10" ry="10" fill="blue" />
              <rect x="20" y="10" width="40" height="10" rx="5" ry="5" fill="blue" />

              <rect x="25" y="12" width="15" height="8" rx="3" ry="3" fill="black" />
              <rect x="40" y="12" width="15" height="8" rx="3" ry="3" fill="black" />

              <circle cx="20" cy="30" r="7" fill="black" />
              <circle cx="60" cy="30" r="7" fill="black" />
            </svg>
          </g>
          <text x="0" y={item[0] * 80+30} fontSize="2em" fill="black">{item[1]}</text>
        </>
      )})}
    </svg>
  )
}

export default Progress;
