import type { Unpacked } from "@/lib/utils";
import { v4 } from "uuid";
import { z } from "zod";
import { create } from "zustand";

const STORAGE_KEY = "h-clone";
const cardSchema = z.array(
    z.object({
        id: z.string(),
        text: z.string(),
        position: z.object({ x: z.number(), y: z.number() }),
        width: z.number(),
    })
);

type Cards = z.infer<typeof cardSchema>;
type Card = Unpacked<Cards>;

interface CardsState {
    cards: Cards;
    aiCards: (Card & { prompt: string })[];
    load_localstorage: () => void;
    saveToLocalstorage: () => void;
    addCard: (text: string, position: { x: number; y: number }) => void;
    addAICard: (prompt: string, position: { x: number; y: number }) => void;
    resizeCard: (id: string, newWidth: number) => void;
    removeCard: (id: string) => void;
    removeAICard: (id: string) => void;
    updatePosition: (id: string, newPosition: { x: number; y: number }) => void;
    updateAICardPosition: (
        id: string,
        newPosition: { x: number; y: number }
    ) => void;
    updateText: (id: string, newText: string) => void;
}

export const useCardsStore = create<CardsState>((set, get) => ({
    cards: [],
    aiCards: [],
    load_localstorage() {
        const result = cardSchema.safeParse(
            JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}")
        );
        if (result.success) {
            set((state) => {
                state.cards = result.data;
                return { ...state };
            });
        }
    },
    saveToLocalstorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(get().cards));
    },
    addCard(text, position) {
        set((state) => {
            state.cards = [
                ...state.cards,
                {
                    id: v4(),
                    text,
                    position,
                    width: 384,
                },
            ];
            // saveToLocalstorage(state.cards)
            return { ...state };
        });
    },
    addAICard(prompt, position) {
        set((state) => {
            state.aiCards = [
                ...state.aiCards,
                {
                    id: v4(),
                    text: "",
                    position,
                    prompt,
                    width: 384,
                },
            ];
            // saveToLocalstorage(state.cards)
            return { ...state };
        });
    },
    resizeCard(id, newWidth) {
        set((state) => {
            state.cards = state.cards.map((d) => {
                if (d.id === id) {
                    d.width = newWidth;
                    return d;
                }
                return d;
            });
            // saveToLocalstorage(state.cards)
            return { ...state };
        });
    },
    removeCard(id) {
        set((state) => {
            state.cards = state.cards.filter((d) => d.id !== id);
            // saveToLocalstorage(state.cards)
            return { ...state };
        });
    },
    removeAICard(id) {
        set((state) => {
            state.aiCards = state.aiCards.filter((d) => d.id !== id);
            // saveToLocalstorage(state.cards)
            return { ...state };
        });
    },
    updatePosition(id, positionOffset) {
        set((state) => {
            state.cards = state.cards.map((d) => {
                if (d.id === id) {
                    d.position.x += positionOffset.x;
                    d.position.y += positionOffset.y;
                    return d;
                }
                return d;
            });
            // saveToLocalstorage(state.cards)
            return { ...state };
        });
    },
    updateAICardPosition(id, positionOffset) {
        set((state) => {
            state.aiCards = state.aiCards.map((d) => {
                if (d.id === id) {
                    d.position.x += positionOffset.x;
                    d.position.y += positionOffset.y;
                    return d;
                }
                return d;
            });
            // saveToLocalstorage(state.cards)
            return { ...state };
        });
    },
    updateText(id, newText) {
        set((state) => {
            state.cards = state.cards.map((d) => {
                if (d.id !== id) {
                    return d;
                }
                d.text = newText;
                return d;
            });
            // saveToLocalstorage(state.cards)
            return { ...state };
        });
    },
}));

// function saveToLocalstorage(data: Cards) {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
// }
