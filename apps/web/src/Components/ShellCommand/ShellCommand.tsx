import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useState } from 'react';
import { CopyAll } from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Define the props type
interface ShellCommandProps {
  command: string;
  description: string;
}

const ShellCommand: React.FC<ShellCommandProps> = ({ command, description }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(command)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });
    };

    return (
    <Box sx={{ margin: '20px 0' }}>
      <Typography variant="h6" gutterBottom>
        {description}
      </Typography>
      <SyntaxHighlighter language="bash" style={solarizedlight}>
        {command}
      </SyntaxHighlighter>
      <Button
        variant="contained"
        color="primary"
        startIcon={<CopyAll />}
        onClick={handleCopy}
        sx={{ marginTop: '10px' }}
        >
        {copied ? 'Copied!' : 'Copy'}
      </Button>
    </Box>
  );
};

export default ShellCommand;
