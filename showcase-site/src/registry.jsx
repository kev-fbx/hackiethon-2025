export const initializeComponentRegistry = async () => {
  if (!window.componentRegistry) {
    window.componentRegistry = new Map();
  }
  
  try {
    // Import widgets from the main widgets folder using Vite's import.meta.glob
    const mainWidgetsModules = import.meta.glob('./widgets/*.jsx', { eager: true });
    Object.entries(mainWidgetsModules).forEach(([path, module]) => {
      const component = module.default;
      console.log(component);
      const componentName = component.name
      
      // Add to registry
      window.componentRegistry.set(componentName.toUpperCase(), component);
    });
    
    // Import widgets from the submission widgets folder
    const submissionWidgetsModules = import.meta.glob('./submission-widgets/*.jsx', { eager: true });
    Object.entries(submissionWidgetsModules).forEach(([path, module]) => {
      const component = module.default;
      const componentName = component.name;
      // Add to registry
      window.componentRegistry.set(componentName.toUpperCase(), component);
    });
    
    console.log('Available components:', Array.from(window.componentRegistry.keys()));
  } catch (error) {
    console.error('Error with dynamic imports:', error);
  }
};

// Helper function to get a component by type
export const getComponent = (type) => {
  return window.componentRegistry.get(type.toUpperCase());
};


