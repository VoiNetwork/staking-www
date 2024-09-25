import React from "react";
import { Box, Typography, Link, Container } from "@mui/material";

interface ComingSoonProps {
  href: string;
  anchorText?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ href, anchorText = "Learn More" }) => {
  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="80vh"
        textAlign="center"
      >
        <Typography variant="h4" gutterBottom>
          Coming Soon
        </Typography>
        <Typography variant="body1" color="textSecondary">
          We're working hard to bring you this feature. Stay tuned!
        </Typography>
        <Link href={href} underline="hover" target="_blank" rel="noopener">
          {anchorText}
        </Link>
      </Box>
    </Container>
  );
};

export default ComingSoon;
