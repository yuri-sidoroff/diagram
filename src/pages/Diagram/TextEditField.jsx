import React, {
    createRef, useContext, useEffect, useRef, useState,
} from 'react';
import {
    Box, Paper, Typography, InputBase, IconButton, Popover, Radio, RadioGroup,
} from '@material-ui/core';
import { Delete, ColorLens, DoneOutline } from '@material-ui/icons';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import * as colors from '@material-ui/core/colors';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import useOnClickOutside from '../../hooks/useOnClickOutside';
import DiagramContext from '../../context/DiagramContext';

const useStyles = makeStyles((theme) => ({
    lineWrapper: {
        display: 'flex',
        width: '100%',
        minWidth: theme.spacing(36),
    },
    inputStyle: {
        flex: 1,
        width: '100%',
        fontSize: 'small',
        color: theme.palette.common.black,
        padding: theme.spacing(0.5),
        backgroundColor: theme.palette.common.white,
        borderRadius: theme.spacing(0.5),
    },
    inputBaseRoot: {
        padding: 0,
        '&::-webkit-scrollbar': {
            width: theme.spacing(0.75),
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#BEBEBE',
            borderRadius: theme.spacing(0.5),
        },
    },
    textFieldWrapper: {
        flex: 1,
    },
    textFieldStyle: {
        flex: 1,
        fontSize: 'small',
        lineHeight: 1.2,
        padding: theme.spacing(0.5),
        wordBreak: 'break-word',
    },
    lineSize: {
        minWidth: theme.spacing(33),
    },
    actionButtons: {
        position: 'absolute',
        bottom: 0,
    },
    colorLineButton: {
        padding: theme.spacing(0.5),
        color: colors.blue[700],
    },
    deleteLineButton: {
        padding: theme.spacing(0.5),
        color: colors.red[700],
    },
    connectorWrapper: {
        display: 'flex',
        width: theme.spacing(1),
        alignItems: 'center',
    },
    connector: {
        height: theme.spacing(1.5),
        width: '100%',
        backgroundColor: theme.palette.grey[700],
        borderTopLeftRadius: theme.spacing(1),
        borderBottomLeftRadius: theme.spacing(1),
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: theme.palette.grey[600],
        },
    },
    deleteLine: {
        backgroundColor: colors.deepOrange[700],
    },
    inputColor: {
        color: theme.palette.common.white,
        width: theme.spacing(3),
        border: `1px solid ${theme.palette.common.white}`,
        height: theme.spacing(3),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 0,
        '&:hover': {
            opacity: 0.9,
        },
    },
    inputColorIcon: {
        color: theme.palette.common.white,
        '&:hover': {
            opacity: 0.9,
        },
    },
    inputColorWrapper: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: theme.spacing(33),
    },
    inputColorIconUnchanged: {
        width: '100%',
        height: '100%',
        '&:hover': {
            opacity: 0.9,
        },
    },
}));

function TextEditField({
    text,
    line = false,
    answerId,
    blockId,
    color,
    deleteHandler,
    changeColor,
    extendedClass,
}) {
    const classes = useStyles();
    const diagramState = useContext(DiagramContext);
    const {
        lineAddMode,
        setLineAddMode,
        lines,
        setAnswerText,
        setHeaderText,
        startAddingLine,
        setLineColor,
        clearLineColor,
        deleteLine,
    } = diagramState;
    const [editMode, setEditMode] = useState(false);
    const [actionMode, setActionMode] = useState(false);
    const [deleteLineMode, setDeleteLineMode] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const theme = useTheme();
    const refBlock = useRef();
    const refInput = useRef();

    const handleTextEdit = (textEdit) => {
        if (line) {
            setAnswerText(blockId, answerId, textEdit);
        } else {
            setHeaderText(blockId, textEdit);
        }
    };

    const handleOpenChangeColor = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseChangeColor = () => {
        setAnchorEl(null);
    };

    const openChangeColor = Boolean(anchorEl);
    const idChangeColor = openChangeColor ? 'change-color' : undefined;

    useOnClickOutside(refBlock, () => setEditMode(false));

    useEffect(() => {
        if (editMode && refInput) {
            refInput.current.focus();
        }
    }, [editMode]);

    return (
        <Box
            ref={refBlock}
            className={clsx(classes.lineWrapper, line && classes.lineSize)}
            onMouseOver={() => setActionMode(true)}
            onMouseLeave={() => {
                if (!openChangeColor) setActionMode(false);
            }}
        >
            {editMode
                ? (
                    <InputBase
                        inputRef={refInput}
                        multiline
                        rowsMax={5}
                        className={clsx(classes.inputStyle, extendedClass)}
                        classes={{ input: classes.inputBaseRoot }}
                        value={text}
                        onChange={(event) => {
                            handleTextEdit(event.target.value);
                        }}
                        onKeyDown={(event) => {
                            if (event.keyCode === 13 && !event.shiftKey) {
                                event.preventDefault();
                                setEditMode(false);
                            }
                        }}
                    />
                )
                : (
                    <strong className={classes.textFieldWrapper} onDoubleClick={() => setEditMode(true)}>
                        <Typography className={clsx(classes.textFieldStyle, extendedClass)}>{text}</Typography>
                    </strong>
                )}
            {actionMode && !editMode && (
                <Box className={classes.actionButtons} right={line ? theme.spacing(2) : 0}>
                    <IconButton
                        id={idChangeColor}
                        className={classes.colorLineButton}
                        onClick={handleOpenChangeColor}
                    >
                        <ColorLens fontSize="small" />
                    </IconButton>
                    <IconButton
                        className={classes.deleteLineButton}
                        onClick={() => deleteHandler(line ? answerId : blockId)}
                    >
                        <Delete fontSize="small" />
                    </IconButton>
                </Box>
            )}
            {line && (
                <Box className={classes.connectorWrapper}>
                    <Box
                        className={clsx(classes.connector, deleteLineMode && classes.deleteLine)}
                        id={answerId}
                        onMouseDown={() => {
                            if (!lines.find((item) => item.fromId.answerId === answerId)) {
                                startAddingLine(blockId, answerId);
                            }
                        }}
                        onMouseUp={() => {
                            if (lineAddMode) {
                                setLineAddMode(false);
                            }
                        }}
                        onMouseEnter={() => {
                            if (!lineAddMode && lines.find((item) => (item.fromId.answerId === answerId))) {
                                setDeleteLineMode(true);
                                setLineColor(answerId);
                            }
                        }}
                        onMouseLeave={() => {
                            if (!lineAddMode && deleteLineMode) {
                                clearLineColor();
                                setDeleteLineMode(false);
                            }
                        }}
                        onDoubleClick={() => {
                            if (deleteLineMode) {
                                deleteLine(answerId);
                                setDeleteLineMode(false);
                            }
                        }}
                    />
                </Box>
            )}
            <Popover
                open={openChangeColor}
                id={answerId}
                anchorEl={anchorEl}
                onClose={() => {
                    handleCloseChangeColor();
                    setActionMode(false);
                }}
                anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
                transformOrigin={{ vertical: 'center', horizontal: 'center' }}
            >
                <Paper>
                    <RadioGroup
                        className={classes.inputColorWrapper}
                        value={color}
                        onChange={(event) => {
                            changeColor(event.target.value, answerId);
                            handleCloseChangeColor();
                            setActionMode(false);
                        }}
                    >
                        {Object.keys(colors).filter((item) => item !== 'amber' && item !== 'common')
                            .map((item) => (
                                <Radio
                                    value={item}
                                    key={item}
                                    className={classes.inputColor}
                                    checkedIcon={<DoneOutline className={classes.inputColorIcon} />}
                                    icon={<Box className={classes.inputColorIconUnchanged} />}
                                    style={{ backgroundColor: colors[item][500] }}
                                />
                            ))}
                    </RadioGroup>
                </Paper>
            </Popover>
        </Box>
    );
}

export default observer(TextEditField);
