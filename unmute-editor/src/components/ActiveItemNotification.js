import { useState } from 'react'
import Snackbar from '@mui/material/Snackbar'
import { CloseIcon } from '../assets/icons/icon_close'

const ActiveItemNotification = () => {
  const [open, setOpen] = useState(true)

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={open}
        sx={{
          left: '0!important',
          right: '0!important',
          transform: 'none!important',
        }}
        onClose={handleClose}
      >
        <div
          className={
            'flex items-start gap-3 p-4 rounded-lg bg-white border border-zinc-200 text-[12px]'
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            width="20px"
            height="20px"
            className={'shrink-0'}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
            />
          </svg>
          Det er vigtigt, at du klikker på hvert billede og sikrer dig, at
          beskæringen er som ønsket.
          <button
            onClick={handleClose}
            className="w-[34px] h-[34px] rounded-full flex items-center justify-center"
          >
            <CloseIcon fill="black" />
          </button>
        </div>
      </Snackbar>
    </>
  )
}

export default ActiveItemNotification
