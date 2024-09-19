import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import clsx from 'clsx'
import { setReplaceIndex, setImages, setReplaceMode } from "../features/replace/replaceSlice";
import { photosEnhance } from '../api/image'
import {useActiveUnmute} from "../api/useUnmutes";
import {updateUnmuteInCart} from "../api/cart";
import {updateUnmutes} from "../features/user/userSlice";

export const ReplacePage = () => {
    const dispatch = useDispatch();
    const {activeUnmute} = useActiveUnmute()
    const activeUnmuteIndex = useSelector(state => state.user.activeUnmuteIndex)
    const replaceIndex = useSelector(state => state.replace.replaceIndex)
    const replaceMode = useSelector(state => state.replace.replaceMode)
    const afterImage = useSelector(state => state.replace.afterImage)

    useEffect(() => {
        if (activeUnmute && replaceIndex !== activeUnmuteIndex && replaceMode) {
            handleEnhance()
        }
    }, [activeUnmute, replaceIndex, activeUnmuteIndex, replaceMode])

    useEffect(() => {
        if (activeUnmute && !activeUnmute.properties._enhanced) {
            dispatch(setReplaceMode(true))
        } else {
            removeReplaceMode()
        }
        return () => {
            removeReplaceMode()
        }
    }, [activeUnmuteIndex, activeUnmute])

    // Function to simulate the image enhancement process
    const handleEnhance = async () => {
        if (activeUnmute.properties._images.length) {
            dispatch(setReplaceIndex(activeUnmuteIndex))
            const img = activeUnmute.properties._images[0]
            const key = img.split('/').slice(-2).join('/')
            const file = await photosEnhance(key)
            dispatch(setImages({
                beforeImage: img,
                afterImage: 'https://unmute-stage.s3.eu-north-1.amazonaws.com/undefined/923_1708442366.png', // TODO set real response images
            }))
        }
    };

    const removeReplaceMode = () => {
        dispatch(setReplaceMode(false))
        dispatch(setReplaceIndex(-1))
    }

    const onYes = () => {
        updateUnmuteInCart({
            key: activeUnmute.key,
            properties: {
                ...activeUnmute.properties,
                _images: [afterImage],
                _enhanced: true,
            },
        }).then((data) => {
            dispatch(updateUnmutes(data.data.items));
            removeReplaceMode()
        });
    }

    return (
            <div className={clsx("pb-[80px]", {'hidden': !replaceMode})}>
                <style>{`.audio-hidden-replace {display: none;}`}</style>
                <div className="mt-16 flex flex-row justify-center items-center gap-4">
                    <button
                        onClick={removeReplaceMode}
                        className="font-serif text-white bg-rose-500 border border-rose focus:outline-none hover:bg-rose-600 focus:ring-4 focus:ring-rose font-medium rounded-lg px-8 py-2.5 cursor-pointer">
                        No thanks
                    </button>
                    <button
                        className="font-serif text-white bg-black border border-rose transition duration-200 ease-out focus:outline-none hover:bg-gray-800 focus:ring-4 focus:ring-rose font-medium rounded-lg px-4 py-2.5 cursor-pointer"
                        onClick={onYes}
                    >
                        Yes (+49DKK)
                    </button>
                </div>

                <p className={"font-serif text-rose-500 text-2xl text-center leading-tight mt-10"}>
                    AI-Enhance your photo
                </p>
            </div>
        )
};
