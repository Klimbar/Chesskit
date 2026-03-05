import { MoveClassification } from "@/types/enums";
import { atom, useAtomValue } from "jotai";
import Image from "next/image";
import { CSSProperties, forwardRef, memo, useMemo, useContext } from "react";
import { CustomSquareProps } from "react-chessboard/dist/chessboard/types";
import { CLASSIFICATION_COLORS } from "@/constants";
import { BoardStateContext } from "./index";

export function getSquareRenderer() {
  const SquareRendererComponent = memo(
    forwardRef<HTMLDivElement, CustomSquareProps>((props, ref) => {
      const { children, square, style } = props;
      const { backgroundColor, ...containerStyle } = (style ||
        {}) as React.CSSProperties;

      const {
        boardHue,
        currentPositionAtom,
        clickedSquaresAtom,
        playableSquaresAtom,
        captureSquaresAtom,
        showPlayerMoveIconAtom,
        moveClickFromAtom,
        boardSize,
      } = useContext(BoardStateContext);

      // Derived stable subscriptions to prevent O(N) re-render cycles
      const isPlayable = useAtomValue(
        useMemo(
          () => atom((get) => get(playableSquaresAtom).includes(square)),
          [playableSquaresAtom, square]
        )
      );

      const isCapture = useAtomValue(
        useMemo(
          () => atom((get) => get(captureSquaresAtom).includes(square)),
          [captureSquaresAtom, square]
        )
      );

      const clickedSquare = useAtomValue(
        useMemo(
          () =>
            atom((get) =>
              get(clickedSquaresAtom).find((s) => s.square === square)
            ),
          [clickedSquaresAtom, square]
        )
      );

      const isMoveClickFrom = useAtomValue(
        useMemo(
          () => atom((get) => get(moveClickFromAtom) === square),
          [moveClickFromAtom, square]
        )
      );

      const isLastMove = useAtomValue(
        useMemo(
          () =>
            atom((get) => {
              const pos = get(currentPositionAtom);
              return pos.lastMove?.from === square || pos.lastMove?.to === square;
            }),
          [currentPositionAtom, square]
        )
      );

      const classification = useAtomValue(
        useMemo(
          () =>
            atom((get) => {
              const pos = get(currentPositionAtom);
              const isLastMoveSquare =
                pos.lastMove?.from === square || pos.lastMove?.to === square;
              return isLastMoveSquare ? pos.eval?.moveClassification || null : null;
            }),
          [currentPositionAtom, square]
        )
      );

      const isLastMoveTo = useAtomValue(
        useMemo(
          () => atom((get) => get(currentPositionAtom).lastMove?.to === square),
          [currentPositionAtom, square]
        )
      );

      const showPlayerMoveIcon = useAtomValue(showPlayerMoveIconAtom);

      const highlightSquareStyle: CSSProperties | undefined = useMemo(
        () =>
          isMoveClickFrom
            ? activeSquareStyle
            : clickedSquare
              ? rightClickSquareStyle(clickedSquare.color)
              : isLastMove
                ? previousMoveSquareStyle(classification)
                : undefined,
        [clickedSquare, isMoveClickFrom, isLastMove, classification]
      );

      const playableSquareStyle: CSSProperties | undefined = useMemo(
        () =>
          isPlayable
            ? isCapture
              ? captureRingStyle
              : playableSquareStyles
            : undefined,
        [isPlayable, isCapture]
      );

      const showIcon = classification && showPlayerMoveIcon && isLastMoveTo;

      return (
        <div
          ref={ref}
          style={{
            ...containerStyle,
            position: "relative",
            overflow: "visible",
            backgroundColor,
            outline: backgroundColor
              ? `1px solid ${backgroundColor}`
              : undefined,
            zIndex: showIcon ? 20 : undefined,
          }}
        >
          {highlightSquareStyle && <div style={highlightSquareStyle} />}
          {playableSquareStyle && <div style={playableSquareStyle} />}
          {children}
          {showIcon && (
            <Image
              src={`/icons/${classification}.png`}
              alt="move-icon"
              width={Math.min(28, boardSize * 0.035)}
              height={Math.min(28, boardSize * 0.035)}
              style={{
                position: "absolute",
                top: "-12%",
                right: "-12%",
                zIndex: 100,
                imageRendering: "auto",
                filter: boardHue ? `hue-rotate(-${boardHue}deg)` : undefined,
                transform: "translateZ(3px)",
                pointerEvents: "none",
              }}
            />
          )}
        </div>
      );
    }),
    (prev, next) => {
      // aggressive layout-shift prevention cache
      if (prev.square !== next.square) return false;
      if (prev.children !== next.children) return false;
      return true;
    }
  );

  SquareRendererComponent.displayName = "SquareRenderer";

  return SquareRendererComponent;
}

const rightClickSquareStyle = (color?: string): CSSProperties => ({
  position: "absolute",
  inset: "-0.5px",
  backgroundColor: color || "#eb6150",
  opacity: "0.8",
  zIndex: 10,
  pointerEvents: "none",
});

const activeSquareStyle: CSSProperties = {
  position: "absolute",
  inset: "-0.5px",
  backgroundColor: "#fad541",
  opacity: 0.5,
  zIndex: 10,
  pointerEvents: "none",
};

const playableSquareStyles: CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundColor: "rgba(0,0,0,.14)",
  padding: "35%",
  backgroundClip: "content-box",
  borderRadius: "50%",
  boxSizing: "border-box",
  zIndex: 10,
  pointerEvents: "none",
};

const captureRingStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  borderRadius: "50%",
  boxSizing: "border-box",
  background:
    "radial-gradient(transparent 60%, rgba(0,0,0,.14) 60%, rgba(0,0,0,.14) 100%)",
  zIndex: 10,
  pointerEvents: "none",
};

const previousMoveSquareStyle = (
  moveClassification?: MoveClassification | null
): CSSProperties => ({
  position: "absolute",
  inset: "-0.5px",
  backgroundColor:
    moveClassification && moveClassification !== MoveClassification.Opening
      ? CLASSIFICATION_COLORS[moveClassification]
      : "#fad541",
  opacity: 0.5,
  zIndex: 10,
  pointerEvents: "none",
});
