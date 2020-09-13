import React, {
    useRef, useEffect, useState, useContext,
} from 'react';
import { Box, Paper, IconButton } from '@material-ui/core';
import { AddCircleOutlined } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import Draggable from 'react-draggable';
import * as colors from '@material-ui/core/colors';
import { values, keys } from 'lodash';
import clsx from 'clsx';
import { observer } from 'mobx-react';
import TextEditField from './TextEditField';
import DiagramContext from '../../context/DiagramContext';

const useStyles = makeStyles((theme) => ({
    blockWrapper: {
        position: 'absolute',
        minWidth: theme.spacing(25),
        maxWidth: 'max-content',
        maxHeight: 'max-content',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: theme.palette.grey[200],
        zIndex: 2,
        '&:hover': {
            cursor: 'move',
        },
    },
    answerStyle: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'default',
        position: 'relative',
        borderTop: '1px solid rgba(0, 0, 0, 0.2)',
        borderLeft: '1px solid rgba(0, 0, 0, 0.2)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.2)',
        minHeight: theme.spacing(3.5),
        marginBottom: theme.spacing(0.5),
        paddingLeft: theme.spacing(1),
        borderTopLeftRadius: theme.spacing(1),
        borderBottomLeftRadius: theme.spacing(1),
    },
    headerStyle: {
        display: 'flex',
        flexDirection: 'column',
        maxWidth: theme.spacing(36),
        color: theme.palette.common.white,
        padding: theme.spacing(1),
        borderTopLeftRadius: theme.spacing(0.5),
        borderTopRightRadius: theme.spacing(0.5),
        cursor: 'default',
        position: 'relative',
    },
    bodyStyle: {
        display: 'flex',
        flexDirection: 'row',
        maxWidth: theme.spacing(38),
        paddingTop: theme.spacing(0.5),
    },
    otherField: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    addNewLineButton: {
        padding: theme.spacing(0.5),
        marginBottom: theme.spacing(0.5),
    },
    connectorWrapper: {
        display: 'flex',
        width: theme.spacing(1),
        alignItems: 'center',
        height: '100%',
        position: 'absolute',
        left: 0,
    },
    connector: {
        height: theme.spacing(1.5),
        width: '100%',
        backgroundColor: theme.palette.grey[700],
        borderTopRightRadius: theme.spacing(1),
        borderBottomRightRadius: theme.spacing(1),
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: theme.palette.grey[600],
        },
    },
}));

function DragBlock({
    id,
    parentRef,
    zoomValue,
    setHeightBlock,
    setWidthBlock,
    setHeightParentRef,
    setWidthParentRef,
}) {
    const classes = useStyles();
    const blockRef = useRef();
    const headerRef = useRef();
    const bodyRef = useRef();

    const diagramState = useContext(DiagramContext);
    const {
        blocks,
        lineAddMode,
        lineFromBlockId,
        clearLine,
        addLine,
        setPositionBlock,
        setPositionsInBlock,
        addNewAnswer,
        deleteAnswer,
        changeColorAnswer,
        changeColorHeader,
        deleteBlock,
    } = diagramState;

    const [isDrag, setIsDrag] = useState();

    const onDragBlock = (e, pos) => {
        const { x, y } = pos;
        if (parentRef.clientHeight < blockRef.current?.clientHeight + y) {
            setHeightParentRef(`${blockRef.current?.clientHeight + y}px`);
            setWidthBlock(parentRef.clientWidth);
            setHeightBlock(blockRef.current?.clientHeight + y);
        }
        if (parentRef.clientWidth < blockRef.current?.clientWidth + x) {
            setWidthParentRef(`${blockRef.current?.clientWidth + x}px`);
            setWidthBlock(blockRef.current?.clientWidth + x);
            setHeightBlock(parentRef.clientHeight);
        }
        setPositionBlock(id, x, y);
        setPositionsInBlock(id, x, y);
    };

    useEffect(() => {
        setPositionsInBlock(id, blocks[id].position.x, blocks[id].position.y);
    }, [headerRef.current?.clientHeight, bodyRef.current?.clientHeight, keys(blocks[id].answers).length]);

    return (
        <Draggable
            position={blocks[id].position}
            defaultPosition={blocks[id].position}
            bounds={{
                left: 0, top: 0, right: 5000, bottom: 5000,
            }}
            onDrag={onDragBlock}
            handle="strong"
            scale={zoomValue}
            onStart={() => setIsDrag(true)}
            onStop={() => setIsDrag(false)}
        >
            <Paper
                id={`block${id}`}
                ref={blockRef}
                className={clsx(classes.blockWrapper, isDrag && classes.draggingBlock)}
            >
                <Box
                    id={`header${id}`}
                    className={classes.headerStyle}
                    style={{ backgroundColor: colors[blocks[id].header.color][500] }}
                    ref={headerRef}
                >
                    <TextEditField
                        text={blocks[id].header.text}
                        color={blocks[id].header.color}
                        blockId={id}
                        deleteHandler={() => deleteBlock(id)}
                        changeColor={(color) => changeColorHeader(id, color)}
                    />
                    <strong className={classes.otherField}>
                        <Box />
                    </strong>
                </Box>
                <Box className={classes.bodyStyle} ref={bodyRef}>
                    <strong className={classes.otherField}>
                        <IconButton className={classes.addNewLineButton} onClick={() => addNewAnswer(id)}>
                            <AddCircleOutlined fontSize="small" color="primary" />
                        </IconButton>
                    </strong>
                    <Box display="flex" flexDirection="column" width="90%">
                        {values(blocks[id].answers).map((item) => (
                            <Box
                                id={`answer${item.id}`}
                                className={classes.answerStyle}
                                key={item.id}
                                style={{ backgroundColor: colors[item.color][500] }}
                            >
                                <TextEditField
                                    text={item.text}
                                    line
                                    answerId={item.id}
                                    blockId={id}
                                    color={item.color}
                                    deleteHandler={(answerId) => deleteAnswer(id, answerId)}
                                    changeColor={(color, answerId) => changeColorAnswer(id, answerId, color)}
                                />
                            </Box>
                        ))}
                    </Box>
                </Box>
                <Box className={classes.connectorWrapper}>
                    <Box
                        className={classes.connector}
                        id={id}
                        onMouseUp={() => {
                            if (lineAddMode) {
                                if (lineFromBlockId !== id) {
                                    addLine(id);
                                } else {
                                    clearLine();
                                }
                            }
                        }}
                    />
                </Box>
            </Paper>
        </Draggable>
    );
}

export default observer(DragBlock);
