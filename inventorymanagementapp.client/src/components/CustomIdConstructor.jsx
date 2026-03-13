import React, { useState, useRef, useMemo, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Trash, PlusCircle, GripVertical } from 'react-bootstrap-icons';

const BLOCK_TYPES = [
    { type: 'text', label: 'Text', defaultValue: 'INV-' },
    { type: 'random6', label: '6 numbers (Random)', defaultValue: '' },
    { type: 'random9', label: '9 numbers (Random)' },
    { type: 'random20', label: '20-bit (Random)', defaultValue: '' },
    { type: 'random32', label: '32-bit (Random)' },
    { type: 'date', label: 'Date', defaultValue: 'YYYYMMDD' },
    { type: 'sequence', label: 'Count (+1)', defaultValue: '3' },
    { type: 'guid', label: 'GUID', defaultValue: '' },
];

export default function CustomIdConstructor({ initialTemplate, template, setTemplate, onSave, lastSequenceNumber = 0 }) {
    const [blocks, setBlocks] = useState(initialTemplate ? JSON.parse(initialTemplate) : []);
    const nextIdRef = useRef(blocks.length);

    useEffect(() => {
        const stringified = JSON.stringify(blocks);
        if (stringified !== template) {
            setTemplate(stringified);
        }
    }, [blocks, setTemplate, template]);

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

    const updateBlockValue = (index, val) => {
        const newBlocks = [...blocks];
        newBlocks[index].value = val;
        setBlocks(newBlocks);
    };

    return (
        <div className="card p-3 shadow-sm border-0 bg-transparent">
            <h5 className="mb-3">ID Constructor</h5>

            <div className="alert alert-dark mb-3 border-0 shadow-sm" style={{ backgroundColor: '#1e1e1e' }}>
                <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Preview:</small>
                <code style={{ fontSize: '1.2rem', color: '#4af626', textShadow: '0 0 5px rgba(74, 246, 38, 0.2)' }}>{preview || "Empty template..."}</code>
            </div>

            <div className="d-flex flex-wrap gap-2 mb-4">
                {BLOCK_TYPES.map(bt => (
                    <button key={bt.type} className="btn btn-outline-primary btn-sm rounded-pill" onClick={() => addBlock(bt)}>
                        <PlusCircle className="me-1" /> {bt.label}
                    </button>
                ))}
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="blocks">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="pe-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {blocks.map((block, index) => (
                                <Draggable key={block.id} draggableId={block.id} index={index}>
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.draggableProps} className="d-flex align-items-center bg-white border rounded p-2 mb-2 shadow-sm">
                                            <div {...provided.dragHandleProps} className="me-2 text-muted">
                                                <GripVertical size={20} />
                                            </div>
                                            <div className="flex-grow-1 d-flex align-items-center">
                                                <span className="badge bg-light text-dark border me-2" style={{ minWidth: '80px' }}>{block.type}</span>
                                                {block.type === 'text' || block.type === 'sequence' ? (
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm w-50"
                                                        placeholder={block.type === 'sequence' ? "Padding (e.g. 3)" : "Text..."}
                                                        value={block.value}
                                                        onChange={(e) => updateBlockValue(index, e.target.value)}
                                                    />
                                                ) : (
                                                    <span className="small text-muted italic">Auto-generated value</span>
                                                )}
                                            </div>
                                            <button className="btn btn-link text-danger p-1 ms-2" onClick={() => removeBlock(block.id)}>
                                                <Trash size={18} />
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

            <button className="btn btn-primary mt-3 shadow-sm" onClick={() => onSave()}>
                Confirm & Save Now
            </button>
        </div>
    );
}