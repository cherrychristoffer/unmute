'use client'

// pintura
import '@pqina/pintura/pintura.css'
import {
  // editor
  openEditor,
  locale_en_gb,
  createDefaultImageReader,
  createDefaultImageWriter,
  createDefaultImageOrienter,
  createDefaultShapePreprocessor,
  legacyDataToImageState,
  processImage,
  createDefaultColorOptions,

  // plugins
  setPlugins,
  plugin_crop,
  plugin_crop_locale_en_gb,
  plugin_finetune,
  plugin_finetune_locale_en_gb,
  plugin_finetune_defaults,
  plugin_filter,
  plugin_filter_locale_en_gb,
  plugin_filter_defaults,
  markup_editor_defaults,
  markup_editor_locale_en_gb,
  plugin_resize,
  plugin_resize_locale_en_gb,
  getEditorDefaults,
} from '@pqina/pintura'

// filepond
import 'filepond/dist/filepond.min.css'
import { FilePond, registerPlugin } from 'react-filepond'
import FilePondPluginImageEditor from '@pqina/filepond-plugin-image-editor'
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'
import da_DK from 'filepond/locale/da-dk'

registerPlugin(FilePondPluginImageEditor)
registerPlugin(FilePondPluginFileValidateType)

// pintura
setPlugins(plugin_crop, plugin_finetune, plugin_filter)

const editorDefaults = getEditorDefaults()

import { renderToString } from 'react-dom/server'
import { forwardRef, React, useEffect, useState } from 'react'
import { useActiveUnmute } from '../api/useUnmutes'
import { deleteFile, getFileUrl, uploadFile } from '../api/spaces'
import {
  addUnmuteToCart,
  removeUnmuteInCart,
  updateUnmuteInCart,
} from '../api/cart'
import { useDispatch, useSelector } from 'react-redux'
import {
  addUnmute,
  deleteUnmute,
  updateUnmutes,
} from '../features/user/userSlice'
import { PlusIcon } from '../assets/icons/icon_plus'
import { setChooseNewImage } from '../features/image/imageSlice'

const FileUpload = forwardRef(
  (
    {
      horizontal = false,
      cropFormat = null,
      paste = false,
      isActive = false,
      newUnmute = false,
      uploading,
      uploaded,
      removed,
    },
    ref
  ) => {
    const [ready, setReady] = useState(false)
    const dispatch = useDispatch()
    const [resetImageState, setResetImageState] = useState(false)
    const chooseNewImage = useSelector((state) => state.image.chooseNewImage)
    const { unmutes } = useSelector((state) => state.user)
    const { activeUnmute } = useActiveUnmute()

    useEffect(() => {
      if (chooseNewImage && isActive && ref?.current) {
        ref.current.browse()
        setResetImageState(true)
        dispatch(setChooseNewImage(false))
      }
    }, [chooseNewImage, isActive, ref])

    useEffect(() => {
      setReady(true)
    }, [])

    function labelString() {
      return renderToString(
        <div
          className={
            'w-[68px] h-[68px] bg-rose-500 hover:bg-rose-700 cursor-pointer fill-white rounded-full flex items-center justify-center absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-10'
          }
        >
          <PlusIcon size={40} />
          <span className={'absolute top-[80px] text-center !text-[16px]'}>
            Vælg foto
          </span>
        </div>
      )
    }

    const uploadImage = async (metadata, file) => {
      const uuid = activeUnmute.properties._uuid
      uploadFile({
        file,
        path: uuid,
      })
        .then(async (path) => {
          if (path) {
            const url = getFileUrl(path)
            await updateInCart(activeUnmute, [url])
          }
        })
        .catch((err) => {
          console.error(err)
        })
    }

    const updateInCart = async (item, newFileUrls) => {
      const mergeImageUrl = await mergeImages(
        item.properties._uuid,
        [...newFileUrls, ...(item.properties._images || [])],
        item.properties._orientation,
        item.properties._collage ? item.properties._collage_type : null,
        item.properties._passepartout
      )
      const cart = await updateUnmuteInCart({
        key: item.key,
        properties: {
          ...item.properties,
          _images: [...newFileUrls, ...(item.properties._images || [])], // Place new images first
          _image_state: resetImageState ? null : item.properties._image_state,
          _cart_image: mergeImageUrl,
          _original_images: [
            ...newFileUrls,
            ...(item.properties._original_images || []),
          ], // Place new original images first
        },
      })
      setResetImageState(false)
      dispatch(updateUnmutes(cart.data.items))
    }

    const addNewUnmute = async (metadata, file) => {
      addUnmuteToCart({ quantity: 1, extra: true }).then(({ data }) => {
        const unmute = data.items?.[0]
        if (!unmute) return

        dispatch(addUnmute(unmute))
        const uuid = unmute.properties._uuid
        uploadFile({
          file,
          path: uuid,
        })
          .then(async (path) => {
            if (path) {
              const url = getFileUrl(path)
              await updateInCart(unmute, [url])
            }
          })
          .catch((err) => {
            console.error(err)
          })
      })
    }

    const handleDelete = (key) => {
      const unmuteToUpdate = unmutes.find((unmute) => unmute.key === key)
      deleteFile({
        path: unmuteToUpdate.properties._images[0],
      }).then(() => {
        removeUnmuteInCart(unmuteToUpdate.properties._uuid).then(() => {
          dispatch(deleteUnmute(unmuteToUpdate.key))
        })
      })
    }

    if (!ready) {
      return null
    }

    // allowFileTypeValidation
    // acceptedFileTypes={['image/*']}

    return (
      <FilePond
        ref={ref}
        {...da_DK}
        allowMultiple={false}
        allowPaste={paste}
        allowSyncAcceptAttribute={true}
        allowFileTypeValidation
        acceptedFileTypes={['image/*']}
        name="files"
        labelIdle={labelString()}
        credits={false}
        stylePanelLayout={'integrated'}
        stylePanelAspectRatio={horizontal ? '4:3' : '3:4'}
        allowImageCrop={!!cropFormat}
        imageCropAspectRatio={cropFormat ?? null}
        allowImageTransform={!!cropFormat}
        allowImageEditor={true}
        styleImageEditorButtonEditItemPosition={'bottom center'}
        imageEditor={{
          legacyDataToImageState: legacyDataToImageState,
          createEditor: openEditor,
          imageReader: [
            createDefaultImageReader,
            {
              /* optional image reader options here */
            },
          ],
          imageWriter: [
            createDefaultImageWriter,
            {
              /* optional image writer options here */
            },
          ],
          imageProcessor: processImage,
          editorOptions: {
            ...editorDefaults,
            utils: ['crop', 'finetune', 'filter', 'resize'],
            imageOrienter: createDefaultImageOrienter(),
            shapePreprocessor: createDefaultShapePreprocessor(),
            ...plugin_finetune_defaults,
            ...plugin_filter_defaults,
            ...markup_editor_defaults,
            ...plugin_resize,
            locale: {
              ...locale_en_gb,
              ...plugin_crop_locale_en_gb,
              ...plugin_finetune_locale_en_gb,
              ...plugin_filter_locale_en_gb,
              ...markup_editor_locale_en_gb,
              ...plugin_resize_locale_en_gb,
            },
            imageCropAspectRatio:
              cropFormat === '1:1' ? 1 : cropFormat === '16:9' ? 16 / 9 : null,
          },
          fillOptions: {
            backgroundColor: [255, 255, 255, 0], // Transparent background
            ...Object.values(createDefaultColorOptions()),
          },
        }}
        onaddfilestart={() => uploading()}
        server={{
          // Custom process function for uploads
          process: (
            fieldName,
            file,
            metadata,
            load,
            error,
            progress,
            abort
          ) => {
            if (newUnmute) {
              addNewUnmute(metadata, file)
                .then(() => {
                  load() // Notify FilePond that the upload is complete
                })
                .catch(() => error('Upload failed'))
                .then(() => {
                  uploaded()
                })
            } else {
              uploadImage(metadata, file)
                .then(() => {
                  load() // Notify FilePond that the upload is complete
                })
                .catch(() => error('Upload failed'))
                .then(() => {
                  uploaded()
                })
            }
          },
          // Custom remove function for deletions
          remove: (source, load, error) => {
            handleDelete(source)
            load() // Notify FilePond that the deletion is complete
          },
        }}
      />
    )
  }
)
FileUpload.displayName = 'FileUpload'
export default FileUpload
