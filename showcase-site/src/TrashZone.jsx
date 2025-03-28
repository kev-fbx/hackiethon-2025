import { useDrop } from 'react-dnd';
import './TrashZone.css';

const TrashZone = ({ onRemove }) => {
    const [{ isOver }, drop] = useDrop({
        accept: 'ITEM', // Accepts draggable widgets
        drop: (item) => {
            onRemove(item.id); // Call the remove function in DropZone
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    });

    return (
        <div ref={drop} className={`trash-zone ${isOver ? 'trash-zone--active' : ''}`}>
            
        </div>
    );
};

export default TrashZone;
