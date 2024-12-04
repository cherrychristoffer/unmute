import React from 'react';
import { Modal, Button, Box, Typography, Fade, Backdrop } from '@mui/material';
import VButton from './VButton';

export const ConfirmModal = (props) => {
  let {
    title = props.title ? props.title : 'Vil du slette?',
    children = props.text ? props.text : `Bekræft, at du vil slette ${props.type}. Handlingen kan ikke fortrydes.`,
    cancelText = 'Anuller',
    confirmText = props.buttonText ? props.buttonText : 'Ja, slet',
    onCancel = () => {
    },
    onConfirm = () => {
    },
  } = props;

  return (
    <Modal
      open={true}
      onClose={onCancel}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Fade in={true}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <h4 className={'text-3xl font-semibold tracking-tight'}>
            {title}
          </h4>
          <p className={'mt-2 text-[14px] tracking-tight text-zinc-600'}>
            {children}
          </p>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
            <VButton text={cancelText} color={'white'} onClick={onCancel} />
            <VButton text={confirmText} color={props.buttonText ? 'rose' : 'red'} onClick={onConfirm} />
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};
