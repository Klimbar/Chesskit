import { Grid2 as Grid, IconButton, Tooltip } from "@mui/material";
import { Icon } from "@iconify/react";
import { useAtomValue } from "jotai";
import { boardAtom, gameAtom } from "../states";
import { useAnalysisChessActions } from "@/hooks/useAnalysisChessActions";
import FlipBoardButton from "./flipBoardButton";
import NextMoveButton from "./nextMoveButton";
import GoToLastPositionButton from "./goToLastPositionButton";
import SaveButton from "./saveButton";
import { useEffect, useCallback } from "react";

export default function PanelToolBar() {
  const board = useAtomValue(boardAtom);

  const { undoMove, resetToStartingPosition } = useAnalysisChessActions(boardAtom);

  const boardHistory = board.history();
  const game = useAtomValue(gameAtom);

  const handleUndo = useCallback(() => {
    undoMove();
  }, [undoMove]);

  const handleReset = useCallback(() => {
    resetToStartingPosition();
  }, [resetToStartingPosition]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (boardHistory.length === 0) return;
      if (e.key === "ArrowLeft" && !e.shiftKey) {
        handleUndo();
      } else if (e.key === "ArrowDown") {
        handleReset();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [handleUndo, handleReset, boardHistory]);

  return (
    <Grid container justifyContent="center" alignItems="center" size={12}>
      <FlipBoardButton />

      <Tooltip title="Reset board">
        <Grid>
          <IconButton
            onClick={handleReset}
            disabled={boardHistory.length === 0}
            sx={{ paddingX: 1.2, paddingY: 0.5 }}
          >
            <Icon icon="ri:skip-back-line" />
          </IconButton>
        </Grid>
      </Tooltip>

      <Tooltip title="Go to previous move">
        <Grid>
          <IconButton
            onClick={handleUndo}
            disabled={boardHistory.length === 0}
            sx={{ paddingX: 1.2, paddingY: 0.5 }}
          >
            <Icon icon="ri:arrow-left-s-line" height={30} />
          </IconButton>
        </Grid>
      </Tooltip>

      <NextMoveButton />

      <GoToLastPositionButton />

      <Tooltip title="Copy pgn">
        <Grid>
          <IconButton
            disabled={game.history().length === 0}
            onClick={() => {
              navigator.clipboard?.writeText?.(game.pgn());
            }}
            sx={{ paddingX: 1.2, paddingY: 0.5 }}
          >
            <Icon icon="ri:clipboard-line" />
          </IconButton>
        </Grid>
      </Tooltip>

      <SaveButton />
    </Grid>
  );
}
