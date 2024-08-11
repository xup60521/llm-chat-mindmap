import { createContext, useState } from "react";
import { unknown } from "zod";

export const WhiteboardContext = createContext({
    selectedCardID: "",
    setSelectedCardID: unknown as React.Dispatch<React.SetStateAction<string>>,
    whiteboardPosition: { x: 0, y: 0 },
    setWhiteboardPosition: unknown as React.Dispatch<
        React.SetStateAction<{ x: number; y: number }>
    >,
    resizeCardID: "",
    setResizeCardID: unknown as React.Dispatch<React.SetStateAction<string>>,
});

const initPosition = {
    x: 0,
    y: 0,
};

export function WhiteboardProvider(props: { children: React.ReactNode }) {
    const [selectedCardID, setSelectedCardID] = useState("");
    const [resizeCardID, setResizeCardID] = useState("")
    const [whiteboardPosition, setWhiteboardPosition] = useState(initPosition);
    return (
        <WhiteboardContext.Provider
            value={{
                selectedCardID,
                setSelectedCardID,
                whiteboardPosition,
                setWhiteboardPosition,
                resizeCardID,
                setResizeCardID
            }}
        >
            {props.children}
        </WhiteboardContext.Provider>
    );
}