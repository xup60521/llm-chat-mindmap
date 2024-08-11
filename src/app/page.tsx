"use client";

import Card from "@/app/_component/Card";
import { ClientOnly } from "@/app/_component/Client-only";
import Whiteboard from "@/app/_component/Whiteboard";
import WhiteboardPositionController from "@/app/_component/WhiteboardController";
import { WhiteboardProvider } from "@/app/_component/WhiteboardProvider";
import { useCardsStore } from "@/state/store";
import { useChat } from "ai/react";

export default function App() {
    const { cards, aiCards } = useCardsStore();

    return (
        <main className="w-screen h-screen overflow-hidden bg-gray-100 ">
            <WhiteboardProvider>
                <Whiteboard>
                    {cards.map((item) => {
                        return (
                            <Card {...item} key={item.id} width={item.width} />
                        );
                    })}
                    {aiCards.map((item) => {
                        return (
                            <Card
                                {...item}
                                key={item.id}
                                ai={{ prompt: item.prompt }}
                                width={item.width}
                            />
                        );
                    })}
                    <ClientOnly>
                        {() => (
                            <Card
                                position={{ x: 0, y: 0 }}
                                id="asdkajo"
                                text={`
                            code test
                            \`\`\`tsx
                                const a = "123
                            \`\`\`
                            asd
                            `.trim()}
                                key={"test"}
                                width={456}
                            />
                        )}
                    </ClientOnly>
                </Whiteboard>
                <WhiteboardPositionController />
            </WhiteboardProvider>
            <ClientOnly>
                {() => (
                    <>
                        <p className="absolute bottom-2 left-2 text-black">{`${window.innerWidth} ${window.outerWidth}`}</p>
                    </>
                )}
            </ClientOnly>
        </main>
    );
}

function DisplayCards() {
    const { cards } = useCardsStore();
    return (
        <>
            {cards.map((item) => {
                return <Card {...item} key={item.id} />;
            })}
        </>
    );
}

function Chat() {
    const { messages, input, handleInputChange, handleSubmit } = useChat({
        onFinish: (messages) => console.log(messages),
    });
    return (
        <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch min-h-0">
            {messages.map((m) => (
                <div key={m.id} className="whitespace-pre-wrap">
                    {m.role === "user" ? "User: " : "AI: "}
                    {m.content}
                </div>
            ))}

            <form onSubmit={handleSubmit}>
                <input
                    className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl text-black"
                    value={input}
                    placeholder="Say something..."
                    onChange={handleInputChange}
                />
            </form>
        </div>
    );
}
