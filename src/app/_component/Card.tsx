import {
    CodeBlockEditorDescriptor,
    MDXEditor,
    codeBlockPlugin,
    codeMirrorPlugin,
    headingsPlugin,
    linkPlugin,
    listsPlugin,
    markdownShortcutPlugin,
    quotePlugin,
    useCodeBlockEditorContext,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import "@/app/github-markdown-light.css";
import { useCardsStore } from "@/state/store";
import { useContext, useEffect, useRef, useState } from "react";
import { WhiteboardContext } from "./WhiteboardProvider";
import { useChat } from "ai/react";

let isAIResponding = false;
const PlainTextCodeEditorDescriptor: CodeBlockEditorDescriptor = {
    // always use the editor, no matter the language or the meta of the code block
    match: (language, meta) => true,
    // You can have multiple editors with different priorities, so that there's a "catch-all" editor (with the lowest priority)
    priority: 0,
    // The Editor is a React component
    Editor: (props) => {
        const cb = useCodeBlockEditorContext();
        const textareaRef = useRef<HTMLTextAreaElement>(null);

        const adjustHeight = () => {
            const textarea = textareaRef.current;
            if (textarea) {
                textarea.style.height = "auto";
                textarea.style.height = `${textarea.scrollHeight + 20}px`;
            }
        };

        useEffect(() => {
            adjustHeight();
        }, [props.code]);

        // stops the proppagation so that the parent lexical editor does not handle certain events.
        return (
            <pre onKeyDown={(e) => e.nativeEvent.stopImmediatePropagation()}>
                <textarea
                    ref={textareaRef}
                    id="code"
                    className="w-full resize-none outline-none bg-transparent text-nowrap"
                    defaultValue={props.code}
                    onChange={(e) => cb.setCode(e.target.value)}
                />
            </pre>
        );
    },
};

export default function Card(props: {
    position: { x: number; y: number };
    text: string;
    id: string;
    ai?: {
        prompt: string;
    };
    width: number;
}) {
    const { x, y } = props.position;
    const { text, id } = props;
    const { setSelectedCardID, selectedCardID, setResizeCardID } =
        useContext(WhiteboardContext);
    const { removeCard, removeAICard, updateText, addAICard, addCard } =
        useCardsStore();
    const [isDropDownMenuOpen, setIsDropDownMenuOpen] = useState(false);

    const { append, messages } = useChat({
        onFinish(message) {
            addCard(message.content.trim(), {
                x,
                y,
            });
            removeAICard(id);
        },
    });

    useEffect(() => {
        if (props.ai && !isAIResponding) {
            isAIResponding = true;
            append({
                role: "user",
                content: `${props.ai.prompt}. response using markdown`,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cardProps = {
        tabIndex: 0,
        style: { transform: `translate(${x}px,${y}px)`, width: props.width },
        onContextMenu: (e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsDropDownMenuOpen(true);
        },
        onMouseDown: (e) => {
            if (e.button !== 2) {
                e.stopPropagation();
            }
            if (e.button === 0) {
                setSelectedCardID(id);
            }
        },
        onMouseUp: () => {
            setSelectedCardID("");
        },
        onDoubleClick: (e) => e.stopPropagation(),
        onKeyDown: (e) => {
            if (e.key === "Delete") {
                removeCard(id);
                removeAICard(id);
            }
        },
    } satisfies React.HTMLAttributes<HTMLDivElement>;

    const editDivProps = {
        onMouseDown: (e) => {
            if (e.button !== 2) {
                e.stopPropagation();
            }
            setSelectedCardID("");
        },
        onKeyDown: (e) => {
            if (e.key === "Delete") {
                e.stopPropagation();
            }
        },
        onContextMenu: (e) => {
            e.stopPropagation();
            e.preventDefault();
        },
    } satisfies React.HTMLAttributes<HTMLDivElement>;

    const resizeDivProps = {
        onMouseDown: (e) => {
            e.stopPropagation();
            if (e.button === 0) {
                setResizeCardID(id);
            }
        },
        onMouseUp: () => {},
        onMouseMove: (e) => {},
    } satisfies React.HTMLAttributes<HTMLDivElement>;

    function onAskAI() {
        addAICard(text, {
            x: x + props.width + 200,
            y: y,
        });
        setIsDropDownMenuOpen(false);
    }

    useEffect(() => {
        function closeDropDownMenu() {
            setIsDropDownMenuOpen(false);
        }
        window.addEventListener("mousedown", closeDropDownMenu);
        return () => {
            window.removeEventListener("mousedown", closeDropDownMenu);
        };
    }, []);

    return (
        <div
            {...cardProps}
            className={`absolute bg-white rounded-md cursor-pointer flex flex-col focus:ring-2 ring-sky-300 resize-x ${
                selectedCardID === id ? "select-none" : ""
            }`}
        >
            <div
                {...resizeDivProps}
                className="absolute h-full w-1 right-0 transition hover:bg-sky-300 cursor-w-resize"
            ></div>
            <div className="p-4 rounded-t-md hover:bg-gray-50 transition-all"></div>
            {isDropDownMenuOpen && (
                <div
                    className="absolute right-0 -top-5 p-2 bg-gray-800 text-white rounded-lg z-10 w-32"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <button
                        className="transition hover:bg-gray-700 cursor-pointer w-full py-1"
                        onClick={onAskAI}
                    >
                        Ask AI
                    </button>
                    <button
                        className="transition hover:bg-gray-700 cursor-pointer w-full py-1"
                        onClick={() => {
                            removeCard(id);
                            removeAICard(id);
                        }}
                    >
                        Delete
                    </button>
                </div>
            )}
            <div className="cursor-text p-4" {...editDivProps}>
                {props.ai ? (
                    <div className="prose">
                        {messages.find((d) => d.role !== "user")?.content}
                    </div>
                ) : (
                    <MDXEditor
                        plugins={[
                            headingsPlugin(),
                            listsPlugin(),
                            linkPlugin(),
                            quotePlugin(),
                            markdownShortcutPlugin(),
                            codeBlockPlugin({
                                codeBlockEditorDescriptors: [
                                    PlainTextCodeEditorDescriptor,
                                ],
                            }),
                        ]}
                        onChange={(e) => updateText(id, e)}
                        className="-mt-4 prose w-full"
                        markdown={text}
                    />
                )}
                {/* {props.ai
                    ? messages.find((d) => d.role !== "user")?.content ?? ""
                    : text} */}
            </div>
        </div>
    );
}
