import { action, computed, observable } from 'mobx';
import { values } from 'lodash';

export default class DiagramState {
    @observable blocks = {};
    @observable lines = [];
    @observable lineAddMode = false;
    @observable lineFromBlockId = '';
    @observable lineFromAnswerId = '';

    @computed get getBlocks() {
        return values(this.blocks);
    }

    @action.bound
    addNewBlock(id) {
        this.blocks[id] = {
            id,
            header: {
                text: 'Введите текст вопроса',
                color: 'deepOrange',
            },
            inPosition: { x: 0, y: 0 },
            answers: {},
            position: { x: 100, y: 50 },
        };
    }

    @action.bound
    setLineAddMode(mode) {
        this.lineAddMode = mode;
    }

    @action.bound
    setLineColor(answerId) {
        this.lines = this.lines.map((item) => ({
            ...item,
            color: item.fromId.answerId === answerId ? 'deepOrange' : item.color,
        }));
    }

    @action.bound
    clearLineColor() {
        this.lines = this.lines.map((item) => ({
            ...item,
            color: 'grey',
        }));
    }

    @action.bound
    clearLine() {
        this.lineAddMode = false;
        this.lineFromAnswerId = '';
        this.lineFromBlockId = '';
        this.lines = this.lines.filter((line) => !!line.toId.blockId);
    }

    @action.bound
    deleteLine(answerId) {
        this.lines = this.lines.filter((item) => item.fromId.answerId !== answerId);
    }

    @action.bound
    startAddingLine(blockId, answerId) {
        this.lineFromBlockId = blockId;
        this.lineFromAnswerId = answerId;
        this.lineAddMode = true;
        this.lines.push({
            fromId: { blockId, answerId, position: this.blocks[blockId].answers[answerId].position },
            toId: { blockId: '', position: this.blocks[blockId].answers[answerId].position },
            color: 'lightBlue',
        });
    }

    @action.bound
    addLine(id) {
        this.lines = this.lines.map((line) => ({
            ...line,
            toId: {
                ...line.toId,
                blockId: line.fromId.answerId === this.lineFromAnswerId
                    ? id
                    : line.toId.blockId,
                position: line.fromId.answerId === this.lineFromAnswerId
                    ? this.blocks[id].inPosition
                    : line.toId.position,
            },
            color: 'grey',
        }));
        this.lineAddMode = false;
        this.lineFromAnswerId = '';
        this.lineFromBlockId = '';
    }

    @action.bound
    setPositionLine(x, y) {
        this.lines = this.lines.map((line) => ({
            ...line,
            toId: {
                ...line.toId,
                position: line.fromId.answerId === this.lineFromAnswerId
                    ? {
                        x: line.toId.position.x + x,
                        y: line.toId.position.y + y,
                    }
                    : line.toId.position,
            },
        }));
    }

    @action.bound
    setPositionBlock(id, x, y) {
        this.blocks[id].position = { x, y };
    }

    @action.bound
    setPositionsInBlock(id, x, y) {
        this.blocks[id].inPosition = { x, y: y + document.getElementById(`block${id}`).clientHeight * 0.5 };
        this.lines = this.lines.map((line) => ({
            ...line,
            toId: {
                ...line.toId,
                position: line.toId.blockId === id
                    ? { x, y: y + document.getElementById(`block${id}`).clientHeight * 0.5 }
                    : line.toId.position,
            },
        }));
        values(this.blocks[id].answers).forEach((answer, key) => {
            const xPos = x + document.getElementById(`block${id}`).clientWidth;
            const yPos = y + document.getElementById(`header${id}`).clientHeight
                + Object.keys(this.blocks[id].answers).slice(0, key + 1).reduce((acc, item) => (
                    acc + 6 + document.getElementById(`answer${item}`).clientHeight
                ), 0)
                - document.getElementById(`answer${answer.id}`).clientHeight * 0.5;
            this.blocks[id].answers[answer.id].position = { x: xPos, y: yPos };
            this.lines = this.lines.map((line) => ({
                ...line,
                fromId: {
                    ...line.fromId,
                    position: line.fromId.answerId === answer.id ? { x: xPos, y: yPos } : line.fromId.position,
                },
            }));
        });
    }

    @action.bound
    addNewAnswer(id) {
        this.blocks[id].answers[`out${Date.now()}`] = {
            id: `out${Date.now()}`,
            text: 'Текст ответа',
            color: 'yellow',
        };
    }

    @action.bound
    deleteAnswer(id, answerId) {
        this.lines = this.lines.filter((line) => line.fromId.answerId !== answerId);
        delete this.blocks[id].answers[answerId];
    }

    @action.bound
    changeColorAnswer(id, answerId, color) {
        this.blocks[id].answers[answerId].color = color;
    }

    @action.bound
    changeColorHeader(id, color) {
        this.blocks[id].header.color = color;
    }

    @action.bound
    deleteBlock(id) {
        this.lines = this.lines.filter((line) => (
            (line.fromId.blockId !== id) && (line.toId.blockId !== id)
        ));
        delete this.blocks[id];
    }

    @action.bound
    setAnswerText(id, answerId, text) {
        this.blocks[id].answers[answerId].text = text;
    }

    @action.bound
    setHeaderText(id, text) {
        this.blocks[id].header.text = text;
    }

}
