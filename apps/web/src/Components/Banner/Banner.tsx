import React from "react";
import { Box, Typography, Link, Button, Stack } from "@mui/material";

interface BannerProps {
  maxWidth?: string;
}
const Banner: React.FC<BannerProps> = (props) => {
  return (
    <Box
      sx={{
        background: "url(/happy.png)",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        bgcolor: "silver",
        color: "#fff",
        padding: "16px",
        textAlign: "center",
        borderRadius: "8px",
        mb: 2,
        width: "100%",
        maxWidth: props.maxWidth || "100%",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Got Voi?
      </Typography>

      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          component={Link}
          href="https://www.mexc.com/exchange/VOI_USDT"
          target="_blank"
          rel="noopener"
          sx={{ color: "#fff", textDecoration: "none" }}
        >
          MEXC
        </Button>
        <Button
          component={Link}
          href="https://www.coinstore.com/spot/VOIUSDT"
          target="_blank"
          rel="noopener"
          sx={{ color: "#fff", textDecoration: "none" }}
        >
          Coinstore
        </Button>
        <Button
          component={Link}
          href="https://app.aramid.finance/bridge/Base/Voi/USDC/Aramid%20USDC"
          target="_blank"
          rel="noopener"
          sx={{ color: "#fff", textDecoration: "none" }}
        >
          Aramid Bridge
        </Button>
        <Button
          component={Link}
          href="https://voi.humble.sh"
          target="_blank"
          rel="noopener"
          sx={{ color: "#fff", textDecoration: "none" }}
        >
          HumbPact
        </Button>
        <Button
          component={Link}
          href="https://medium.com/@voifoundation/staking-program-how-to-guide-382ea5085dab"
          target="_blank"
          rel="noopener"
          sx={{ color: "#fff", textDecoration: "none" }}
        >
          Staking Guide
        </Button>
      </Stack>
    </Box>
  );
};

export default Banner;
