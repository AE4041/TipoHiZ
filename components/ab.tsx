'use client';
import React, { useEffect, useRef } from 'react';
import { userConfigStore, wordStore } from '../store';
import { setCaretRef, setRef, setWordList } from '../store/actions/WordActions';
import classNames from 'classnames';

const TextArea: React.FC = () => {
    const { type } = userConfigStore((state) => state);
    const { wordList, activeWord, userInput, typedHistory } = wordStore((state) => state);

    const caretRef = useRef<HTMLSpanElement>(null);
    const activeWordRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setRef(activeWordRef);
        setCaretRef(caretRef);
    }, [caretRef, activeWordRef]);

    useEffect(() => {
        import(`../modules/TextFiles/${type}.json`).then((word) => {
            setWordList(word.default);
        });
    }, [type]);

    // Prevent spacebar and extra characters beyond the active word length
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const keyPressed = event.key;

        // Prevent spacebar from being entered
        if (keyPressed === ' ') {
            event.preventDefault();
        }

        // Prevent typing extra characters if the length of userInput exceeds the active word
        if (userInput.length >= activeWord.length && keyPressed !== 'Backspace') {
            event.preventDefault();
        }
    };

    return (
        <div
            className="flex flex-wrap overflow-hidden text-xl select-none h-28 sm:px-10 font-poppins md:text-2xl selection:bg-yellow-300 selection:text-white text-input"
            onKeyDown={handleKeyDown}
        >
            {/* Map through the word list and render the words */}
            {wordList?.map((word, index) => {
                const isActive = activeWord === word && typedHistory.length === index;

                return (
                    <div
                        key={word + index}
                        className="relative mt-0 mx-[7px] mb-1"
                        ref={isActive ? activeWordRef : null}
                    >
                        {/* Display caret if the word is active */}
                        {isActive ? (
                            <span
                                ref={caretRef}
                                id="caret"
                                className="animate-blink rounded-sm text-green-400 flex items-start w-[.08em] h-7 top-1 bg-cursor justify-start text-cursor absolute"
                                style={{
                                    left: userInput.length * 12.3833,
                                }}
                            />
                        ) : null}

                        {/* Render each character in the word */}
                        {word.split('').map((char, charIndex) => {
                            // Check if the character at charIndex matches the user input at the same position
                            const isCorrect = userInput[charIndex] !== undefined && activeWord[charIndex] === char;

                            return (
                                <span
                                    key={char + charIndex}
                                    className={classNames({
                                        'text-green-500': isCorrect, // Highlight correct typed characters
                                    })}
                                >
                                    {char}
                                </span>
                            );
                        })}

                        {/* Do not render extra letters for active words */}
                        {!isActive && typedHistory[index]
                            ? typedHistory[index]
                                .slice(wordList[index].length)
                                .split('')
                                .map((char, charId) => (
                                    <span key={char + charId} className="wrong extra">
                                        {char}
                                    </span>
                                ))
                            : null}
                    </div>
                );
            })}
        </div>
    );
};

export default TextArea;
