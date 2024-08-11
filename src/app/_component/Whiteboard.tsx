import { useContext, useEffect, useState } from "react";
import { useCardsStore } from "@/state/store";
import { WhiteboardContext } from "./WhiteboardProvider";

export default function Whiteboard(props: { children?: React.ReactNode }) {
    const [allowDrag, setAllowDrag] = useState(false);
    const {
        addCard,
        updatePosition,
        updateAICardPosition,
        load_localstorage,
        saveToLocalstorage,
        cards,
        resizeCard,
    } = useCardsStore();
    const {
        selectedCardID,
        setSelectedCardID,
        resizeCardID,
        setResizeCardID,
        whiteboardPosition,
        setWhiteboardPosition,
    } = useContext(WhiteboardContext);
    const { x, y } = whiteboardPosition;

    const whiteBoardEventHandler = {
        onWheel: (e) => {
            setWhiteboardPosition((prev) => {
                if (!e.shiftKey) {
                    prev.x -= e.deltaX;
                    prev.y -= e.deltaY;
                } else {
                    prev.x -= e.deltaY;
                }
                return { ...prev };
            });
        },
        onContextMenu: (e) => e.preventDefault(),
        onMouseDown: (e) => {
            setSelectedCardID("");
            setResizeCardID("");
            if (e.button === 2) {
                setAllowDrag(true);
            }
        },
        onMouseUp: () => {
            setAllowDrag(false);
            setSelectedCardID("");
            setResizeCardID("");
        },
        onMouseMove: (e) => {
            if (selectedCardID) {
                updatePosition(selectedCardID, {
                    x: e.movementX * (window.innerWidth / window.outerWidth),
                    y: e.movementY * (window.innerWidth / window.outerWidth),
                });
                updateAICardPosition(selectedCardID, {
                    x: e.movementX * (window.innerWidth / window.outerWidth),
                    y: e.movementY * (window.innerWidth / window.outerWidth),
                });
            }
            const currentCardWidth = cards.find(
                (d) => d.id === resizeCardID
            )?.width;
            if (resizeCardID && currentCardWidth) {
                resizeCard(
                    resizeCardID,
                    currentCardWidth > 50
                        ? currentCardWidth + e.movementX
                        : currentCardWidth
                );
            }
            if (!allowDrag) return;
            setWhiteboardPosition((prev) => {
                prev.x +=
                    // (e.movementX * (window.innerWidth / window.outerWidth));
                    e.movementX * 0.5;
                prev.y +=
                    // (e.movementY * (window.innerWidth / window.outerWidth));
                    e.movementY * 0.5;
                return { ...prev };
            });
        },
        onDoubleClick: (e) => {
            e.stopPropagation();
            e.preventDefault();
            addCard("# new card", {
                x: -x + e.pageX,
                y: -y + e.pageY,
            });
        },
    } satisfies React.HTMLAttributes<HTMLDivElement>;

    useEffect(() => {
        load_localstorage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (cards) {
            saveToLocalstorage();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cards]);

    return (
        <div
            className="w-full h-full overflow-hidden"
            {...whiteBoardEventHandler}
        >
            <div
                className="fix top-0 left-0"
                style={{ transform: `translate(${x}px,${y}px)` }}
            >
                {props.children}
            </div>
        </div>
    );
}
