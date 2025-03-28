import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import './Dropzone.css';
import DraggableWrapper from './DraggableWrapper';
import { getComponent, initializeComponentRegistry } from './registry';
import TrashZone from './TrashZone'; // Import the trash zone component


const DropZone = ({url}) => {
    const [droppedComponents, setDroppedComponents] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    // Initialize component registry with persistence
    useEffect(() => {

        initializeComponentRegistry();
        // Load saved components -- comment line out if you want to delete on refresh
        loadSavedComponents();

         // Add global drag detection
         const handleDragStart = () => setIsDragging(true);
         const handleDragEnd = () => setIsDragging(false);
         
         document.addEventListener('dragstart', handleDragStart);
         document.addEventListener('dragend', handleDragEnd);
         
         return () => {
             document.removeEventListener('dragstart', handleDragStart);
             document.removeEventListener('dragend', handleDragEnd);
         };
    }, []);

    const loadSavedComponents = () => {
        try {
            const saved = localStorage.getItem('droppedComponents');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Only set components if we have data to load
                if (parsed && parsed.length > 0) {
                    setDroppedComponents(parsed);
                }
            }
        } catch (error) {
            console.error('Error loading saved components:', error);
        }
    };

    const saveComponents = (components) => {
        try {
            const serializable = components.map(comp => ({
                ...comp,
                component: undefined // Don't serialize the component function
            }));
            localStorage.setItem('droppedComponents', JSON.stringify(serializable));
        } catch (error) {
            console.error('Error saving components:', error);
        }
    };

    const removeComponent = (id) => {
        setDroppedComponents((prev) => {
            const updated = prev.filter((comp) => comp.id !== id);
            saveComponents(updated);
            setIsDragging(false);
            return updated;
        });
    };

    const [{ isOver }, drop] = useDrop({
        accept: 'ITEM',
        drop: (item, monitor) => {
            try {
                const offset = monitor.getSourceClientOffset();
                if (!offset) return;
                
                const dropZoneEl = document.getElementById('dropzone');
                if (!dropZoneEl) return;
                
                const dropZoneRect = dropZoneEl.getBoundingClientRect();
                const position = {
                    x: offset.x - dropZoneRect.left,
                    y: offset.y - dropZoneRect.top
                };

                if (item.moveType === 'move' && item.id) {
                    setDroppedComponents(prev => {
                        const updated = prev.map(comp => 
                            comp.id === item.id 
                                ? { ...comp, position }
                                : comp
                        );
                        saveComponents(updated);
                        return updated;
                    });
                } else {
                    // Register new component
                    if (!window.componentRegistry.has(item.componentType)) {
                        window.componentRegistry.set(item.componentType, item.component);
                    }

                    const newComponent = {
                        id: Date.now(),
                        componentType: item.componentType,
                        props: item.props,
                        position,
                        originalProps: item.originalProps
                    };

                    setDroppedComponents(prev => {
                        const updated = [...prev, newComponent];
                        saveComponents(updated);
                        return updated;
                    });
                }

                return { dropped: true };
            } catch (error) {
                console.error('Error handling drop:', error);
                return { dropped: false };
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver()
        })
    });

    const renderDroppedComponent = (componentInfo) => {
        try {
            const Component = getComponent(componentInfo.componentType);
            console.log(componentInfo)
            if (!Component) {
                console.error(`Component not found: ${componentInfo.componentType}`);
                return null;
            }

            return (
                <DraggableWrapper
                    key={componentInfo.id}
                    type="ITEM"
                    moveType="move"
                    itemData={{
                        id: componentInfo.id,
                        componentType: componentInfo.componentType
                    }}
                >
                    <Component {...componentInfo.originalProps || componentInfo.props} />
                </DraggableWrapper>
            );
        } catch (error) {
            console.error('Error rendering component:', error);
            return null;
        }
    };

    const renderEmbeddedPage = () => {
        console.log(isDragging);
        if (url !== undefined){
            return <div style={{ position: "relative", height: "calc(100vh - 100px)" }}>
            <object data={url} style={{
            width: '100%',
            height: '100%',
            display: 'block',
            border: 'none',
            position: 'absolute',
            top: 0,
            left: 0, 
            zIndex: 1, 
            pointerEvents: isDragging? 'none' : 'auto'
            }}>
            
            Error: embedded data could not be loaded.
            </object>
            </div>;
        }
        return null;
    };

    return (
        <div
            id="dropzone"
            ref={drop}
            className={`dropzone ${isOver ? 'dropzone--active' : ''}`}
        >
            {droppedComponents.map((componentInfo) => (
                <div
                    key={componentInfo.id}
                    className="dropped-component"
                    style={{
                        position: 'absolute',
                        left: `${componentInfo.position.x}px`,
                        top: `${componentInfo.position.y}px`
                    }}
                > 

                    {renderDroppedComponent(componentInfo)}
                </div>
            ))}
            
            {renderEmbeddedPage()}
            {<TrashZone onRemove={removeComponent} />}
            
        </div>
    );


};

export default DropZone;