import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { PinturaEditor } from '@pqina/react-pintura';
import { getFileUrl, uploadFile } from '../api/spaces';
import { updateUnmuteInCart } from '../api/cart';
import { updateUnmutes } from '../features/user/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { setOrientationChanged } from '../features/image/imageSlice';


import pinturaDa from '../pintura_da';

import '@pqina/pintura/pintura.css';
import {
  getEditorDefaults,

  // core locale
  locale_en_gb,

  // plugin locale
  plugin_crop_locale_en_gb,
  plugin_finetune_locale_en_gb,
  plugin_filter_locale_en_gb,
  plugin_annotate_locale_en_gb,
  plugin_decorate_locale_en_gb,
  plugin_redact_locale_en_gb,
  plugin_resize_locale_en_gb,
  plugin_sticker_locale_en_gb,
  plugin_frame_locale_en_gb,

  // markup editor locale
  markup_editor_locale_en_gb,
} from '@pqina/pintura';
//const editorConfig = getEditorDefaults();
const editorDefaults = {
  ...getEditorDefaults(),
  utils: ['crop', 'finetune', 'filter'],
};

const danishLocale = {
  ...locale_en_gb,
  ...plugin_crop_locale_en_gb,
  ...plugin_finetune_locale_en_gb,
  ...plugin_filter_locale_en_gb,
  ...plugin_annotate_locale_en_gb,
  ...plugin_decorate_locale_en_gb,
  ...plugin_resize_locale_en_gb,
  ...plugin_sticker_locale_en_gb,
  ...markup_editor_locale_en_gb,
  ...pinturaDa,
}

const PinturaPortal = ({ editorRef, activeUnmute, isOpen, onClose }) => {
  const horizontal = activeUnmute?.properties?._orientation === 'landscape';
  const orientationChanged = useSelector((state) => state.image.orientationChanged);
  const dispatch = useDispatch();

  const handleEditorLoad = () => {
    let imageState = activeUnmute?.properties?._image_state;

    if (imageState) {
      if (orientationChanged) {
        const resetDefaults = {
          crop: { x: 0, y: 0, width: 0, height: 0 },
          cropAspectRatio: null, // Default aspect ratio
          cropLimitToImage: true, // Presumed default
          cropMaxSize: { width: 32768, height: 32768 }, // Default max size
          cropMinSize: { width: 1, height: 1 }, // Default min size
        };

        // Create a deep copy of imageState
        const updatedImageState = structuredClone(imageState);

        // Assign defaults
        Object.keys(resetDefaults).forEach((key) => {
          if (key in updatedImageState) {
            // delete
            delete updatedImageState[key];
          }
        });
        editorRef.current.editor.history.write(updatedImageState);

        // Reset orientationChanged
        dispatch(setOrientationChanged(false));
      } else {
        // Directly update the editor history with the unmodified imageState
        editorRef.current.editor.history.write(imageState);
      }
    }
  };

  const uploadImage = async (data) => {
    const uuid = activeUnmute.properties._uuid;
    // create a custom name for the file and keep the extension
    const name = `edited-${Date.now()}.${data.src.name.split('.').pop()}`;
    uploadFile({
      file: data.dest,
      path: uuid,
      customName: name,
    }).then(async (path) => {
      if (path) {
        const url = getFileUrl(path);
        await updateInCart(data.imageState, activeUnmute, url);
      }
    }).catch((err) => {
      console.error(err);
    });
  };

  const updateInCart = async (imageState, item, newFileUrls) => {
    const cart = await updateUnmuteInCart({
      key: item.key,
      properties: {
        ...item.properties,
        _images: [newFileUrls],
        _image_state: imageState,
      },
    });
    dispatch(updateUnmutes(cart.data.items));
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-full h-full">
        <PinturaEditor
          ref={editorRef}
          {...editorDefaults}
          src={activeUnmute?.properties?._original_images[0]}
          imageCropAspectRatio={horizontal ? 4 / 3 : 3 / 4}
          onLoad={handleEditorLoad}
          onProcess={(data) => {
            uploadImage(data).then(() => {
              onClose();
            });
          }}
          locale={danishLocale}
        />
      </div>
    </div>,
    document.body,
  );
};

export default PinturaPortal;
