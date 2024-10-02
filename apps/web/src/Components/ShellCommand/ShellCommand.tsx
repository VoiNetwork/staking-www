import React from 'react';
import { Box, Typography } from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Define the props type
interface ShellCommandProps {
  command: string;
  description: string;
}

const ShellCommand: React.FC<ShellCommandProps> = ({ command, description }) => {
  return (
    <Box sx={{ margin: '20px 0' }}>
      <Typography variant="h6" gutterBottom>
        {description}
      </Typography>
      <SyntaxHighlighter language="bash" style={solarizedlight}>
        {command}
      </SyntaxHighlighter>
    </Box>
  );
};

export default ShellCommand;
