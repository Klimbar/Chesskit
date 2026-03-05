import { Box, Grid2 as Grid, Typography } from "@mui/material";
import { useMemo, useRef, useEffect } from "react";
import { useAtomValue } from "jotai";
import { gameAtom } from "@/sections/play/states";

export default function PlayMovesPanel() {
  const game = useAtomValue(gameAtom);
  const containerRef = useRef<HTMLDivElement>(null);

  const gameMoves = useMemo(() => {
    const history = game.history();
    if (!history.length) return undefined;

    const moves: string[][] = [];
    for (let i = 0; i < history.length; i += 2) {
      const items = [history[i]];
      if (history[i + 1]) {
        items.push(history[i + 1]);
      }
      moves.push(items);
    }
    return moves;
  }, [game]);

  const lastMoveIndex = game.history().length - 1;
  const lastMovePairIndex = Math.floor(lastMoveIndex / 2);
  const isWhiteMove = lastMoveIndex % 2 === 0;

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [gameMoves?.length]);

  if (!gameMoves?.length) return null;

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="start"
      gap={1}
      paddingY={1}
      sx={{ scrollbarWidth: "thin", overflowY: "auto" }}
      maxHeight="200px"
      size={12}
      ref={containerRef}
    >
      {gameMoves.map((moves, idx) => {
        const isLastPair = idx === lastMovePairIndex;
        const isLastWhiteMove = isLastPair && isWhiteMove;
        const isLastBlackMove = isLastPair && !isWhiteMove;

        return (
          <Box key={idx} display="flex" gap={1} width="100%" alignItems="center">
            <Typography minWidth="28px" fontSize="0.85rem" color="text.secondary">
              {idx + 1}.
            </Typography>
            <Box
              display="flex"
              alignItems="center"
              sx={{
                width: "48px",
                px: 0.5,
                borderRadius: 1,
                backgroundColor: isLastWhiteMove || (!moves[1] && isLastPair) ? "action.selected" : "transparent",
              }}
            >
              <Typography
                fontSize="0.85rem"
                fontWeight={isLastWhiteMove || (!moves[1] && isLastPair) ? 700 : 400}
                color={isLastWhiteMove || (!moves[1] && isLastPair) ? "primary.main" : "inherit"}
              >
                {moves[0]}
              </Typography>
            </Box>
            <Box
              display="flex"
              alignItems="center"
              sx={{
                width: "48px",
                px: 0.5,
                borderRadius: 1,
                backgroundColor: isLastBlackMove ? "action.selected" : "transparent",
              }}
            >
              <Typography
                fontSize="0.85rem"
                fontWeight={isLastBlackMove ? 700 : 400}
                color={isLastBlackMove ? "primary.main" : "inherit"}
              >
                {moves[1]}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Grid>
  );
}
