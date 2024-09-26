import { Modal, Button, Box, Typography } from '@mui/material';

export const ConfirmModal = (props) => {
    let {
        title = 'Confirm Delete',
        children = 'Are you sure you want to delete?',
        cancelText = 'Cancel',
        confirmText = 'Delete',
        onCancel = () => {},
        onConfirm = () => {},
    } = props;

    return (
        <Modal
            open={true}
            onClose={onCancel}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
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
                <Typography variant="h6" component="h2">
                    {title}
                </Typography>
                <Typography id="modal-description" sx={{ mt: 2 }}>
                    {children}
                </Typography>
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                    <Button variant="outlined" color="primary" onClick={onCancel}>
                        {cancelText}
                    </Button>
                    <Button variant="contained" color="error" onClick={onConfirm}>
                        {confirmText}
                    </Button>
                </Box>
            </Box>
        </Modal>
    )
};
