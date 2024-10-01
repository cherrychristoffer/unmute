import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import clsx from 'clsx'
import { setReplaceIndex, setReplaceMode } from "../features/replace/replaceSlice";
import { photosEnhance } from '../api/image'
import {useActiveUnmute} from "../api/useUnmutes";
import {duplicateUnmuteToCart, removeUnmuteInCart, updateUnmuteInCart} from "../api/cart";
import {replaceUnmute, updateUnmutes} from "../features/user/userSlice";
import {getFileUrl, uploadFile} from "../api/aws";

function base64ToFile(base64String, filename) {
    const byteString = atob(base64String.split(',')[1]); // Remove the 'data:image/png;base64,' part
    const mimeType = base64String.split(',')[0].split(':')[1].split(';')[0]; // Extract mime type

    const byteNumbers = new Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        byteNumbers[i] = byteString.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    const file = new File([blob], filename, { type: mimeType });

    return file;
}


export const ReplacePage = () => {
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch();
    const {activeUnmute} = useActiveUnmute()
    const activeUnmuteIndex = useSelector(state => state.user.activeUnmuteIndex)
    const replaceMode = useSelector(state => state.replace.replaceMode)

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
    // const handleEnhance = async () => {
    //     if (activeUnmute.properties._images.length) {
    //         dispatch(setReplaceIndex(activeUnmuteIndex))
    //         const img = activeUnmute.properties._images[0]
    //         const key = img.split('/').slice(-2).join('/')
    //         return await photosEnhance(key)
    //     }
    // };

    const removeReplaceMode = () => {
        dispatch(setReplaceMode(false))
        dispatch(setReplaceIndex(-1))
    }

    const handleChange = async (event) => {
        const uuid = activeUnmute._uuid;
        const file = event.target.files[0];
        setLoading(true)

        uploadFile({
            path: uuid,
            file,
        }).then(() => {
            const fileUrl = getFileUrl(`${uuid}/${file.name}`);
            updateUnmuteInCart({
                key: activeUnmute.key,
                properties: {
                    ...activeUnmute.properties,
                    _images: [fileUrl],
                    _original_images: [fileUrl],
                },
            }).then(({ data }) => {
                dispatch(updateUnmutes(data.items));
                setLoading(false)
            });
        });
    }

    return (
            <div className={clsx("flex flex-col items-center", {'hidden': !activeUnmute?.properties?._images?.length})}>
                <style>{`.audio-hidden-replace {display: none;}`}</style>
                <label
                    className="text-white bg-rose-500 border border-rose focus:outline-none hover:bg-rose-600 focus:ring-4 focus:ring-rose font-medium rounded-lg px-16 py-2.5 cursor-pointer"
                    htmlFor={`upload-nyt-oto-${activeUnmute?.key}`}>
                    {loading ? 'Loading...' : 'Upload nyt foto'}
                </label>
                <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                    id={`upload-nyt-oto-${activeUnmute?.key}`}
                    onChange={handleChange}
                />
            </div>
        )
};
