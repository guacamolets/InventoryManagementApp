import React, { useState, useRef, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Trash, PlusCircle, GripVertical } from 'react-bootstrap-icons';

const BLOCK_TYPES = [
    { type: 'text', label: 'Text', defaultValue: 'INV-' },
    { type: 'random6', label: '6 numbers (Random)', defaultValue: '' },
    { type: 'random20', label: '20-bit (Random)', defaultValue: '' },
    { type: 'date', label: 'Date', defaultValue: 'YYYYMMDD' },
    { type: 'sequence', label: 'Count (+1)', defaultValue: '3' },
    { type: 'guid', label: 'GUID', defaultValue: '' },
];

export default function CustomIdConstructor({ initialTemplate, onSave, lastSequenceNumber = 0 }) {
    const [blocks, setBlocks] = useState(initialTemplate ? JSON.parse(initialTemplate) : []);
    const nextIdRef = useRef(0);

    const preview = useMemo(() => {
        return blocks.map(b => {
            if (b.type === 'text') return b.value;
            if (b.type === 'date') return new Date().toISOString().slice(0, 10).replace(/-/g, "");
            if (b.type === 'sequence') {
                const nextNum = (lastSequenceNumber + 1).toString();
                return nextNum.padStart(parseInt(b.value) || 1, '0');
            }
            if (b.type.includes('random')) return "742913";
            if (b.type === 'guid') return "f47ac10b";
            return '';
        }).join('');
    }, [blocks, lastSequenceNumber]);
    
    const addBlock = (typeObj) => {
        const newBlock = {
            id: `block-${nextIdRef.current++}`,
            type: typeObj.type,
            value: typeObj.defaultValue,
            length: typeObj.type === 'sequence' ? 3 : null
        };
        setBlocks([...blocks, newBlock]);
    };

    const removeBlock = (id) => setBlocks(blocks.filter(b => b.id !== id));

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(blocks);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setBlocks(items);
    };

    return (
        <div className="card p-3 shadow-sm">
            <h5>Constructor Custom ID</h5>

            <div className="alert alert-dark mb-3">
                <small className="text-muted d-block">Preview:</small>
                <code style={{ fontSize: '1.2rem' }}>{preview || "Empty template..."}</code>
            </div>

            <div className="d-flex flex-wrap gap-2 mb-4">
                {BLOCK_TYPES.map(bt => (
                    <button key={bt.type} className="btn btn-outline-primary btn-sm" onClick={() => addBlock(bt)}>
                        <PlusCircle className="me-1" /> {bt.label}
                    </button>
                ))}
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="blocks">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            {blocks.map((block, index) => (
                                <Draggable key={block.id} draggableId={block.id} index={index}>
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.draggableProps} className="d-flex align-items-center bg-light border rounded p-2 mb-2">
                                            <div {...provided.dragHandleProps} className="me-2 text-muted">
                                                <GripVertical />
                                            </div>
                                            <div className="flex-grow-1">
                                                <small className="badge bg-secondary me-2">{block.type}</small>
                                                {block.type === 'text' && (
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm d-inline-block w-auto"
                                                        value={block.value}
                                                        onChange={(e) => {
                                                            const newBlocks = [...blocks];
                                                            newBlocks[index].value = e.target.value;
                                                            setBlocks(newBlocks);
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <button className="btn btn-link text-danger p-0" onClick={() => removeBlock(block.id)}>
                                                <Trash />
                                            </button>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            <button className="btn btn-success mt-3" onClick={() => onSave(JSON.stringify(blocks))}>
                Save template
            </button>
        </div>
    );
}