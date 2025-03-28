import React, { useState, useEffect } from 'react';
import './Dropdown.css';
import DraggableWrapper from './DraggableWrapper';
import { initializeComponentRegistry } from './registry';


const Dropdown = () => {
  const [isHovered1, setIsHovered1] = useState(false);
  const [isHovered2, setIsHovered2] = useState(false);
  const [mainWidgets, setMainWidgets] = useState([]);
  const [submissionWidgets, setSubmissionWidgets] = useState([]);

  // This effect will listen for drag events and close the dropdown when dragging starts
  useEffect(() => {

    const setup = async () => {
      // Initialize the component registry -- async to avoid init errors : TODO skip error-causing widgets
      await initializeComponentRegistry();
      
      // NOTE: USE LITERALS AND NOT VARIABLES FOR PATH NAME -- UPDATE IF FOLDER NAME CHANGES
      try {
        // Import all widgets from the main widgets folder
        const mainWidgetsModules = import.meta.glob('./widgets/*.jsx', { eager: true });
        const mainWidgetComponents = Object.entries(mainWidgetsModules).map(([path, module]) => {
          const componentName = path.split('/').pop().replace(/\.jsx$/, '');
          return {
            Component: module.default,
            key: componentName
          };
        });
        setMainWidgets(mainWidgetComponents);
        
        // Import all widgets from the submission widgets folder
        const submissionWidgetsModules = import.meta.glob('./submission-widgets/*.jsx', { eager: true });
        const submissionWidgetComponents = Object.entries(submissionWidgetsModules).map(([path, module]) => {
          const componentName = path.split('/').pop().replace(/\.jsx$/, '');
          return {
            Component: module.default,
            key: componentName
          };
        });
        setSubmissionWidgets(submissionWidgetComponents);
      } catch (error) {
        console.error('Error importing widgets:', error);
      }
    }

    setup()
    const handleDragEnter = () => {
      setIsHovered1(false); // Close the dropdown when drag enters anywhere\
      setIsHovered2(false);
    };
    

    const handleDragLeave = () => {
      // Doesnt do anything
    };

    const handleDragEnd = () => {
      setIsHovered1(false); // Close the dropdown after the drag ends
      setIsHovered2(false);
    };

    // Add event listeners for drag events
    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('dragend', handleDragEnd);

    // Clean up the event listeners when the component unmounts
    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('dragend', handleDragEnd);
    };
  }, []);

  return (
    <div className='container-box flex w-full '>
      <div
        className="dropdown-container bg-gradient-to-r to-[#003f92] from-blue-300"
        onMouseEnter={() => setIsHovered1(true)}
        onMouseLeave={() => setIsHovered1(false)}
      >
        <div className={`dropdown ${isHovered1 ? 'show ' : ''}`}>
          <div className="dropdown-content">
            {/* Loop through the main widgets */}
            {mainWidgets.map(({ Component, key }) => (
              <DraggableWrapper key={key} type="ITEM">
                <Component />
              </DraggableWrapper>
            ))}
          </div>
        </div>
      </div>
      
      <div
        className="dropdown-container bg-gradient-to-r to-[#9a6dc8] from-purple-900"
        onMouseEnter={() => setIsHovered2(true)}
        onMouseLeave={() => setIsHovered2(false)}
      >
        <div className={`dropdown ${isHovered2 ? 'show -left-1/2 transform -translate-x-1/4' : '-left-1/2 transform -translate-x-1/4'}`}>
          <div className="dropdown-content">
            {/* Loop through the submission widgets */}
            {submissionWidgets.map(({ Component, key }) => (
              <DraggableWrapper key={key} type="ITEM">
                <Component />
              </DraggableWrapper>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dropdown;
