import { playSoundFromMove } from "@/lib/sounds";
import { Chess, Move, DEFAULT_POSITION } from "chess.js";
import { PrimitiveAtom, useAtom } from "jotai";
import { useCallback } from "react";

export const useAnalysisChessActions = (chessAtom: PrimitiveAtom<Chess>) => {
  const [game, setGame] = useAtom(chessAtom);

  const copyGame = useCallback(() => {
    const newGame = new Chess();
    try {
      newGame.loadPgn(game.pgn());
    } catch {
      newGame.load(game.getHeaders().FEN || DEFAULT_POSITION, {
        preserveHeaders: true,
      });
      for (const move of game.history()) {
        newGame.move(move);
      }
    }
    return newGame;
  }, [game]);

  const undoMove = useCallback(
    (pushToRedoStack?: (game: Chess) => void) => {
      const currentGame = copyGame();
      const move = currentGame.undo();
      if (pushToRedoStack) {
        pushToRedoStack(currentGame);
      }
      if (move) playSoundFromMove(move);
      setGame(currentGame);
    },
    [copyGame, setGame]
  );

  const redoMove = useCallback(
    (popFromRedoStack: () => Chess | undefined) => {
      const nextGame = popFromRedoStack();
      if (nextGame) {
        setGame(nextGame);
        const lastMove = nextGame.history({ verbose: true }).pop();
        if (lastMove) playSoundFromMove(lastMove);
      }
    },
    [setGame]
  );

  const resetToStartingPosition = useCallback(
    (pgn?: string) => {
      const newGame = pgn
        ? (() => {
            const g = new Chess();
            g.loadPgn(pgn);
            return g;
          })()
        : copyGame();
      newGame.load(newGame.getHeaders().FEN || DEFAULT_POSITION, {
        preserveHeaders: true,
      });
      setGame(newGame);
    },
    [copyGame, setGame]
  );

  const playMove = useCallback(
    (params: {
      from: string;
      to: string;
      promotion?: string;
      comment?: string;
    }): Move | null => {
      const newGame = copyGame();

      try {
        const { comment, ...move } = params;
        const result = newGame.move(move);
        if (comment) newGame.setComment(comment);

        setGame(newGame);
        playSoundFromMove(result);
        return result;
      } catch {
        return null;
      }
    },
    [copyGame, setGame]
  );

  const goToMove = useCallback(
    (moveIdx: number, fullGame: Chess) => {
      if (moveIdx < 0) return;

      const newGame = new Chess();
      newGame.loadPgn(fullGame.pgn());

      const movesNb = fullGame.history().length;
      if (moveIdx > movesNb) return;

      let lastMove: Move | null = {} as Move;
      for (let i = movesNb; i > moveIdx; i--) {
        lastMove = newGame.undo();
      }

      setGame(newGame);
      playSoundFromMove(lastMove);
    },
    [setGame]
  );

  return {
    undoMove,
    redoMove,
    resetToStartingPosition,
    playMove,
    goToMove,
    copyGame,
  };
};
